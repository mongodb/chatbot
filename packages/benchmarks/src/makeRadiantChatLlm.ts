import { OpenAI, makeOpenAiChatLlm } from "mongodb-rag-core";

export const makeRadiantChatLlm = async ({
  endpoint,
  apiKey,
  deployment,
  mongoDbAuthCookie,
  lmmConfigOptions = {
    temperature: 0,
    max_tokens: 2000,
  },
}: {
  endpoint: string;
  apiKey: string;
  deployment: string;
  mongoDbAuthCookie?: string;
  lmmConfigOptions: Pick<
    OpenAI.default.Chat.ChatCompletionCreateParams,
    "max_tokens" | "temperature"
  >;
}) => {
  return makeOpenAiChatLlm({
    deployment,
    openAiLmmConfigOptions: lmmConfigOptions,
    openAiClient: new OpenAI.OpenAI({
      apiKey,
      baseURL: endpoint,
      defaultHeaders: mongoDbAuthCookie
        ? {
            Cookie: mongoDbAuthCookie,
          }
        : undefined,
    }),
  });
};
