import { assertEnvVars, OpenAI } from "mongodb-rag-core";
import { makeGenerateMetaDescription } from "./generateMetaDescription";

const { OPENAI_ENDPOINT, OPENAI_API_KEY, OPENAI_API_VERSION } = assertEnvVars({
  OPENAI_ENDPOINT: "",
  OPENAI_API_KEY: "",
  OPENAI_API_VERSION: "",
});

const openAiClient = new OpenAI.AzureOpenAI({
  apiKey: OPENAI_API_KEY,
  endpoint: OPENAI_ENDPOINT,
  apiVersion: OPENAI_API_VERSION,
});

describe("generateMetaDescription", () => {
  it("should generate a meta description", async () => {
    const generateMetaDescription = makeGenerateMetaDescription({
      openAiClient,
    });
    const result = await generateMetaDescription({
      text: "This is a test text. The purpose is to determine whether or not the meta description is generated correctly. It should mention that this input is about testing the meta description. So meta!",
      url: "https://example.com",
    });
    expect(result).toMatch(/meta description/);
  });
});
