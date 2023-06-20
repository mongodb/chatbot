import { OpenAiEmbeddingsClient } from "../integrations/openai";
import { logger } from "./logger";
import { stripIndent } from "common-tags";

export interface EmbeddingParams {
  text: string;
  userIp: string;
}

export interface EmbeddingResponse {
  embedding: number[];
}

export class EmbeddingService {
  private embeddingProvider: EmbeddingProvider;
  constructor(embeddingProvider: EmbeddingProvider) {
    this.embeddingProvider = embeddingProvider;
  }

  async createEmbedding({ text, userIp }: EmbeddingParams) {
    return await this.embeddingProvider.createEmbedding({ text, userIp });
  }
}

// Abstract interface for embedding provider to make it easier to swap out
// different providers in the future.
export interface EmbeddingProvider {
  createEmbedding({
    text,
    userIp,
  }: EmbeddingParams): Promise<EmbeddingResponse>;
}

export class OpenAiEmbeddingProvider implements EmbeddingProvider {
  private openAiEmbeddingsClient: OpenAiEmbeddingsClient;

  constructor(openAiEmbeddingsClient: OpenAiEmbeddingsClient) {
    this.openAiEmbeddingsClient = openAiEmbeddingsClient;
  }

  async createEmbedding({
    text,
    userIp,
  }: EmbeddingParams): Promise<EmbeddingResponse> {
    const embeddingRequest = {
      input: text,
      user: userIp,
    };
    let embedding: number[] = [];
    try {
      const res = await this.openAiEmbeddingsClient.create(embeddingRequest);

      embedding = res.data.data[0].embedding;
    } catch (err: any) {
      // Catch axios errors which occur if response 4XX or 5XX
      if (err.response?.status && err.response?.data?.error) {
        const {
          status,
          data: { error },
        } = err.response;
        logger.error(
          stripIndent`OpenAI Embedding API returned an error:
          status: ${status}
          error: ${JSON.stringify(error)}`
        );
        throw new Error("OpenAI Embedding API returned an error");
      }
    }
    return { embedding };
  }
}

// Export singleton instance of embedding service for use in application
const {
  OPENAI_ENDPOINT,
  OPENAI_API_KEY,
  OPENAI_EMBEDDING_DEPLOYMENT,
  OPENAI_EMBEDDING_MODEL_VERSION,
} = process.env;
const openaiClient = new OpenAiEmbeddingsClient(
  OPENAI_ENDPOINT!,
  OPENAI_EMBEDDING_DEPLOYMENT!,
  OPENAI_API_KEY!,
  OPENAI_EMBEDDING_MODEL_VERSION!
);
const openAiEmbeddingProvider = new OpenAiEmbeddingProvider(openaiClient);
export const embeddings = new EmbeddingService(openAiEmbeddingProvider);
