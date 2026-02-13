import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import openai from "../../../services/openaiClient.js";
import Chunk from "../../../models/chunks.js";
import { fetchGovUkContent } from "./fetchGovUkContent.js";
import { normalizeGovUk } from "./normalizeGovUk.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCES_FILE = path.join(__dirname, "..", "..", "sources", "govuk.sources.json");
const DEFAULT_CHUNK_SIZE = 1200;
const DEFAULT_OVERLAP = 200;

const loadGovUkSources = async () => {
  const raw = await fs.readFile(SOURCES_FILE, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error("govuk.sources.json must be an array of GOV.UK paths.");
  }
  return parsed.map((entry) => String(entry).trim()).filter(Boolean);
};

const splitTextIntoChunks = (text, maxChars = DEFAULT_CHUNK_SIZE, overlap = DEFAULT_OVERLAP) => {
  const chunks = [];
  let start = 0;
  const length = text.length;

  while (start < length) {
    const end = Math.min(start + maxChars, length);
    const chunk = text.slice(start, end).trim();

    if (chunk.length > 0) {
      chunks.push({ start, end, text: chunk });
    }

    if (end === length) break;
    start = end - overlap;
  }

  return chunks;
};

const extractHeadings = (text) => {
  const headings = [];
  const headingRegex = /^##\s+(.+)$/gm;
  let match = null;
  while ((match = headingRegex.exec(text))) {
    headings.push({ index: match.index, title: match[1].trim() });
  }
  return headings;
};

const findSectionTitle = (headings, chunkStart) => {
  if (!headings.length) return null;
  let title = null;
  for (const heading of headings) {
    if (heading.index <= chunkStart) {
      title = heading.title;
    } else {
      break;
    }
  }
  return title;
};

const createEmbeddingsForBatch = async (texts) => {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
  });

  return response.data.map((item) => item.embedding);
};

export const ingestGovUkSources = async ({ sector = "uk-asylum", language = "en" } = {}) => {
  const sources = await loadGovUkSources();

  const summary = {
    pagesProcessed: 0,
    chunksUpserted: 0,
    pagesSkippedCache: 0,
    pagesSkippedUnchanged: 0,
    errors: [],
  };

  for (const pagePath of sources) {
    try {
      const fetchResult = await fetchGovUkContent(pagePath);
      const { data, fromCache, contentHash, fetchedAt, url } = fetchResult;

      const normalized = normalizeGovUk(data);
      const contentId = normalized.contentId || data?.content_id || data?.base_path || pagePath;

      const existing = await Chunk.findOne({
        sector,
        "metadata.contentId": contentId,
        "metadata.contentHash": contentHash,
      }).lean();

      if (existing) {
        if (fromCache) {
          summary.pagesSkippedCache += 1;
        } else {
          summary.pagesSkippedUnchanged += 1;
        }
        continue;
      }

      const headings = extractHeadings(normalized.text);
      const chunks = splitTextIntoChunks(normalized.text, DEFAULT_CHUNK_SIZE, DEFAULT_OVERLAP);

      if (!chunks.length) {
        throw new Error(`No chunks generated for ${pagePath}`);
      }

      await Chunk.deleteMany({ sector, "metadata.contentId": contentId });

      const batchSize = 50;
      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        const batchTexts = batch.map((chunk) => chunk.text);
        const embeddings = await createEmbeddingsForBatch(batchTexts);

        const docs = batch.map((chunk, idx) => {
          const chunkIndex = i + idx;
          const sectionTitle = findSectionTitle(headings, chunk.start);
          return {
            sourceId: `govuk:${contentId}:${chunkIndex}`,
            sector,
            language,
            text: chunk.text,
            embedding: embeddings[idx],
            metadata: {
              source: "GOV.UK",
              url: url || `https://www.gov.uk${pagePath}`,
              pageTitle: normalized.title,
              lastUpdated: normalized.lastUpdated || null,
              fetchedAt: fetchedAt || new Date().toISOString(),
              sectionTitle: sectionTitle || null,
              contentId,
              contentHash,
            },
          };
        });

        await Chunk.insertMany(docs);
        summary.chunksUpserted += docs.length;
      }

      summary.pagesProcessed += 1;
    } catch (err) {
      summary.errors.push({ path: pagePath, message: err.message });
    }
  }

  return summary;
};
