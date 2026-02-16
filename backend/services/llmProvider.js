import openai from "./openaiClient.js";

const resolveProvider = () => (process.env.LLM_PROVIDER || "openai").toLowerCase().trim();

const assertSupportedProvider = () => {
  const provider = resolveProvider();
  if (provider !== "openai") {
    throw new Error(
      `Unsupported LLM_PROVIDER "${provider}". Only "openai" is supported in this build.`,
    );
  }
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required when using OpenAI.");
  }
};

export const chat = async ({ messages, temperature, maxTokens }) => {
  assertSupportedProvider();

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_CHAT_MODEL || "gpt-4.1-mini",
    messages,
    temperature: typeof temperature === "number" ? temperature : undefined,
    max_tokens: typeof maxTokens === "number" ? maxTokens : undefined,
  });

  return response?.choices?.[0]?.message?.content ?? "";
};

export const chatStream = async function* ({ messages, temperature, maxTokens }) {
  assertSupportedProvider();

  const stream = await openai.chat.completions.create({
    model: process.env.OPENAI_CHAT_MODEL || "gpt-4.1-mini",
    messages,
    temperature: typeof temperature === "number" ? temperature : undefined,
    max_tokens: typeof maxTokens === "number" ? maxTokens : undefined,
    stream: true,
  });

  for await (const chunk of stream) {
    const token = chunk?.choices?.[0]?.delta?.content || "";
    if (token) {
      yield token;
    }
  }
};

export const embed = async ({ input }) => {
  assertSupportedProvider();

  const response = await openai.embeddings.create({
    model: process.env.OPENAI_EMBED_MODEL || "text-embedding-3-small",
    input,
  });

  return response?.data?.[0]?.embedding || [];
};

export const embedBatch = async ({ inputs }) => {
  assertSupportedProvider();

  if (!Array.isArray(inputs) || inputs.length === 0) {
    return [];
  }

  const response = await openai.embeddings.create({
    model: process.env.OPENAI_EMBED_MODEL || "text-embedding-3-small",
    input: inputs,
  });

  return Array.isArray(response?.data)
    ? response.data.map((item) => item.embedding)
    : [];
};
