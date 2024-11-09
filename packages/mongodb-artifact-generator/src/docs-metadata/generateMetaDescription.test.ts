import { assertEnvVars } from "mongodb-rag-core";
import { AzureOpenAI } from "mongodb-rag-core/openai";
import { makeGenerateMetaDescription } from "./generateMetaDescription";

const { OPENAI_ENDPOINT, OPENAI_API_KEY, OPENAI_API_VERSION } = assertEnvVars({
  OPENAI_ENDPOINT: "",
  OPENAI_API_KEY: "",
  OPENAI_API_VERSION: "",
});

jest.mock("mongodb-rag-core/openai", () => {
  return {
    AzureOpenAI: jest.fn().mockImplementation(() => {
      return {
        chat: {
          completions: {
            create: jest.fn(),
          },
        },
      };
    }),
  };
});

const openAiClient = new AzureOpenAI({
  apiKey: OPENAI_API_KEY,
  endpoint: OPENAI_ENDPOINT,
  apiVersion: OPENAI_API_VERSION,
});

describe("generateMetaDescription", () => {
  it("should generate a meta description", async () => {
    const generateMetaDescription = makeGenerateMetaDescription({
      openAiClient,
    });
    (openAiClient.chat.completions.create as jest.Mock).mockResolvedValue({
      choices: [
        {
          message: {
            content: "This is a meta description.",
          },
        },
      ],
    });
    const result = await generateMetaDescription({
      text: "This is a test text. The purpose is to determine whether or not the meta description is generated correctly. It should mention that this input is about testing the meta description. So meta!",
      url: "https://example.com",
    });
    expect(result).toMatch(/meta description/);
  });
});
