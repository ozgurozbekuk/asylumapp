const DEFAULT_TIMEOUT_MS = 60_000;

const getBaseUrl = () => process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";

const ensureFetchAvailable = () => {
  if (typeof fetch !== "function") {
    throw new Error(
      "Global fetch is not available. Use Node.js 18+ or install and configure undici.",
    );
  }
};

const readBodySafely = async (response) => {
  try {
    return await response.text();
  } catch {
    return "";
  }
};

const postJson = async ({ path, payload, timeoutMs = DEFAULT_TIMEOUT_MS }) => {
  ensureFetchAvailable();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${getBaseUrl()}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await readBodySafely(response);
      throw new Error(
        `Ollama request failed (${path}): status=${response.status}, body=${body || "<empty>"}`,
      );
    }

    return await response.json();
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(
        `Ollama request timed out after ${timeoutMs}ms (${path})`,
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

export async function ollamaChat({
  messages,
  model = process.env.OLLAMA_CHAT_MODEL || "mistral",
  temperature,
  options = {},
}) {
  const mergedOptions = { ...options };
  if (typeof temperature === "number") {
    mergedOptions.temperature = temperature;
  }

  const data = await postJson({
    path: "/api/chat",
    payload: {
      model,
      messages,
      stream: false,
      options: Object.keys(mergedOptions).length ? mergedOptions : undefined,
    },
  });

  return data?.message?.content ?? "";
}

export async function ollamaEmbed({
  input,
  model = process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text",
}) {
  const data = await postJson({
    path: "/api/embeddings",
    payload: {
      model,
      input,
      prompt: Array.isArray(input) ? undefined : input,
    },
  });

  if (Array.isArray(data?.embedding)) {
    return data.embedding;
  }

  if (Array.isArray(data?.data) && Array.isArray(data.data[0]?.embedding)) {
    return data.data[0].embedding;
  }

  throw new Error("Ollama embeddings response missing embedding vector");
}
