import { AzureKeyCredential, OpenAIClient } from "@azure/openai";
import { assertEnvVars, CORE_ENV_VARS } from "mongodb-rag-core";
import "dotenv/config";
import { ChatMessage } from ".";

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
