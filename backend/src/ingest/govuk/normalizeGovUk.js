const normalizeWhitespace = (text) =>
  String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

const stripHtml = (html) => {
  const withBreaks = String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<\/\s*(p|div|section|article|li|h1|h2|h3|h4|h5|h6|tr)>/gi, "\n")
    .replace(/<br\s*\/?\s*>/gi, "\n");

  return normalizeWhitespace(
    withBreaks
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">"),
  );
};

export const normalizeGovUk = (payload = {}) => {
  const title = normalizeWhitespace(payload?.title || "GOV.UK guidance");
  const basePath = String(payload?.base_path || "").trim();
  const contentId = String(payload?.content_id || basePath || title || "govuk-page").trim();
  const lastUpdated = payload?.public_updated_at || null;
  const bodyHtml = payload?.details?.body || "";
  const text = stripHtml(bodyHtml);

  return {
    title,
    text,
    lastUpdated,
    contentId,
  };
};
