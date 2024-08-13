import { ChatOpenAI } from "@langchain/openai";
import { makeLangchainChatLlm } from "mongodb-chatbot-server";
export const makeRadiantChatLlm = async ({
  endpoint,
  apiKey,
  deployment,
  mongoDbAuthCookie,
  lmmConfigOptions = {
    temperature: 0,
    maxTokens: 2000,
  },
}: {
  endpoint: string;
  apiKey: string;
  deployment: string;
  mongoDbAuthCookie?: string;
  lmmConfigOptions?: {
    temperature?: number;
    maxTokens?: number;
  };
}) => {
  return makeLangchainChatLlm({
    chatModel: new ChatOpenAI({
      apiKey,
      modelName: deployment,
      temperature: lmmConfigOptions.temperature,
      maxTokens: lmmConfigOptions.maxTokens,
      configuration: {
        baseURL: endpoint,
        defaultHeaders: mongoDbAuthCookie
          ? {
              Cookie: mongoDbAuthCookie,
            }
          : undefined,
      },
    }) as unknown as Parameters<typeof makeLangchainChatLlm>[0]["chatModel"],
  });
};
