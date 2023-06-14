import axios from "axios";
import { CreateEmbeddingResponse } from "openai";
interface CreateEmbeddingParams {
  input: string;
  user: string;
}
export class OpenAIClient {
  basePath: string;
  apiKey: string;
  apiVersion: string;
  constructor(basePath: string, apiKey: string, apiVersion: string) {
    this.basePath = basePath;
    this.apiKey = apiKey;
    this.apiVersion = apiVersion;
  }

  embeddings = {
    create: async ({ input, user }: CreateEmbeddingParams) => {
      const { status, data } = await axios.post<CreateEmbeddingResponse>(
        `${this.basePath}/embeddings?api-version=${this.apiVersion}`,
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
