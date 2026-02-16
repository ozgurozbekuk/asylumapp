import "dotenv/config";
import mongoose from "mongoose";
import { connectDb } from "../config/db.js";
import Chunk from "../models/chunks.js";
import { RetrievalCache } from "../models/RetrievalCache.js";
import { embedBatch } from "../services/llmProvider.js";

const BATCH_SIZE = Number(process.env.REEMBED_BATCH_SIZE || 50);

const validateEnvironment = () => {
  if (!process.env.MONGO_DB_URI) {
    throw new Error("Missing MONGO_DB_URI in environment");
  }
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY in environment");
  }
  const provider = (process.env.LLM_PROVIDER || "openai").toLowerCase().trim();
  if (provider !== "openai") {
    throw new Error(`LLM_PROVIDER must be "openai" for this script. Received: "${provider}"`);
  }
};

const buildOperations = (batch, vectors) =>
  batch.map((chunkDoc, idx) => ({
    updateOne: {
      filter: { _id: chunkDoc._id },
      update: { $set: { embedding: vectors[idx] } },
    },
  }));

const reembedAllChunks = async () => {
  let processed = 0;
  let updated = 0;
  let skipped = 0;

  const total = await Chunk.countDocuments({});
  console.log(`Found ${total} chunks to re-embed.`);

  const cursor = Chunk.find({}, { _id: 1, text: 1 }).cursor();
  let batch = [];

  for await (const chunkDoc of cursor) {
    if (!chunkDoc?.text?.trim()) {
      skipped += 1;
      continue;
    }

    batch.push(chunkDoc);
    if (batch.length < BATCH_SIZE) continue;

    const vectors = await embedBatch({ inputs: batch.map((item) => item.text) });
    const operations = buildOperations(batch, vectors);
    await Chunk.bulkWrite(operations, { ordered: false });

    processed += batch.length;
    updated += operations.length;
    console.log(`Re-embedded ${processed}/${total} chunks...`);
    batch = [];
  }

  if (batch.length) {
    const vectors = await embedBatch({ inputs: batch.map((item) => item.text) });
    const operations = buildOperations(batch, vectors);
    await Chunk.bulkWrite(operations, { ordered: false });
    processed += batch.length;
    updated += operations.length;
  }

  const cacheDelete = await RetrievalCache.deleteMany({});
  console.log(`Cleared retrieval cache entries: ${cacheDelete.deletedCount || 0}`);

  return { total, processed, updated, skipped };
};

const main = async () => {
  validateEnvironment();
  await connectDb();

  const summary = await reembedAllChunks();
  console.log("Re-embed summary:", summary);

  await mongoose.disconnect();
  process.exit(0);
};

main().catch(async (error) => {
  console.error("Re-embed failed:", error);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
