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

test("buildChunkQuery includes public sources + current user's uploads", () => {
  const query = buildChunkQuery({ sector: "uk-asylum", sourceFilter: null, userId: "user_123" });
  assert.equal(query.sector, "uk-asylum");
  assert.deepEqual(query.$or, [
    { "metadata.source": { $ne: "USER_UPLOAD" } },
    { "metadata.userId": "user_123" },
  ]);
});

test("buildChunkQuery restricts USER_UPLOAD filter to current user", () => {
  const query = buildChunkQuery({ sector: "uk-asylum", sourceFilter: "USER_UPLOAD", userId: "user_abc" });
  assert.deepEqual(query, {
    sector: "uk-asylum",
    "metadata.source": "USER_UPLOAD",
    "metadata.userId": "user_abc",
  });
});

test("buildChunkQuery keeps explicit non-user source filters unchanged", () => {
  const query = buildChunkQuery({ sector: "uk-asylum", sourceFilter: "GOV.UK", userId: "user_abc" });
  assert.deepEqual(query, {
    sector: "uk-asylum",
    "metadata.source": "GOV.UK",
  });
});

