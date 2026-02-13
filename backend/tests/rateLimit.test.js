import test from "node:test";
import assert from "node:assert/strict";
import { getRateLimitKey } from "../middleware/rateLimit.js";

test("getRateLimitKey prefers first x-forwarded-for ip", () => {
  const req = {
    headers: {
      "x-forwarded-for": "203.0.113.1, 10.0.0.2",
    },
    ip: "10.0.0.2",
    socket: { remoteAddress: "10.0.0.2" },
  };

  assert.equal(getRateLimitKey(req), "203.0.113.1");
});

test("getRateLimitKey falls back to req.ip then socket", () => {
  const reqWithIp = { headers: {}, ip: "198.51.100.5", socket: { remoteAddress: "10.0.0.3" } };
  assert.equal(getRateLimitKey(reqWithIp), "198.51.100.5");

  const reqWithSocket = { headers: {}, ip: "", socket: { remoteAddress: "10.0.0.3" } };
  assert.equal(getRateLimitKey(reqWithSocket), "10.0.0.3");
});

