import { Configuration, OpenAIApi } from 'openai';
import { logger } from './logger';

interface LlmAnswerQuestionParams {
  messages: Message[];
  chunks: Content[];
}

class LlmService {
  private llmProvider: LlmProvider;
  constructor(llmProvider: LlmProvider) {
    this.llmProvider = llmProvider;
  }

  async answerQuestionStream({ messages, chunks }: LlmAnswerQuestionParams) {
    logger.info('Conversation: ', messages);
    logger.info('Chunks: ', chunks);
    const answer = await this.llmProvider.answerQuestionStream({ messages, chunks });
    logger.info('Answer: ', answer);
    return answer;
  }
  async answerQuestionAwaited({ messages, chunks }: LlmAnswerQuestionParams) {
    logger.info('Conversation: ', messages);
    logger.info('Chunks: ', chunks);
    const answer = await this.llmProvider.answerQuestionAwaited({ messages, chunks });
    logger.info('Answer: ', answer);
    return answer;
  }
}

// Abstract interface for embedding provider to make it easier to swap out
// different providers in the future.
abstract class LlmProvider {
  abstract answerQuestionStream({ messages, chunks }: LlmAnswerQuestionParams): Promise<string>;
  abstract answerQuestionAwaited({ messages, chunks }: LlmAnswerQuestionParams): Promise<string>;
}

class OpenAILlmProvider extends LlmProvider {
  private openaiClient: OpenAIApi;

  constructor(endpoint: string, apiKey: string) {
    super();
    const configuration = new Configuration({
      basePath: endpoint, // TODO: validate that this correct..never used endpoint besides their default before
      apiKey: apiKey,
    });
    this.openaiClient = new OpenAIApi(configuration);
  }

  // NOTE: for streaming implementation, see // NOTE: for example streaming data, see https://github.com/openai/openai-node/issues/18#issuecomment-1369996933
  async answerQuestionStream({ messages, chunks }: LlmAnswerQuestionParams) {
    // TODO: stream in response and then return final answer
    return await 'answer';
  }

  async answerQuestionAwaited({ messages, chunks }: LlmAnswerQuestionParams) {
    // TODO: implement this
    return await 'answer';
  }
}

const openAIProvider = new OpenAILlmProvider(process.env.OPENAI_ENDPOINT!, process.env.OPENAI_API_KEY!);
export const llm = new LlmService(openAIProvider);
