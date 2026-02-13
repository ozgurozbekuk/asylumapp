import mongoose from "mongoose";

const RateLimitBucketSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, index: true },
    count: { type: Number, required: true, default: 1 },
    windowStart: { type: Date, required: true, index: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true },
);

RateLimitBucketSchema.index({ key: 1, windowStart: -1 });

const RateLimitBucket =
  mongoose.models.RateLimitBucket || mongoose.model("RateLimitBucket", RateLimitBucketSchema);

export default RateLimitBucket;

