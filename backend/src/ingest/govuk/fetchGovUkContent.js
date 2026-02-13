import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CACHE_DIR = path.join(__dirname, "..", "..", "..", "..", "data", "cache", "govuk");
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;
const MIN_REQUEST_INTERVAL_MS = 500;
const MAX_RETRIES = 4;

let lastRequestAt = 0;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const slugifyPath = (pagePath) => {
  const cleaned = (pagePath || "").trim();
  if (!cleaned) return "root";
  return cleaned.replace(/^\//, "").replace(/\/+?/g, "_").replace(/[^a-zA-Z0-9_-]/g, "-") || "root";
};

const buildUserAgent = () => {
  const contactEmail = process.env.GOVUK_CONTACT_EMAIL || "contact@example.com";
  return `AsylumAssistantRAG/1.0 (contact: ${contactEmail})`;
};

const hashPayload = (payload) => {
  const json = typeof payload === "string" ? payload : JSON.stringify(payload);
  return crypto.createHash("sha256").update(json).digest("hex");
};

const readCache = async (cacheFile) => {
  if (!fsSync.existsSync(cacheFile)) return null;
  try {
    const raw = await fs.readFile(cacheFile, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
};

const writeCache = async (cacheFile, envelope) => {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.writeFile(cacheFile, JSON.stringify(envelope, null, 2), "utf8");
};

const fetchWithBackoff = async (url, headers) => {
  let attempt = 0;
  let lastError = null;

  while (attempt <= MAX_RETRIES) {
    if (attempt > 0) {
      const baseDelay = 500 * Math.pow(2, attempt - 1);
      await sleep(baseDelay + Math.floor(Math.random() * 150));
    }

    const response = await fetch(url, { headers });

    if (response.ok) {
      return response.json();
    }

    if (response.status === 429 || response.status >= 500) {
      const retryAfter = response.headers.get("retry-after");
      if (retryAfter) {
        const retryDelay = Number.parseInt(retryAfter, 10);
        if (!Number.isNaN(retryDelay)) {
          await sleep(retryDelay * 1000);
        }
      }
      attempt += 1;
      lastError = new Error(`GOV.UK responded ${response.status}`);
      continue;
    }

    const body = await response.text();
    throw new Error(`Failed to fetch GOV.UK content (${response.status}): ${body.slice(0, 200)}`);
  }

  throw lastError || new Error("Failed to fetch GOV.UK content after retries");
};

export const fetchGovUkContent = async (pagePath, options = {}) => {
  if (!pagePath || typeof pagePath !== "string") {
    throw new Error("fetchGovUkContent requires a GOV.UK path like '/asylum-support'.");
  }

  const normalizedPath = pagePath.startsWith("/") ? pagePath : `/${pagePath}`;
  const url = `https://www.gov.uk/api/content${normalizedPath}`;
  const slug = slugifyPath(normalizedPath);
  const cacheFile = path.join(CACHE_DIR, `${slug}.json`);
  const ttlMs = options.ttlMs || DEFAULT_TTL_MS;

  const cached = await readCache(cacheFile);
  if (cached?.data && cached.fetchedAt) {
    const ageMs = Date.now() - new Date(cached.fetchedAt).getTime();
    if (ageMs < ttlMs) {
      return {
        data: cached.data,
        fromCache: true,
        cacheAgeMs: ageMs,
        fetchedAt: cached.fetchedAt,
        contentHash: cached.contentHash || hashPayload(cached.data),
        url,
      };
    }
  }

  const waitMs = Math.max(0, MIN_REQUEST_INTERVAL_MS - (Date.now() - lastRequestAt));
  if (waitMs > 0) await sleep(waitMs);
  lastRequestAt = Date.now();

  const data = await fetchWithBackoff(url, {
    "user-agent": options.userAgent || buildUserAgent(),
    accept: "application/json",
  });

  const fetchedAt = new Date().toISOString();
  const contentHash = hashPayload(data);

  await writeCache(cacheFile, {
    fetchedAt,
    url,
    path: normalizedPath,
    contentHash,
    data,
  });

  return {
    data,
    fromCache: false,
    cacheAgeMs: 0,
    fetchedAt,
    contentHash,
    url,
  };
};

export const getGovUkCachePath = (pagePath) => {
  const normalizedPath = pagePath.startsWith("/") ? pagePath : `/${pagePath}`;
  const slug = slugifyPath(normalizedPath);
  return path.join(CACHE_DIR, `${slug}.json`);
};
