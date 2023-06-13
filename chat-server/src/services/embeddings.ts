import { Configuration, CreateEmbeddingRequest, OpenAIApi } from "openai";

interface EmbeddingParams {
  text: string;
  userIp: string;
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
  }: EmbeddingParams): Promise<number[]>;
}

class OpenAIEmbeddingProvider extends EmbeddingProvider {
  private openaiClient: OpenAIApi;
  private embeddingModel: string;

  constructor(endpoint: string, apiKey: string, embeddingModel: string) {
    super();
    const configuration = new Configuration({
      basePath: endpoint, // TODO: validate that this correct..never used endpoint besides their default before
      apiKey: apiKey,
    });
    this.openaiClient = new OpenAIApi(configuration);
    this.embeddingModel = embeddingModel;
  }

  async createEmbedding({ text, userIp }: EmbeddingParams) {
    const embeddingRequest: CreateEmbeddingRequest = {
      model: this.embeddingModel,
      input: text,
      user: userIp,
    };
    const { status, data } = await this.openaiClient.createEmbedding(
      embeddingRequest
    );
    if (status !== 200) {
      throw new Error(`OpenAI API returned status ${status}`);
    }
    const embeddings = data.data[0].embedding;

    return embeddings;
  }
}

const openAIProvider = new OpenAIEmbeddingProvider(
  process.env.OPENAI_ENDPOINT!,
  process.env.OPENAI_API_KEY!,
  process.env.OPENAI_EMBEDDING_MODEL!
);
export const embeddings = new EmbeddingService(openAIProvider);
