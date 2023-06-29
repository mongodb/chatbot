import axios from "axios";
import { CreateEmbeddingResponse as OpenAiEmbeddingResponse } from "openai";
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

interface CreateEmbeddingParams {
  input: string;
  user: string;
}
export interface CreateEmbeddingResponse {
  data: OpenAiEmbeddingResponse;
  status: number;
}

export interface OpenAiEmbeddingsClientInterface {
  create: (params: CreateEmbeddingParams) => Promise<CreateEmbeddingResponse>;
}
// TODO: refactor to wrap https://www.npmjs.com/package/@azure/openai
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
    this.resourcePath = basePath + "openai/deployments/" + deployment;
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
