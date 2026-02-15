import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import Chunk from "../models/chunks.js";
import { embed } from "../services/llmProvider.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Config
const MONGO_DB_URI = process.env.MONGO_DB_URI;
const DOCS_DIR = path.join(__dirname, "..", "data", "asylum"); // put your txt files here

// Approx: ~4 chars per token => 600–800 tokens ≈ 2400–3200 chars
const MAX_CHUNK_CHARS = 2800;
const CHUNK_OVERLAP = Math.round(MAX_CHUNK_CHARS * 0.15); // ~15% overlap

// Very lightweight section-aware chunking:
// - detect heading lines (e.g. starting with #, numbers, or ALL CAPS)
// - keep track of current heading path and attach it to each chunk
function splitTextIntoChunksWithHeadings(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");

  const headingCandidates = (line) => {
    const trimmed = line.trim();
    if (!trimmed) return false;
    if (/^#{1,6}\s+/.test(trimmed)) return true;
    if (/^\d+(\.\d+)*\s+/.test(trimmed)) return true;
    if (trimmed.length <= 80 && trimmed === trimmed.toUpperCase()) return true;
    return false;
  };

  const segments = [];
  let currentHeading = [];
  let buffer = "";

  lines.forEach((line) => {
    if (headingCandidates(line)) {
      if (buffer.trim().length) {
        segments.push({ headingPath: [...currentHeading], text: buffer.trim() });
        buffer = "";
      }
      currentHeading = [line.trim()];
    } else {
      buffer += (buffer ? "\n" : "") + line;
    }
  });

  if (buffer.trim().length) {
    segments.push({ headingPath: [...currentHeading], text: buffer.trim() });
  }

  const chunks = [];
  let chunkIndex = 0;

  segments.forEach((segment) => {
    const segmentText = segment.text;
    let start = 0;
    const length = segmentText.length;

    while (start < length) {
      const end = Math.min(start + MAX_CHUNK_CHARS, length);
      const chunkText = segmentText.slice(start, end).trim();
      if (chunkText.length) {
        chunks.push({
          text: chunkText,
          headingPath: segment.headingPath && segment.headingPath.length ? segment.headingPath : [],
          chunkIndex,
        });
        chunkIndex += 1;
      }
      if (end === length) break;
      start = end - CHUNK_OVERLAP;
    }
  });

  return chunks;
}

//Read all txt files from DOCS_DIR

const getAllTextFiles = (dir) => {
  if (!fs.existsSync(dir)) {
    console.error(`Docs directory not found ${dir}`);
    return [];
  }
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith(".txt"))
    .map((f) => path.join(dir, f));

  return files;
};

// Create embeddings for a batch of text
const createEmbeddingsForBatch = async (texts) => {
  return Promise.all(texts.map((text) => embed({ input: text })));
};

//process a single file: read , split ,embed, save chnks

async function processFile(filePath) {
  const fileName = path.basename(filePath);

  console.log(`\nProcessing file: ${fileName}`);

  const fileContent = fs.readFileSync(filePath, "utf8");

  // Normalize newlines
  const normalized = fileContent.replace(/\r\n/g, "\n");

  // Section-aware chunks targeting ~600–800 tokens
  const chunks = splitTextIntoChunksWithHeadings(normalized);

  console.log(`Found ${chunks.length} chunks in ${fileName}`);

  if (chunks.length === 0) return;

  const batchSize = 50;
  let savedCount = 0;

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batchTexts = chunks.slice(i, i + batchSize);

    console.log(
      `Creating embeddings for batch ${i} - ${i + batchTexts.length - 1}`
    );

    const embeddings = await createEmbeddingsForBatch(batchTexts.map((c) => c.text));

    const docsToInsert = batchTexts.map((chunk, idx) => ({
      sourceId: fileName,
      sector: "uk-asylum",
      language: "en",
      text: chunk.text,
      embedding: embeddings[idx],
      metadata: {
        docId: fileName,
        title: fileName,
        headingPath: chunk.headingPath || [],
        chunkIndex: chunk.chunkIndex,
      },
    }));

    await Chunk.insertMany(docsToInsert);
    savedCount += docsToInsert.length;

    console.log(`Inserted ${docsToInsert.length} chunks into MongoDB`);
  }

  console.log(`Finished ${fileName}: saved ${savedCount} chunks`);
}

const main = async () => {
  if (!MONGO_DB_URI) {
    console.error("Missing MONGODB_URI in enviroment");
    process.exit(1);
  }

  if ((process.env.LLM_PROVIDER || "ollama").toLowerCase().trim() !== "ollama") {
    console.error("Unsupported LLM_PROVIDER. Only 'ollama' is supported.");
    process.exit(1);
  }

  console.log("Connecting to MongoDb");
  mongoose.connect(MONGO_DB_URI);
  console.log("Connected MongoDB");

  const files = getAllTextFiles(DOCS_DIR);

  if (files.length === 0) {
    console.log(`No .txt files found in ${DOCS_DIR}`);
    await mongoose.disconnect();
    process.exit(0);
  }

  console.log(`Found ${files.length} text files to process.`);

  for (const filePath of files) {
    try {
      await processFile(filePath);
    } catch (err) {
      console.error(`Error processing ${filePath}:`, err);
    }
  }

  console.log("\nAll files processed. Closing MongoDB connection.");
  await mongoose.disconnect();
  process.exit(0);
};

main().catch((err) => {
  console.log("Fatal error:", err);
  process.exit(1);
});
