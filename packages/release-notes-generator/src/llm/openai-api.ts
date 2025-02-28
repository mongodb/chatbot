import { AzureOpenAI, type OpenAI } from "mongodb-rag-core/openai";

export type MakeAzureOpenAiClientArgs = {
  apiKey: string;
  endpoint: string;
  apiVersion: string;
};

export const makeAzureOpenAiClient = ({
  apiKey,
  endpoint,
  apiVersion,
}: MakeAzureOpenAiClientArgs): AzureOpenAI =>
  new AzureOpenAI({
    apiKey,
    endpoint,
    apiVersion,
  });

export function chatMessage<T extends OpenAI.ChatCompletionMessageParam>(
  t: T,
): T {
  return t;
}

export const systemMessage = (
  args: Omit<OpenAI.ChatCompletionSystemMessageParam, "role">,
): OpenAI.ChatCompletionSystemMessageParam =>
  chatMessage({ role: "system", ...args });

export const userMessage = (
  args: Omit<OpenAI.ChatCompletionUserMessageParam, "role">,
): OpenAI.ChatCompletionUserMessageParam =>
  chatMessage({ role: "user", ...args });

export const assistantMessage = (
  args: Omit<OpenAI.ChatCompletionAssistantMessageParam, "role">,
): OpenAI.ChatCompletionAssistantMessageParam =>
  chatMessage({ role: "assistant", ...args });

export type MakeGenerateChatCompletionArgs = {
  openAiClient: AzureOpenAI;
  model: string;
};

export type GenerateChatCompletionArgs = {
  messages: OpenAI.ChatCompletionMessageParam[];
};

export function makeGenerateChatCompletion({
  openAiClient,
  model,
}: MakeGenerateChatCompletionArgs) {
  return async function generateChatCompletion({
    messages,
  }: GenerateChatCompletionArgs) {
    const completion = await openAiClient.chat.completions.create({
      model,
      messages,
    });
    return completion.choices[0].message.content;
  };
}

export type GenerateChatCompletion = ReturnType<
  typeof makeGenerateChatCompletion
>;
