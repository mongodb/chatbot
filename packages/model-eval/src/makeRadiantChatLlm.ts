import { makeOpenAiChatLlm } from "mongodb-chatbot-server";

export const makeRadiantChatLlm = async ({
  endpoint,
  apiKey,
  deployment,
  mongoDbAuthCookie,
  lmmConfigOptions = {
    temperature: 0,
  },
}: {
  endpoint: string;
  apiKey: string;
  deployment: string;
  mongoDbAuthCookie?: string;
  lmmConfigOptions: {
    temperature: number;
  };
}) => {
  const { AzureKeyCredential, OpenAIClient } = await import("@azure/openai");
  return makeOpenAiChatLlm({
    deployment,
    openAiLmmConfigOptions: lmmConfigOptions,
    openAiClient: new OpenAIClient(endpoint, new AzureKeyCredential(apiKey), {
      // Allow insecure connection when in staging/production
      // b/c connecting w/in the same k8s cluster
      allowInsecureConnection:
        process.env.NODE_ENV === "production" ||
        process.env.NODE_ENV === "staging",
      // If connecting to Radiant over the internet,
      // you must include a MongoDB CorpSecure cookie in the request.
      additionalPolicies: [
        {
          position: "perCall",
          policy: {
            name: "add-cookie",
            sendRequest(request, next) {
              if (mongoDbAuthCookie) {
                request.headers.set("Cookie", mongoDbAuthCookie);
              }
              return next(request);
            },
          },
        },
      ],
      retryOptions: {
        maxRetries: 5,
      },
    }),
  });
};
