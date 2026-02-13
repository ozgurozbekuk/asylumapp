export const buildChunkQuery = ({ sector, sourceFilter, userId }) => {
  const query = { sector, "metadata.source": { $ne: "USER_UPLOAD" } };

  if (sourceFilter) {
    // File-upload feature is temporarily disabled; never retrieve uploaded user docs.
    if (sourceFilter !== "USER_UPLOAD") {
      query["metadata.source"] = sourceFilter;
    }
    return query;
  }
  return query;
};
