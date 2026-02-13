import mongoose from "mongoose";

const PageSchema = new mongoose.Schema(
  {
    pageNumber: { type: Number, required: true },
    text: { type: String, required: true },
  },
  { _id: false },
);

const UploadedDocumentSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    storagePath: { type: String, required: true },
    pageCount: { type: Number, required: true, default: 1 },
    source: { type: String, required: true, default: "USER_UPLOAD" },
    pages: { type: [PageSchema], default: [] },
    fullText: { type: String, required: true },
  },
  { timestamps: true },
);

UploadedDocumentSchema.index({ userId: 1, createdAt: -1 });

const UploadedDocument =
  mongoose.models.UploadedDocument || mongoose.model("UploadedDocument", UploadedDocumentSchema);

export default UploadedDocument;
