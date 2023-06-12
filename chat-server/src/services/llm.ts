import { Configuration, OpenAIApi } from 'openai';

interface LlmAnswerQuestionParams {
  question: string;
  conversation: Conversation;
  chunks: Content[];
}

class LlmService {
  private llmProvider: LlmProvider;
  constructor(llmProvider: LlmProvider) {
    this.llmProvider = llmProvider;
  }

  async answerQuestion({ question, conversation, chunks }: LlmAnswerQuestionParams) {
    return this.llmProvider.answerQuestion({ question, conversation, chunks });
  }
}

abstract class LlmProvider {
  abstract answerQuestion({ question, conversation, chunks }: LlmAnswerQuestionParams): Promise<string>;
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

  async answerQuestion({ question, conversation, chunks }: LlmAnswerQuestionParams) {
    // TODO: do stuff with the openaiClient
    return 'answer';
  }
}

const openAIProvider = new OpenAILlmProvider(process.env.OPENAI_ENDPOINT!, process.env.OPENAI_API_KEY!);
const llm = new LlmService(openAIProvider);
export { llm };
