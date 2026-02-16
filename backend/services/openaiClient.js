import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config({ path: new URL("../.env", import.meta.url) });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default openai;
