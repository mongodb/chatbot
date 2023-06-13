import { Configuration, OpenAIApi } from "openai";

class EmbeddingService {
  private embeddingProvider: EmbeddingProvider;
  constructor(embeddingProvider: EmbeddingProvider) {
    this.embeddingProvider = embeddingProvider;
  }

  async createEmbedding(text: string) {
    return await this.embeddingProvider.createEmbedding(text);
  }
}

// Abstract interface for embedding provider to make it easier to swap out
// different providers in the future.
abstract class EmbeddingProvider {
  abstract createEmbedding(text: string): Promise<number[]>;
}

class OpenAIEmbeddingProvider extends EmbeddingProvider {
  private openaiClient: OpenAIApi;

  constructor(endpoint: string, apiKey: string) {
    super();
    const configuration = new Configuration({
      basePath: endpoint, // TODO: validate that this correct..never used endpoint besides their default before
      apiKey: apiKey,
    });
    this.openaiClient = new OpenAIApi(configuration);
  }

  async createEmbedding(text: string) {
    // TODO: do stuff with the openaiClient
    return [1, 2, 3];
  }
}

const openAIProvider = new OpenAIEmbeddingProvider(
  process.env.OPENAI_ENDPOINT!,
  process.env.OPENAI_API_KEY!
);
export const embeddings = new EmbeddingService(openAIProvider);
