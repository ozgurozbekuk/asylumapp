import express from "express";
import { ingestGovUkSources } from "../src/ingest/govuk/ingestGovUkSources.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.post("/ingest/govuk", requireAdmin, async (req, res) => {
  try {
    const summary = await ingestGovUkSources();
    res.json({ success: true, summary });
  } catch (err) {
    console.error("GOV.UK ingestion failed:", err);
    res.status(500).json({ success: false, error: err.message || "Ingestion failed" });
  }
});

export default router;
