import { OpenAI, AzureOpenAI } from "mongodb-rag-core/openai";
import { ModelConfig } from "./models";
import { strict as assert } from "assert";
interface BaseModelProviderConfig {
  apiKey: string;
  endpoint: string;
}

interface MakeOpenAiClientFactoryParams {
  azure?: BaseModelProviderConfig & {
    apiVersion: string;
  };
  braintrust?: BaseModelProviderConfig;
  radiant?: BaseModelProviderConfig & {
    authCookie: string;
  };
  vertexAi?: BaseModelProviderConfig;
}

export function makeOpenAiClientFactory({
  azure,
  braintrust,
  radiant,
  vertexAi,
}: MakeOpenAiClientFactoryParams) {
  return {
    makeOpenAiClient(modelConfig: ModelConfig) {
      let openAiClient: OpenAI;
      if (modelConfig.provider === "azure_openai") {
        assert(azure, "Azure OpenAI config must be provided");
        openAiClient = new AzureOpenAI({
          apiKey: azure.apiKey,
          endpoint: azure.endpoint,
          apiVersion: azure.apiVersion,
        });
      } else if (modelConfig.provider === "braintrust") {
        assert(braintrust, "Braintrust OpenAI config must be provided");
        openAiClient = new OpenAI({
          apiKey: braintrust.apiKey,
          baseURL: braintrust.endpoint,
        });
      } else if (modelConfig.provider === "radiant") {
        assert(radiant, "Radiant OpenAI config must be provided");
        openAiClient = new OpenAI({
          apiKey: radiant.apiKey,
          baseURL: radiant.endpoint,
          defaultHeaders: {
            Cookie: radiant.authCookie,
          },
        });
      } else if (modelConfig.provider === "gcp_vertex_ai") {
        assert(vertexAi, "GCP Vertex AI config must be provided");
        openAiClient = new OpenAI({
          apiKey: vertexAi.apiKey,
          baseURL: vertexAi.endpoint,
        });
      } else {
        throw new Error(`Unsupported provider: ${modelConfig.provider}`);
      }
      if (modelConfig.systemMessageAsUserMessage) {
        openAiClient = imitateSystemMessagesWithUserMessages(openAiClient);
      }
      return openAiClient;
    },
  };
}

function imitateSystemMessagesWithUserMessages(openAiClient: OpenAI): OpenAI {
  // Preserve the original `.create()` method with binding
  const originalCreate = openAiClient.chat.completions.create.bind(
    openAiClient.chat.completions
  );

  // Override the `.create()` method with minimal type casting
  openAiClient.chat.completions.create = ((args, options) => {
    const transformedMessages = transformSystemMessages(args.messages);

    // Call the original method with type assertions to match expected types
    return originalCreate(
      {
        ...args,
        messages: transformedMessages,
      } satisfies OpenAI.Chat.Completions.ChatCompletionCreateParams,
      options satisfies OpenAI.RequestOptions<any> | undefined
    );
  }) as typeof openAiClient.chat.completions.create;

  return openAiClient;
}

// Utility function to transform system messages into user-like messages
function transformSystemMessages(
  messages: OpenAI.Chat.Completions.ChatCompletionCreateParams["messages"]
): OpenAI.Chat.Completions.ChatCompletionCreateParams["messages"] {
  return messages.map((message) =>
    message.role === "system"
      ? {
          role: "user",
          content: `<System_Message>\n${message.content}\n</System_Message>`,
        }
      : message
  );
}
