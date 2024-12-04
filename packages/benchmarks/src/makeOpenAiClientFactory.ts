import { OpenAI, AzureOpenAI } from "mongodb-rag-core/openai";
import {
  BedrockRuntimeClient,
  ConversationRole,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { ModelConfig } from "./models";
import { strict as assert } from "assert";
import { wrapOpenAI, wrapTraced } from "braintrust";
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
  bedrock?: ConstructorParameters<typeof BedrockRuntimeClient>[0];
}

export function makeOpenAiClientFactory({
  azure,
  braintrust,
  radiant,
  vertexAi,
  bedrock,
}: MakeOpenAiClientFactoryParams) {
  return {
    makeOpenAiClient(modelConfig: ModelConfig) {
      let openAiClient: OpenAI;
      if (modelConfig.provider === "azure_openai") {
        assert(azure, "Azure OpenAI config must be provided");
        openAiClient = wrapOpenAI(
          new AzureOpenAI({
            apiKey: azure.apiKey,
            endpoint: azure.endpoint,
            apiVersion: azure.apiVersion,
          })
        );
      } else if (modelConfig.provider === "braintrust") {
        assert(braintrust, "Braintrust OpenAI config must be provided");
        openAiClient = wrapOpenAI(
          new OpenAI({
            apiKey: braintrust.apiKey,
            baseURL: braintrust.endpoint,
          })
        );
      } else if (modelConfig.provider === "radiant") {
        assert(radiant, "Radiant OpenAI config must be provided");
        openAiClient = wrapOpenAI(
          new OpenAI({
            apiKey: radiant.apiKey,
            baseURL: radiant.endpoint,
            defaultHeaders: {
              Cookie: radiant.authCookie,
            },
          })
        );
      } else if (modelConfig.provider === "gcp_vertex_ai") {
        assert(vertexAi, "GCP Vertex AI config must be provided");
        openAiClient = wrapOpenAI(
          new OpenAI({
            apiKey: vertexAi.apiKey,
            baseURL: vertexAi.endpoint,
          })
        );
      } else if (modelConfig.provider === "aws_bedrock") {
        assert(bedrock, "AWS Bedrock config must be provided");
        openAiClient = bedrockChatCompletionClient(bedrock);
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

function bedrockChatCompletionClient(
  bedrock: NonNullable<MakeOpenAiClientFactoryParams["bedrock"]>
) {
  const openAiClient = new OpenAI();
  const bedrockClient = new BedrockRuntimeClient(bedrock);
  const bedrockChatCompletionCreate = wrapTraced(
    async function (
      body: Parameters<typeof openAiClient.chat.completions.create>[0]
    ) {
      assert(body.stream !== true, "stream=true not supported for Anthropic");
      assert(body.tools === undefined, "tools not supported for Anthropic");
      assert(
        body.tool_choice === undefined,
        "tool_choice not supported for Anthropic"
      );

      const extractedSystemPrompt = body.messages.find(
        (m) => m.role === "system"
      )?.content as string | undefined;

      const filteredMessages = body.messages.filter(
        (m) => m.role === "user" || m.role === "assistant"
      );

      const input = new ConverseCommand({
        modelId: body.model,
        messages: filteredMessages.map((m) => ({
          role: m.role as ConversationRole,
          content: [{ text: m.content as string }],
        })),
        system: extractedSystemPrompt
          ? [{ text: extractedSystemPrompt }]
          : undefined,
        inferenceConfig: {
          maxTokens: body.max_tokens !== null ? body.max_tokens : 1000,
          temperature: body.temperature !== null ? body.temperature : undefined,
          topP: body.top_p !== null ? body.top_p : undefined,
        },
      });
      const res = await bedrockClient.send(input);
      const responseText = res.output?.message?.content?.[0].text;
      assert(responseText, "No content found in response");
      const responseRole = res?.output?.message?.role;
      assert(responseRole, "No role found in response");

      return {
        created: Date.now(),
        id: Date.now().toString(),
        model: body.model,
        object: "chat.completion",
        choices: [
          {
            message: {
              role: "assistant",
              content: responseText,
              refusal: null,
            },
            finish_reason: "stop",
            index: 0,
            logprobs: null,
          },
        ],
      } satisfies OpenAI.Chat.Completions.ChatCompletion;
      // as unknown as Awaited<
      //   ReturnType<typeof openAiClient.chat.completions.create>
      // >;
    },
    { name: "bedrockChatCompletionCreate" }
  );

  openAiClient.chat.completions.create =
    bedrockChatCompletionCreate as typeof openAiClient.chat.completions.create;

  return openAiClient as OpenAI;
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
