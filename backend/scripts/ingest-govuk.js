import "dotenv/config";
import mongoose from "mongoose";
import { connectDb } from "../config/db.js";
import { ingestGovUkSources } from "../src/ingest/govuk/ingestGovUkSources.js";

const logSummary = (summary) => {
  console.log("\nGOV.UK ingestion summary:");
  console.log(`- Pages processed: ${summary.pagesProcessed}`);
  console.log(`- Chunks upserted: ${summary.chunksUpserted}`);
  console.log(`- Pages skipped (cache hit): ${summary.pagesSkippedCache}`);
  console.log(`- Pages skipped (unchanged): ${summary.pagesSkippedUnchanged}`);
  if (summary.errors?.length) {
    console.log("- Errors:");
    summary.errors.forEach((err) => {
      console.log(`  * ${err.path}: ${err.message}`);
    });
  }
};

const main = async () => {
  if (!process.env.MONGO_DB_URI) {
    console.error("Missing MONGO_DB_URI in environment");
    process.exit(1);
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error("Missing OPENAI_API_KEY in environment");
    process.exit(1);
  }

  await connectDb();

  const summary = await ingestGovUkSources();
  logSummary(summary);

  await mongoose.disconnect();
  process.exit(0);
};

main().catch((err) => {
  console.error("Fatal GOV.UK ingestion error:", err);
  process.exit(1);
});
