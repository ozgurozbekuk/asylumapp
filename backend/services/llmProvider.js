import { ollamaChat, ollamaEmbed } from "./ollamaClient.js";

const resolveProvider = () => (process.env.LLM_PROVIDER || "ollama").toLowerCase().trim();

const assertSupportedProvider = () => {
  const provider = resolveProvider();
  if (provider !== "ollama") {
    throw new Error(
      `Unsupported LLM_PROVIDER "${provider}". Only "ollama" is supported in this build.`,
    );
  }
};

export const chat = async ({ messages, temperature, maxTokens }) => {
  assertSupportedProvider();

  const options = {};
  if (typeof maxTokens === "number") {
    options.num_predict = maxTokens;
  }

  return ollamaChat({
    messages,
    model: process.env.OLLAMA_CHAT_MODEL || "mistral",
    temperature,
    options,
  });
};

export const embed = async ({ input }) => {
  assertSupportedProvider();

  return ollamaEmbed({
    input,
    model: process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text",
  });
};
