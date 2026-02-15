export const ingestGovUkSources = async () => {
  return {
    pagesProcessed: 0,
    chunksUpserted: 0,
    pagesSkippedCache: 0,
    pagesSkippedUnchanged: 0,
    errors: [
      {
        path: "GOV.UK ingestion disabled",
        message: "External GOV.UK data pulling is disabled by project decision.",
      },
    ],
  };
};
