import {
  assertEnvVars,
  AzureKeyCredential,
  OpenAIClient,
} from "mongodb-rag-core";
import { makeGenerateMetaDescription } from "./generateMetaDescription";

const { OPENAI_ENDPOINT, OPENAI_API_KEY } = assertEnvVars({
  OPENAI_ENDPOINT: "",
  OPENAI_API_KEY: "",
});

const openAiClient = new OpenAIClient(
  OPENAI_ENDPOINT,
  new AzureKeyCredential(OPENAI_API_KEY)
);

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
