// models/chunkModel.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const chunkSchema = new Schema(
  {
    // Which document this chunk came from
    sourceId: {
      type: String,
      required: true,
    },

    // Domain / sector (for now: "uk-asylum")
    sector: {
      type: String,
      required: true,
      default: "uk-asylum",
    },

    // Language of the text in this chunk (for future multilingual support)
    language: {
      type: String,
      required: true,
      default: "en",
    },

    // The actual piece of text that will be shown as context
    text: {
      type: String,
      required: true,
      trim: true,
    },

    // The embedding vector returned by the configured embedding provider (array of numbers)
    embedding: {
      type: [Number],
      required: true,
    },

    metadata: {
      source: { type: String },
      url: { type: String },
      pageTitle: { type: String },
      lastUpdated: { type: String },
      fetchedAt: { type: String },
      sectionTitle: { type: String },
      contentId: { type: String },
      contentHash: { type: String },
      userId: { type: String },
      docId: { type: String },
      filename: { type: String },
      pageStart: { type: Number },
      pageEnd: { type: Number },
      // New indexing metadata for smarter RAG
      headingPath: { type: [String] },
      chunkIndex: { type: Number },
      sourceUrl: { type: String },
      title: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

// Helpful index for filtering by sector and source
chunkSchema.index({ sector: 1, sourceId: 1 });
chunkSchema.index({ sector: 1, "metadata.source": 1 });
chunkSchema.index({ "metadata.userId": 1, "metadata.docId": 1 });

const Chunk = mongoose.model("Chunk", chunkSchema);

export default Chunk;
