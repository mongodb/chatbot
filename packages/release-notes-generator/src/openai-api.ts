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
}: MakeAzureOpenAiClientArgs) =>
  new AzureOpenAI({
    apiKey,
    endpoint,
    apiVersion,
  });

export function chatMessage<T extends OpenAI.ChatCompletionMessageParam>(t: T) {
  return t;
}

export const systemMessage = (
  args: Omit<OpenAI.ChatCompletionSystemMessageParam, "role">
): OpenAI.ChatCompletionSystemMessageParam =>
  chatMessage({ role: "system", ...args });

export const userMessage = (
  args: Omit<OpenAI.ChatCompletionUserMessageParam, "role">
): OpenAI.ChatCompletionUserMessageParam =>
  chatMessage({ role: "user", ...args });

export const assistantMessage = (
  args: Omit<OpenAI.ChatCompletionAssistantMessageParam, "role">
): OpenAI.ChatCompletionAssistantMessageParam =>
  chatMessage({ role: "assistant", ...args });

// TODO - left off here. We need to define this and then use it in createChangelogEntry (and maybe other spots???)
export function makeGenerateChatCompletion({
  openAiClient,
}: {
  openAiClient: AzureOpenAI;
}) {
  const generateChatCompletion = async (args: {
    messages: OpenAI.ChatCompletionMessageParam[];
    model: string;
  }) => {
    const completion = await openAiClient.chat.completions.create(args);
    return completion.choices[0].message.content;
  };

  return generateChatCompletion;
}
