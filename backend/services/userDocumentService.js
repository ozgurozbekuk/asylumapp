import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import crypto from "crypto";
import pdf from "pdf-parse";
import { embedBatch } from "./llmProvider.js";
import Chunk from "../models/chunks.js";
import UploadedDocument from "../models/UploadedDocument.js";

// Approx: ~4 chars per token => 600–800 tokens ≈ 2400–3200 chars
const MAX_CHUNK_CHARS = 2800;
const CHUNK_OVERLAP = Math.round(MAX_CHUNK_CHARS * 0.15); // ~15% overlap

const normalizeWhitespace = (text) =>
  text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[\t\f\v]+/g, " ")
    .replace(/ {2,}/g, " ")
    .trim();

const stripRepeatingLines = (pages) => {
  if (pages.length < 2) return pages;

  const counts = new Map();
  const sampleLines = (text) => {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const top = lines.slice(0, 2);
    const bottom = lines.slice(-2);
    return [...top, ...bottom];
  };

  pages.forEach((page) => {
    sampleLines(page.text).forEach((line) => {
      counts.set(line, (counts.get(line) || 0) + 1);
    });
  });

  const threshold = Math.ceil(pages.length * 0.6);
  const repeated = new Set(
    Array.from(counts.entries())
      .filter(([, count]) => count >= threshold)
      .map(([line]) => line),
  );

  return pages.map((page) => {
    if (!repeated.size) return page;
    const filtered = page.text
      .split("\n")
      .filter((line) => !repeated.has(line.trim()))
      .join("\n");
    return { ...page, text: normalizeWhitespace(filtered) };
  });
};

const splitTextIntoChunks = (text, maxChars = MAX_CHUNK_CHARS, overlap = CHUNK_OVERLAP) => {
  const chunks = [];
  let start = 0;
  const length = text.length;

  while (start < length) {
    const end = Math.min(start + maxChars, length);
    const chunkText = text.slice(start, end).trim();
    if (chunkText.length) {
      chunks.push(chunkText);
    }
    if (end === length) break;
    start = end - overlap;
  }

  return chunks;
};

const extractPdfPages = async (buffer) => {
  const pages = [];
  const pagerender = async (pageData) => {
    const textContent = await pageData.getTextContent();
    const pageText = textContent.items.map((item) => item.str).join(" ");
    pages.push({ pageNumber: pageData.pageNumber, text: normalizeWhitespace(pageText) });
    return pageText;
  };

  await pdf(buffer, { pagerender });

  const ordered = pages.sort((a, b) => a.pageNumber - b.pageNumber);
  return ordered.length ? ordered : [{ pageNumber: 1, text: "" }];
};

const extractTxtPages = async (buffer) => {
  const text = normalizeWhitespace(buffer.toString("utf8"));
  return [{ pageNumber: 1, text }];
};

const ensureDir = async (dir) => {
  if (!fsSync.existsSync(dir)) {
    await fs.mkdir(dir, { recursive: true });
  }
};

const createEmbeddingsForBatch = async (texts) => {
  return embedBatch({ inputs: texts });
};

export const saveUploadedDocument = async ({ userId, file, storageDir }) => {
  const docId = crypto.randomUUID();
  const ext = path.extname(file.originalname) || "";
  const safeFilename = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
  const baseDir = path.join(storageDir, userId, docId);
  await ensureDir(baseDir);

  const storagePath = path.join(baseDir, `original${ext}`);
  await fs.writeFile(storagePath, file.buffer);

  let pages = [];
  if (file.mimetype === "application/pdf") {
    pages = await extractPdfPages(file.buffer);
  } else if (file.mimetype === "text/plain") {
    pages = await extractTxtPages(file.buffer);
  } else {
    throw new Error("Unsupported file type. Only PDF and TXT are supported right now.");
  }

  pages = stripRepeatingLines(pages);

  const pageCount = pages.length || 1;
  const fullText = normalizeWhitespace(pages.map((page) => page.text).join("\n\n"));
  if (!fullText) {
    throw new Error("No readable text found in the document.");
  }

  const document = await UploadedDocument.create({
    userId,
    filename: safeFilename,
    mimeType: file.mimetype,
    storagePath,
    pageCount,
    source: "USER_UPLOAD",
    pages,
    fullText,
  });

  return document;
};

export const indexUploadedDocument = async ({ document, userId }) => {
  const chunks = [];
  const pages = document.pages.length
    ? document.pages
    : [{ pageNumber: 1, text: document.fullText }];

  let chunkIndex = 0;

  pages.forEach((page) => {
    const pageChunks = splitTextIntoChunks(page.text);
    pageChunks.forEach((chunkText) => {
      chunks.push({
        text: chunkText,
        pageStart: page.pageNumber,
        pageEnd: page.pageNumber,
        chunkIndex: chunkIndex++,
      });
    });
  });

  if (!chunks.length) {
    throw new Error("No text chunks generated from uploaded document.");
  }

  const batchSize = 50;
  let inserted = 0;
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const embeddings = await createEmbeddingsForBatch(batch.map((item) => item.text));

    const docsToInsert = batch.map((item, idx) => ({
      sourceId: `userdoc:${document._id}:${i + idx}`,
      sector: "uk-asylum",
      language: "en",
      text: item.text,
      embedding: embeddings[idx],
      metadata: {
        source: "USER_UPLOAD",
        docId: document._id.toString(),
        filename: document.filename,
        pageStart: item.pageStart,
        pageEnd: item.pageEnd,
        userId,
        headingPath: [`Document: ${document.filename}`],
        chunkIndex: item.chunkIndex,
      },
    }));

    await Chunk.insertMany(docsToInsert);
    inserted += docsToInsert.length;
  }

  return inserted;
};

export const deleteUploadedDocument = async ({ document, userId }) => {
  if (document.userId !== userId) {
    throw new Error("Unauthorized document deletion.");
  }

  await Chunk.deleteMany({
    "metadata.source": "USER_UPLOAD",
    "metadata.docId": document._id.toString(),
    "metadata.userId": userId,
  });

  if (document.storagePath && fsSync.existsSync(document.storagePath)) {
    const baseDir = path.dirname(document.storagePath);
    await fs.rm(baseDir, { recursive: true, force: true });
  }

  await UploadedDocument.deleteOne({ _id: document._id, userId });
};
