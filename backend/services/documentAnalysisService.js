import { chat, embed } from "./llmProvider.js";
import Chunk from "../models/chunks.js";
import UploadedDocument from "../models/UploadedDocument.js";
import { cosineSimilarity } from "../utils/cosineSimilarity.js";

const GOVUK_QUERY =
  "asylum process screening interview evidence reporting ARC deadlines decision appeal support";

const buildUserContext = (chunks) => {
  return chunks
    .map((chunk, idx) => {
      const meta = chunk.metadata || {};
      const pageLabel = meta.pageStart ? `pp.${meta.pageStart}-${meta.pageEnd || meta.pageStart}` : "uploaded text";
      return `[U${idx + 1}] ${meta.filename || "document"} (${pageLabel})\n${chunk.text}`;
    })
    .join("\n\n---\n\n");
};

const buildGovUkContext = (chunks) => {
  return chunks
    .map((chunk, idx) => {
      const meta = chunk.metadata || {};
      return `[G${idx + 1}] ${meta.pageTitle || "GOV.UK guidance"} (${meta.url || ""})\n${chunk.text}`;
    })
    .join("\n\n---\n\n");
};

const buildCitationRefs = (userChunks, govukChunks) => {
  const userRefs = userChunks.map((chunk, idx) => {
    const meta = chunk.metadata || {};
    return {
      id: `U${idx + 1}`,
      kind: "user",
      filename: meta.filename,
      pageStart: meta.pageStart || null,
      pageEnd: meta.pageEnd || null,
    };
  });

  const govukRefs = govukChunks.map((chunk, idx) => {
    const meta = chunk.metadata || {};
    return {
      id: `G${idx + 1}`,
      kind: "govuk",
      title: meta.pageTitle || "GOV.UK guidance",
      url: meta.url || "",
    };
  });

  return { userRefs, govukRefs };
};

const buildSystemPrompt = () => `You are an assistant that analyzes uploaded asylum documents.
Rules:
- Provide INFORMATION ONLY. Never give legal advice or predict legal outcomes.
- Use only the provided context. If a date or detail is missing, say "Not found in the document".
- For next steps, use cautious language: "You may need to...", "Typically...", "Consider contacting...", "Check official guidance...".
- Every next step MUST cite GOV.UK sources where possible.
- Always encourage the user to speak to a qualified solicitor or regulated adviser for legal advice.
- Never suggest lying, hiding information, or destroying documents.
- Produce JSON only, following the schema.
- For citations in outputs, reference them by IDs like U1, U2 (user doc) or G1, G2 (GOV.UK).

Return JSON with this schema:
{
  "explanation": "string",
  "deadlines": {
    "items": [
      {"dateText": "string", "dateISO": "YYYY-MM-DD or null", "action": "string", "urgency": "high|medium|low", "evidence": "string", "citations": ["U1"]}
    ],
    "notes": "string"
  },
  "nextSteps": [
    {"text": "string", "type": "official|practical|legal-help", "citations": ["G1"]}
  ],
  "citations": ["U1", "G1"]
}`;

export const analyzeUploadedDocument = async ({ userId, docId }) => {
  const document = await UploadedDocument.findOne({ _id: docId, userId }).lean();
  if (!document) {
    throw new Error("Document not found");
  }

  const userChunks = await Chunk.find({
    "metadata.source": "USER_UPLOAD",
    "metadata.userId": userId,
    "metadata.docId": docId,
  }).lean();

  if (!userChunks.length) {
    throw new Error("No indexed chunks found for this document");
  }

  const maxUserChunks = 16;
  const orderedUserChunks = userChunks
    .sort((a, b) => (a.metadata?.pageStart || 0) - (b.metadata?.pageStart || 0))
    .slice(0, maxUserChunks);

  const govukChunks = await Chunk.find({
    "metadata.source": "GOV.UK",
  }).lean();

  const govukContext = [];
  if (govukChunks.length) {
    const queryEmbedding = await embed({ input: GOVUK_QUERY });

    const scored = govukChunks
      .map((chunk) => ({ score: cosineSimilarity(queryEmbedding, chunk.embedding), chunk }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((item) => item.chunk);

    govukContext.push(...scored);
  }

  const userContextText = buildUserContext(orderedUserChunks);
  const govukContextText = buildGovUkContext(govukContext);

  const completionText = await chat({
    temperature: 0.2,
    messages: [
      { role: "system", content: buildSystemPrompt() },
      {
        role: "user",
        content: `User document context:\n${userContextText}\n\nOfficial GOV.UK context:\n${govukContextText}`,
      },
    ],
  });

  const raw = completionText || "{}";
  let parsed = null;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    parsed = {
      explanation: raw,
      deadlines: { items: [], notes: "" },
      nextSteps: [],
      citations: [],
    };
  }

  const { userRefs, govukRefs } = buildCitationRefs(orderedUserChunks, govukContext);
  const citationIndex = [...userRefs, ...govukRefs].reduce((acc, ref) => {
    acc[ref.id] = ref;
    return acc;
  }, {});

  const mapCitationIds = (ids) =>
    (Array.isArray(ids) ? ids : [])
      .map((id) => citationIndex[id])
      .filter(Boolean);

  const normalized = {
    explanation: parsed.explanation || "",
    deadlines: {
      items: Array.isArray(parsed.deadlines?.items)
        ? parsed.deadlines.items.map((item) => ({
            dateText: item.dateText || "Not found in the document",
            dateISO: item.dateISO || null,
            action: item.action || "",
            urgency: item.urgency || "medium",
            evidence: item.evidence || "",
            citations: mapCitationIds(item.citations),
          }))
        : [],
      notes: parsed.deadlines?.notes || "",
    },
    nextSteps: Array.isArray(parsed.nextSteps)
      ? parsed.nextSteps
          .map((item) => ({
            text: item.text || "",
            type: item.type || "official",
            citations: mapCitationIds(item.citations),
          }))
          .filter((item) => item.citations.some((citation) => citation.kind === "govuk" && citation.url))
      : [],
    citations: mapCitationIds(parsed.citations),
  };

  return normalized;
};
