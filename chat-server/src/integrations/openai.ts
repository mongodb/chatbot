// TODO: Consider refactoring to use new Azure OpenAi client SDK - https://www.npmjs.com/package/@azure/openai
import axios from "axios";
import { CreateEmbeddingResponse as OpenAiEmbeddingResponse } from "openai";
interface CreateEmbeddingParams {
  input: string;
  user: string;
}
interface CreateEmbeddingResponse {
  data: OpenAiEmbeddingResponse;
  status: number;
}

interface OpenAiEmbeddingsClientInterface {
  create: (params: CreateEmbeddingParams) => Promise<CreateEmbeddingResponse>;
}
export class OpenAiEmbeddingsClient implements OpenAiEmbeddingsClientInterface {
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

  async create({ input, user }: CreateEmbeddingParams) {
    const { status, data } = await axios.post<OpenAiEmbeddingResponse>(
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
  }
}
