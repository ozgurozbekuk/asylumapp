export const buildChunkQuery = ({ sector, sourceFilter, userId }) => {
  // Retrieval is intentionally fixed to bundled corpus chunks for MVP.
  // Ignore dynamic source filters and uploaded-document sources.
  return { sector, "metadata.source": { $ne: "USER_UPLOAD" } };
};
