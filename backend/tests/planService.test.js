import test from "node:test";
import assert from "node:assert/strict";
import { canUploadDocuments, getPlanPolicy, normalizePlan } from "../services/planService.js";

test("normalizePlan preserves valid plans and defaults missing plan to free", () => {
  assert.equal(normalizePlan("pro"), "pro");
  assert.equal(normalizePlan("plus"), "plus");
  assert.equal(normalizePlan("free"), "free");
  assert.equal(normalizePlan(undefined), "free");
});

test("canUploadDocuments allows only non-free plans", () => {
  assert.equal(canUploadDocuments("free"), false);
  assert.equal(canUploadDocuments("plus"), true);
  assert.equal(canUploadDocuments("pro"), true);
});

test("getPlanPolicy provides free quotas and unlimited plus/pro quotas", () => {
  const freePolicy = getPlanPolicy("free");
  assert.equal(freePolicy.limits.newChatsPerDay, 2);
  assert.equal(freePolicy.limits.questionsPerChatPerDay, 6);
  assert.equal(freePolicy.features.documentUpload, false);

  const plusPolicy = getPlanPolicy("plus");
  assert.equal(plusPolicy.limits.newChatsPerDay, null);
  assert.equal(plusPolicy.limits.questionsPerChatPerDay, null);
  assert.equal(plusPolicy.features.documentUpload, true);
});
