import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config({ path: new URL("../.env", import.meta.url) });
//create a single shared OpenAI client instance

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default openai;
