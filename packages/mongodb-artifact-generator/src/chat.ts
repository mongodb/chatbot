import { AzureKeyCredential, OpenAIClient } from "@azure/openai";
import { assertEnvVars, CORE_ENV_VARS } from "mongodb-rag-core";
import "dotenv/config";

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export function chatMessage<T extends ChatMessage>(t: T) {
  return t;
}

export const systemMessage = (content: string) =>
  chatMessage({ role: "system", content });

export const userMessage = (content: string) =>
  chatMessage({ role: "user", content });

export const assistantMessage = (content: string) =>
  chatMessage({ role: "assistant", content });

export type GenerateChatCompletion = (
  messages: ChatMessage[]
) => Promise<string | undefined>;

export function makeGenerateChatCompletion(): GenerateChatCompletion {
  const { OPENAI_API_KEY, OPENAI_CHAT_COMPLETION_DEPLOYMENT, OPENAI_ENDPOINT } =
    assertEnvVars(CORE_ENV_VARS);

  const openAiClient = new OpenAIClient(
    OPENAI_ENDPOINT,
    new AzureKeyCredential(OPENAI_API_KEY)
  );

  return async (messages) => {
    try {
      const {
        choices: [{ message }],
      } = await openAiClient.getChatCompletions(
        OPENAI_CHAT_COMPLETION_DEPLOYMENT,
        messages
      );
      return message?.content ?? undefined;
    } catch (err) {
      console.error(`Error generating chat completion`, err);
      throw err;
    }
  };
}
