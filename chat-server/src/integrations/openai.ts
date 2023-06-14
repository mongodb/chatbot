// TODO: Consider refactoring to use new Azure OpenAI client SDK - https://www.npmjs.com/package/@azure/openai
import axios from "axios";
import { CreateEmbeddingResponse } from "openai";
interface CreateEmbeddingParams {
  input: string;
  user: string;
}
export class OpenAIClient {
  resourcePath: string;
  apiKey: string;
  apiVersion: string;
  constructor(
    basePath: string,
    deployment: string,
    apiKey: string,
    apiVersion: string
  ) {
    this.resourcePath = basePath + deployment;
    this.apiKey = apiKey;
    this.apiVersion = apiVersion;
  }

  embeddings = {
    create: async ({ input, user }: CreateEmbeddingParams) => {
      const { status, data } = await axios.post<CreateEmbeddingResponse>(
        `${this.resourcePath}/embeddings?api-version=${this.apiVersion}`,
        {
          input,
          user,
        },
        {
          headers: {
            "api-key": this.apiKey,
            "Content-Type": "application/json",
          },
        }
      );
      return { status, data };
    },
  };
}
