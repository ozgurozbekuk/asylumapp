import test from "node:test";
import assert from "node:assert/strict";
import {
  appendCitationLabel,
  buildInsufficientUkInfoAnswer,
  deriveCitationLabel,
  removeFilenameSourceLines,
  removeInternalFilenames,
  sanitizeRagAnswer,
} from "../services/ragAnswerPolicy.js";

test("1) UK lawyer question should stay UK-only (no Turkey mention)", () => {
  const question = "UK’de iltica avukatı nasıl bulurum?";
  const raw =
    "UK icin Law Society ve Citizens Advice kaynaklarina bakin. Turkiye'de baro listeleri de yardimci olabilir.";

  const sanitized = sanitizeRagAnswer({ answer: raw, question });
  assert.equal(/turkiye|türkiye|turkey/i.test(sanitized), false);
  assert.equal(/law society|citizens advice/i.test(sanitized), true);
});

test("2) Response should be filename-free and at most one 'Source: GOV.UK' line", () => {
  const question = "Gonullu donus sonrasi dependent vize alabilir miyim?";
  const raw =
    "Bunu voluntary-return-overview.txt ve another-file.md temelinde degerlendirebiliriz. Kaynaklar: voluntary-return-overview.txt";
  const selected = [{ chunk: { metadata: { url: "https://www.gov.uk/example", source: "GOV.UK" } } }];

  const citationLabel = deriveCitationLabel(selected);
  let out = sanitizeRagAnswer({ answer: raw, question });
  out = appendCitationLabel(out, citationLabel);

  assert.equal(/\b[\w-]+\.(txt|md|pdf|docx)\b/i.test(out), false);
  const sourceLines = out.match(/^Source:\s*GOV\.UK$/gim) || [];
  assert.equal(sourceLines.length, 1);
});

test("3) Insufficient retrieval fallback must recommend UK official guidance", () => {
  const answer = buildInsufficientUkInfoAnswer("Can I apply after returning voluntarily?");
  assert.equal(/enough UK-specific evidence|uk-specific/i.test(answer), true);
  assert.equal(/gov\.uk|citizens advice/i.test(answer), true);
});

test("4) Sanitizer removes internal filenames like voluntary-return-overview.txt", () => {
  const out = removeInternalFilenames("See voluntary-return-overview.txt before applying.");
  assert.equal(out.includes("voluntary-return-overview.txt"), false);
});

test("5) 'Kaynaklar:' lines with filenames are removed", () => {
  const input = "Yanit metni.\nKaynaklar: voluntary-return-overview.txt, notes.md\nSon satir.";
  const out = removeFilenameSourceLines(input);
  assert.equal(/Kaynaklar:/i.test(out), false);
  assert.equal(/Yanit metni\./.test(out), true);
  assert.equal(/Son satir\./.test(out), true);
});

