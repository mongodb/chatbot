import { OpenAIClient } from "../integrations/openai";
import { logger } from "./logger";
import dotenv from "dotenv";
import { stripIndent } from "common-tags";
dotenv.config();

interface EmbeddingParams {
  text: string;
  userIp: string;
}

interface EmbeddingResponse {
  status: number;
  errorData?: any;
  embeddings?: number[];
}

class EmbeddingService {
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
abstract class EmbeddingProvider {
  abstract createEmbedding({
    text,
    userIp,
  }: EmbeddingParams): Promise<EmbeddingResponse>;
}

export class OpenAIEmbeddingProvider extends EmbeddingProvider {
  private openaiClient: OpenAIClient;

  constructor(openaiClient: OpenAIClient) {
    super();

    this.openaiClient = openaiClient;
  }

  async createEmbedding({ text, userIp }: EmbeddingParams) {
    const embeddingRequest = {
      input: text,
      user: userIp,
    };
    try {
      const res = await this.openaiClient.embeddings.create(embeddingRequest);

      const embeddings = res.data.data[0].embedding;
      const { status } = res;

      return { embeddings, status };
    } catch (err: any) {
      // Catch axios errors which occur if response 4XX or 5XX
      if (err.response?.status && err.response?.data?.error) {
        logger.error(
          stripIndent`OpenAI Embedding API returned an error:
          status: ${err.response.status}
          error: ${err.response.data.error}`
        );
        return {
          status: err.response.status,
          errorData: err.response.data.error,
        };
      }
      // Catch other errors
      logger.error(`Unexpected error: ${err}`);
      return {
        status: 500,
        errorData: { message: "Unexpected error response", err },
      };
    }
  }
}

const {
  OPENAI_ENDPOINT,
  OPENAI_API_KEY,
  OPENAI_EMBEDDING_DEPLOYMENT,
  OPENAI_EMBEDDING_MODEL_VERSION,
} = process.env;
const openaiClient = new OpenAIClient(
  OPENAI_ENDPOINT!,
  OPENAI_EMBEDDING_DEPLOYMENT!,
  OPENAI_API_KEY!,
  OPENAI_EMBEDDING_MODEL_VERSION!
);
const openAIEmbeddingProvider = new OpenAIEmbeddingProvider(openaiClient);
export const embeddings = new EmbeddingService(openAIEmbeddingProvider);
