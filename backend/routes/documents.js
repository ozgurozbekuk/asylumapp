import express from "express";
import multer from "multer";
import path from "path";
import { z } from "zod";
import UploadedDocument from "../models/UploadedDocument.js";
import { saveUploadedDocument, indexUploadedDocument, deleteUploadedDocument } from "../services/userDocumentService.js";
import { analyzeUploadedDocument } from "../services/documentAnalysisService.js";
import { requirePlanFeature } from "../middleware/planGuard.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: (Number(process.env.MAX_UPLOAD_MB) || 12) * 1024 * 1024 },
});

const allowedMimeTypes = new Set(["application/pdf", "text/plain"]);

const analyzeSchema = z.object({
  // reserved for future fields; currently empty but enforces object shape
});

router.get("/documents", async (req, res) => {
  const userId = req.auth.userId;
  const docs = await UploadedDocument.find({ userId })
    .select("filename mimeType pageCount createdAt")
    .sort({ createdAt: -1 })
    .lean();
  res.json({ documents: docs });
});

router.post(
  "/documents/upload",
  requirePlanFeature("documentUpload", "Document uploads are available on Plus/Pro plans only."),
  upload.single("file"),
  async (req, res) => {
    try {
      const userId = req.auth.userId;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: "File is required" });
      }

      if (!allowedMimeTypes.has(file.mimetype)) {
        return res.status(400).json({ message: "Unsupported file type. Use PDF or TXT." });
      }

      const ext = path.extname(file.originalname || "").toLowerCase();
      if (![".pdf", ".txt"].includes(ext)) {
        return res.status(400).json({ message: "Unsupported file extension. Use .pdf or .txt." });
      }

      const storageDir = process.env.STORAGE_DIR || path.join(process.cwd(), "data", "uploads");

      const document = await saveUploadedDocument({ userId, file, storageDir });
      const chunksUpserted = await indexUploadedDocument({ document, userId });

      res.status(201).json({ document, chunksUpserted });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Upload failed:", err);
      res.status(500).json({ message: "Upload failed" });
    }
  },
);

router.post("/documents/:id/analyze", async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;

    const parseResult = analyzeSchema.safeParse(req.body || {});
    if (!parseResult.success) {
      return res.status(400).json({ message: "Invalid request body", issues: parseResult.error.issues });
    }

    const analysis = await analyzeUploadedDocument({ userId, docId: id });
    res.json({ analysis });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Analyze failed:", err);
    res.status(500).json({ message: "Analysis failed" });
  }
});

router.delete("/documents/:id", async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;

    const document = await UploadedDocument.findOne({ _id: id, userId });
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    await deleteUploadedDocument({ document, userId });
    res.json({ success: true });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Delete failed:", err);
    res.status(500).json({ message: "Delete failed" });
  }
});

export default router;
