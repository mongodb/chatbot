import "dotenv/config";
import { AzureOpenAI } from "openai";
import { assertEnvVars, AzureKeyCredential } from "mongodb-rag-core";
import { z } from "zod";
import { makeAnalyzer } from "./Analyzer";

const {
  OPENAI_ENDPOINT,
  OPENAI_API_KEY,
  OPENAI_CHAT_COMPLETION_MODEL_VERSION,
  OPENAI_CHAT_COMPLETION_DEPLOYMENT,
} = assertEnvVars({
  MONGODB_DATABASE_NAME: "",
  MONGODB_CONNECTION_URI: "",
  OPENAI_ENDPOINT: "",
  OPENAI_API_KEY: "",
  OPENAI_CHAT_COMPLETION_MODEL_VERSION: "",
  OPENAI_CHAT_COMPLETION_DEPLOYMENT: "",
});

const openAiClient = new AzureOpenAI({
  apiVersion: OPENAI_CHAT_COMPLETION_MODEL_VERSION,
  deployment: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  endpoint: OPENAI_ENDPOINT,
  // baseURL: OPENAI_ENDPOINT,
  apiKey: new AzureKeyCredential(OPENAI_API_KEY).key,
});

const TestAnalysisSchema = z.object({
  topics: z.array(z.string()),
  pii: z.boolean(),
});

jest.setTimeout(20000);

describe("Analyzer", () => {
  it("creates a structured analysis defined by a provided zod schema", async () => {
    const analyze = makeAnalyzer({
      openAi: {
        client: openAiClient,
        model: OPENAI_CHAT_COMPLETION_MODEL_VERSION,
      },
      zodSchema: TestAnalysisSchema,
    });
    const analysis = await analyze(
      "MongoDB is a great database! It makes it so easy to store my SSN, which is 123-45-6789!"
    );
    expect(analysis.pii).toBe(true);
    expect(analysis.topics.some((topic) => topic === "MongoDB")).toBe(true);
  });
});
