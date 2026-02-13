import mongoose from "mongoose";

const { Schema } = mongoose;

const cacheItemSchema = new Schema(
  {
    chunkId: { type: Schema.Types.ObjectId, ref: "Chunk", required: true },
    score: { type: Number, required: true },
    text: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { _id: false },
);

const retrievalCacheSchema = new Schema(
  {
    userId: { type: String, default: null, index: true },
    sector: { type: String, required: true },
    sourceFilter: { type: String, default: null },
    queryHash: { type: String, required: true, index: true },
    normalizedQuery: { type: String, required: true },
    docIndexVersion: { type: String, required: true },
    items: { type: [cacheItemSchema], required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true },
);

retrievalCacheSchema.index(
  { userId: 1, sector: 1, sourceFilter: 1, queryHash: 1, docIndexVersion: 1 },
  { unique: true },
);

export const RetrievalCache =
  mongoose.models.RetrievalCache || mongoose.model("RetrievalCache", retrievalCacheSchema);

