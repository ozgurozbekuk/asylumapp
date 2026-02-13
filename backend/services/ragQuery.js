export const buildChunkQuery = ({ sector, sourceFilter, userId }) => {
  const query = { sector };

  if (sourceFilter) {
    query["metadata.source"] = sourceFilter;

    // Never allow cross-user access for uploaded documents.
    if (sourceFilter === "USER_UPLOAD") {
      query["metadata.userId"] = userId || "__missing_user__";
    }

    return query;
  }

  // Without explicit source filter:
  // - include public sources
  // - include only current user's uploads
  if (userId) {
    query.$or = [
      { "metadata.source": { $ne: "USER_UPLOAD" } },
      { "metadata.userId": userId },
    ];
    return query;
  }

  // Anonymous or missing user context: never include user uploads.
  query["metadata.source"] = { $ne: "USER_UPLOAD" };
  return query;
};

