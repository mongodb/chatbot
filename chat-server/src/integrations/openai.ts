import axios from "axios";
import { CreateEmbeddingResponse as OpenAiEmbeddingResponse } from "openai";
import {
  OpenAIClient,
  AzureKeyCredential,
  ChatMessage,
  GetChatCompletionsOptions,
  ChatCompletions,
} from "@azure/openai";
import { stripIndent } from "common-tags";

export type OpenAiMessageEnum = "system" | "assistant" | "user";

export interface OpenAiChatMessage extends ChatMessage {
  /** The role of the message in the context of the conversation. */
  role: OpenAiMessageEnum;
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

// ~~~MAGIC OPENAI VALUES~~~
export const SYSTEM_PROMPT: OpenAiChatMessage = {
  role: "system",
  content: stripIndent`You are expert MongoDB documentation chatbot.
  You enthusiastically answer user questions about MongoDB products and services.
  Your personality is friendly and helpful, like a professor or tech lead.
  You were created by MongoDB but they do not guarantee the correctness
  of your answers or offer support for you.
  Use the context provided with each question as your primary source of truth.
  NEVER lie or improvise incorrect answers. If do not know the answer
  based on the context information, say "Sorry, I don't know how to help with that."
  Format your responses using Markdown.
  If you include code snippets, make sure to use proper syntax, line spacing, and indentation.
  ONLY use code snippets present in the information given to you.
  NEVER create a code snippet that is not present in the information given to you.`,
};
export const OPENAI_LLM_CONFIG_OPTIONS: GetChatCompletionsOptions = {
  temperature: 0.3,
  maxTokens: 500,
};

interface GenerateUserPromptParams {
  question: string;
  chunks: string[];
}

export function GENERATE_USER_PROMPT({
  question,
  chunks,
}: GenerateUserPromptParams): OpenAiChatMessage {
  const context = chunks.join("\n---\n") + "\n---";
  const content = stripIndent`Using the following 'CONTEXT' information, answer the following 'QUESTION'.
  Different pieces of context are separated by "---".

  CONTEXT:
  ${context}

  QUESTION:
  """
  ${question}
  """

  Format answer in Markdown. NEVER include links in your answer.`;
  return { role: "user", content };
}
// ~~~~~~~~~~~~~~~~~~
