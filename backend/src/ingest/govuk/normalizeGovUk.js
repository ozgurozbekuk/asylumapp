const decodeEntities = (text) => {
  if (!text) return "";
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\u00a0/g, " ");
};

const normalizeWhitespace = (text) =>
  text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/[\t\f\v]+/g, " ")
    .replace(/ {2,}/g, " ")
    .trim();

const htmlToText = (html) => {
  if (!html) return "";
  let text = html;

  text = text.replace(/<script[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[\s\S]*?<\/style>/gi, "");

  text = text.replace(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, (_, heading) => {
    const cleaned = normalizeWhitespace(decodeEntities(heading));
    return `\n## ${cleaned}\n`;
  });

  text = text.replace(/<br\s*\/?>(\n)?/gi, "\n");
  text = text.replace(/<\/p>/gi, "\n");
  text = text.replace(/<\/li>/gi, "\n");

  text = text.replace(/<[^>]+>/g, " ");

  text = decodeEntities(text);

  return normalizeWhitespace(text);
};

const collectBodyHtml = (apiJson) => {
  const details = apiJson?.details || {};
  const segments = [];

  if (typeof details.body === "string") segments.push(details.body);
  if (typeof details.description === "string") segments.push(details.description);
  if (typeof details.summary === "string") segments.push(details.summary);
  if (typeof details.introduction === "string") segments.push(details.introduction);
  if (typeof details.contents === "string") segments.push(details.contents);

  if (Array.isArray(details.parts)) {
    details.parts.forEach((part) => {
      if (part?.title) segments.push(`<h2>${part.title}</h2>`);
      if (part?.body) segments.push(part.body);
    });
  }

  if (Array.isArray(details.steps)) {
    details.steps.forEach((step) => {
      if (step?.title) segments.push(`<h2>${step.title}</h2>`);
      if (step?.contents) segments.push(step.contents);
      if (step?.body) segments.push(step.body);
    });
  }

  if (typeof apiJson?.body === "string") segments.push(apiJson.body);
  if (typeof apiJson?.description === "string") segments.push(apiJson.description);
  if (typeof apiJson?.summary === "string") segments.push(apiJson.summary);

  return segments.filter(Boolean).join("\n");
};

const extractLastUpdated = (apiJson) => {
  return (
    apiJson?.public_updated_at ||
    apiJson?.updated_at ||
    apiJson?.details?.updated_at ||
    apiJson?.details?.public_updated_at ||
    null
  );
};

export const normalizeGovUk = (apiJson) => {
  if (!apiJson || typeof apiJson !== "object") {
    throw new Error("normalizeGovUk expected a JSON object from the GOV.UK Content API.");
  }

  const title = apiJson.title || apiJson.details?.title || "Untitled GOV.UK guidance";
  const lastUpdated = extractLastUpdated(apiJson);
  const contentId = apiJson.content_id || apiJson.details?.content_id || apiJson.base_path || null;

  const html = collectBodyHtml(apiJson);
  const text = htmlToText(html);

  if (!text || text.trim().length === 0) {
    throw new Error("normalizeGovUk produced empty text. Check GOV.UK content fields.");
  }

  return {
    title,
    text,
    lastUpdated,
    contentId,
  };
};
