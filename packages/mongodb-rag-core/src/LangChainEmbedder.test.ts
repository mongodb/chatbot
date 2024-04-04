import "dotenv/config";
import { Embeddings } from "@langchain/core/embeddings";
import { makeLangChainEmbedder } from "./LangChainEmbedder";
import { AzureOpenAIEmbeddings } from "@langchain/azure-openai";
import { CORE_ENV_VARS } from "./CoreEnvVars";
import { assertEnvVars } from "./assertEnvVars";
import { AzureKeyCredential } from "@azure/openai";

const { OPENAI_ENDPOINT, OPENAI_API_KEY, OPENAI_EMBEDDING_DEPLOYMENT } =
  assertEnvVars(CORE_ENV_VARS);

jest.setTimeout(10000);
describe("LangChainEmbedder", () => {
  it("embeds text", async () => {
    // how to mock the Embeddings class?
    const langChainEmbeddings = {
      embedQuery: jest.fn().mockResolvedValue([1, 2, 3]),
    } as unknown as Embeddings;
    const embedder = makeLangChainEmbedder({ langChainEmbeddings });
    const result = await embedder.embed({ text: "hello" });
    expect(result).toEqual({ embedding: [1, 2, 3] });
  });
  it("works with Azure OpenAI", async () => {
    // how to mock the Embeddings class?
    const azureEmbeddings = new AzureOpenAIEmbeddings({
      azureOpenAIEndpoint: OPENAI_ENDPOINT,
      azureOpenAIApiDeploymentName: OPENAI_EMBEDDING_DEPLOYMENT,
      credentials: new AzureKeyCredential(OPENAI_API_KEY),
      maxRetries: 0,
    });

    const embedder = makeLangChainEmbedder({
      langChainEmbeddings: azureEmbeddings,
    });

    const result = await embedder.embed({ text: "hello" });
    expect(result).toEqual({
      embedding: expect.arrayContaining([expect.any(Number)]),
    });
  });
});
