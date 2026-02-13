import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { normalizeGovUk } from "../src/ingest/govuk/normalizeGovUk.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fixturePath = path.join(__dirname, "..", "data", "fixtures", "govuk-sample.json");

const main = async () => {
  const raw = await fs.readFile(fixturePath, "utf8");
  const json = JSON.parse(raw);
  const normalized = normalizeGovUk(json);

  if (!normalized.text || normalized.text.length < 20) {
    throw new Error("normalizeGovUk produced insufficient text for fixture");
  }

  if (!normalized.title) {
    throw new Error("normalizeGovUk did not extract a title");
  }

  console.log("normalizeGovUk fixture check passed.");
};

main().catch((err) => {
  console.error("normalizeGovUk fixture check failed:", err);
  process.exit(1);
});
