import {
  OpenAIClient,
  AzureKeyCredential,
  ChatMessage,
  GetChatCompletionsOptions,
  ChatCompletions,
} from "@azure/openai";

export type OpenAiMessageRole = "system" | "assistant" | "user";

export interface OpenAiChatMessage extends ChatMessage {
  /** The role of the message in the context of the conversation. */
  role: OpenAiMessageRole;
  /** Response to user's chat message in the context of the conversation. */
  content: string;
}

export interface OpenAiChatClientInterface {
  chatAwaited: (params: ChatParams) => Promise<ChatCompletions>;
  chatStream: (
    params: ChatParams
  ) => Promise<AsyncIterable<Omit<ChatCompletions, "usage">>>;
}

interface ChatParams {
  messages: OpenAiChatMessage[];
  options?: GetChatCompletionsOptions;
}
export class OpenAiChatClient implements OpenAiChatClientInterface {
  deployment: string;
  openAiClient: OpenAIClient;
  constructor(basePath: string, deployment: string, apiKey: string) {
    this.deployment = deployment;
    this.openAiClient = new OpenAIClient(
      basePath,
      new AzureKeyCredential(apiKey)
    );
  }

  async chatAwaited({ messages, options }: ChatParams) {
    const completion = await this.openAiClient.getChatCompletions(
      this.deployment,
      messages,
      options
    );
    return completion;
  }
  async chatStream({ messages, options }: ChatParams) {
    const completionStream = await this.openAiClient.listChatCompletions(
      this.deployment,
      messages,
      options
    );
    return completionStream;
  }
}
