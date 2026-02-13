const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

const buildUrl = (path) => `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

export const apiRequest = async ({ path, method = "GET", body, getToken, userId, headers = {} }) => {
  const token = typeof getToken === "function" ? await getToken() : null;

  const response = await fetch(buildUrl(path), {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(userId ? { "x-clerk-user-id": userId } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof payload === "string" ? payload : payload?.message;
    throw new Error(message || `Request failed (${response.status})`);
  }

  return payload;
};
