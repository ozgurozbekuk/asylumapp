import { API_BASE_URL } from "../config/env";

const buildUrl = (path) => `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
const REQUEST_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS || 70000);

export const apiRequest = async ({ path, method = "GET", body, getToken, userId, headers = {} }) => {
  const token = typeof getToken === "function" ? await getToken() : null;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const url = buildUrl(path);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(userId ? { "x-clerk-user-id": userId } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const isJson = response.headers.get("content-type")?.includes("application/json");
    const payload = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const message = typeof payload === "string" ? payload : payload?.message;
      throw new Error(message || `Request failed (${response.status})`);
    }

    return payload;
  } catch (err) {
    if (err?.name === "AbortError") {
      throw new Error(`Request timed out after ${REQUEST_TIMEOUT_MS}ms (${url})`);
    }
    if (err instanceof TypeError) {
      throw new Error(`Network error while contacting API (${url})`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
};
