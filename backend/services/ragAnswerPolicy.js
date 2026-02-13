const INTERNAL_FILENAME_PATTERN = /\b[\w-]+\.(txt|md|pdf|docx)\b/gi;
const TURKEY_PATTERN = /\b(türkiye|turkiye|turkey)\b/i;

const isLikelyTurkish = (text) => /[çğıöşüİ]/i.test(text || "") || /\b(avukat|siginma|gocmen|hukuk)\b/i.test(text || "");

export const questionMentionsTurkey = (question) => TURKEY_PATTERN.test(question || "");

export const removeInternalFilenames = (text) => (text || "").replace(INTERNAL_FILENAME_PATTERN, "").trim();

export const removeFilenameSourceLines = (text) => {
  const lines = String(text || "").split("\n");
  return lines
    .filter((line) => {
      const startsLikeSources = /^(sources:|kaynaklar:)/i.test(line.trim());
      const hasFilename = INTERNAL_FILENAME_PATTERN.test(line);
      INTERNAL_FILENAME_PATTERN.lastIndex = 0;
      return !(startsLikeSources && hasFilename);
    })
    .join("\n");
};

export const removeTurkeySentencesIfNotAsked = (text, question) => {
  if (questionMentionsTurkey(question)) return text || "";
  const raw = String(text || "");
  if (!TURKEY_PATTERN.test(raw)) return raw;

  const sentences = raw.split(/(?<=[.!?])\s+|\n+/).filter(Boolean);
  const filtered = sentences.filter((sentence) => !TURKEY_PATTERN.test(sentence));
  return filtered.join(" ").trim();
};

export const normalizeAnswerWhitespace = (text) =>
  String(text || "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+([.,!?;:])/g, "$1")
    .trim();

export const buildInsufficientUkInfoAnswer = (question) => {
  if (isLikelyTurkish(question)) {
    return [
      "Bu soruya yanit vermek icin yeterli UK-ozel kaynak bulamadim.",
      "Lutfen GOV.UK ve Citizens Advice kaynaklarini kontrol edin ve gerekiyorsa yetkili bir gocmenlik uzmani/solicitor ile gorusun.",
    ].join(" ");
  }
  return [
    "I do not have enough UK-specific evidence in the retrieved context to answer this safely.",
    "Please check GOV.UK and Citizens Advice, and speak with a regulated immigration adviser or solicitor if needed.",
  ].join(" ");
};

export const deriveCitationLabel = (selectedChunks = []) => {
  const hasGovUk = selectedChunks.some((item) => {
    const meta = item?.chunk?.metadata || item?.metadata || {};
    const source = String(meta.source || "").toLowerCase();
    const publisher = String(meta.publisher || "").toLowerCase();
    const url = String(meta.url || meta.sourceUrl || "").toLowerCase();
    return source === "gov.uk" || publisher === "gov.uk" || url.includes("gov.uk");
  });

  return hasGovUk ? "GOV.UK" : null;
};

export const appendCitationLabel = (answer, citationLabel) => {
  const base = normalizeAnswerWhitespace(answer);
  if (!citationLabel) return base;

  const citationLine = `Source: ${citationLabel}`;
  if (new RegExp(`^Source:\\s*${citationLabel}$`, "im").test(base)) return base;
  return `${base}\n\n${citationLine}`.trim();
};

export const sanitizeRagAnswer = ({ answer, question }) => {
  let output = String(answer || "");
  output = removeInternalFilenames(output);
  output = removeFilenameSourceLines(output);
  output = removeTurkeySentencesIfNotAsked(output, question);
  output = normalizeAnswerWhitespace(output);
  return output;
};

