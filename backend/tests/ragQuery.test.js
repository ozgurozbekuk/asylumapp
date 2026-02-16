import test from "node:test";
import assert from "node:assert/strict";
import { buildChunkQuery } from "../services/ragQuery.js";

test("buildChunkQuery excludes user uploads when user context is missing", () => {
  const query = buildChunkQuery({ sector: "uk-asylum", sourceFilter: null, userId: null });
  assert.deepEqual(query, {
    sector: "uk-asylum",
    "metadata.source": { $ne: "USER_UPLOAD" },
  });
});

test("buildChunkQuery excludes user uploads even with user context", () => {
  const query = buildChunkQuery({ sector: "uk-asylum", sourceFilter: null, userId: "user_123" });
  assert.deepEqual(query, {
    sector: "uk-asylum",
    "metadata.source": { $ne: "USER_UPLOAD" },
  });
});

test("buildChunkQuery ignores USER_UPLOAD source filter while upload is disabled", () => {
  const query = buildChunkQuery({ sector: "uk-asylum", sourceFilter: "USER_UPLOAD", userId: "user_abc" });
  assert.deepEqual(query, {
    sector: "uk-asylum",
    "metadata.source": { $ne: "USER_UPLOAD" },
  });
});

test("buildChunkQuery keeps explicit non-user source filters unchanged", () => {
  const query = buildChunkQuery({ sector: "uk-asylum", sourceFilter: "GOV.UK", userId: "user_abc" });
  assert.deepEqual(query, {
    sector: "uk-asylum",
    "metadata.source": { $ne: "USER_UPLOAD" },
  });
});
