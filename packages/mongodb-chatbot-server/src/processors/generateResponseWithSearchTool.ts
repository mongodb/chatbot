import {
  References,
  SomeMessage,
  SystemMessage,
  DataStreamer,
  UserMessage,
  AssistantMessage,
  ToolMessage,
  EmbeddedContent,
  FindContentFunc,
} from "mongodb-rag-core";
import { z } from "zod";
import { GenerateResponse } from "./GenerateResponse";
import {
  CoreAssistantMessage,
  CoreMessage,
  LanguageModel,
  Schema,
  StepResult,
  streamText,
  TextStreamPart,
  tool,
  Tool,
  ToolCallPart,
  ToolResult,
  ToolSet,
} from "mongodb-rag-core/aiSdk";
import { FilterPreviousMessages } from "./FilterPreviousMessages";
import { InputGuardrail, withAbortControllerGuardrail } from "./InputGuardrail";
import { strict as assert } from "assert";
import {
  EmbeddedContentForModel,
  MakeReferenceLinksFunc,
} from "./MakeReferenceLinksFunc";
import { makeDefaultReferenceLinks } from "./makeDefaultReferenceLinks";

export interface GenerateResponseWithSearchToolParams {
  languageModel: LanguageModel;
  llmNotWorkingMessage: string;
  inputGuardrail?: InputGuardrail;
  systemMessage: SystemMessage;
  filterPreviousMessages?: FilterPreviousMessages;
  /**
    Required tool for performing content search and gathering {@link References}
   */
  additionalTools?: ToolSet;
  makeReferenceLinks?: MakeReferenceLinksFunc;
  maxSteps?: number;
  findContent: FindContentFunc;
}

export const SEARCH_TOOL_NAME = "search_content";

export const SearchArgsSchema = z.object({ query: z.string() });
export type SearchArguments = z.infer<typeof SearchArgsSchema>;

export type SearchToolReturnValue = {
  content: {
    url: string;
    text: string;
    metadata?: Record<string, unknown>;
  }[];
};

export type SearchToolResult = ToolResult<
  typeof SEARCH_TOOL_NAME,
  SearchArguments,
  SearchToolReturnValue
>;

/**
  Generate chatbot response using RAG and a search tool named {@link SEARCH_TOOL_NAME}.
 */
export function makeGenerateResponseWithSearchTool({
  languageModel,
  llmNotWorkingMessage,
  inputGuardrail,
  systemMessage,
  filterPreviousMessages,
  additionalTools,
  makeReferenceLinks,
  maxSteps = 2,
  findContent,
}: GenerateResponseWithSearchToolParams): GenerateResponse {
  return async function generateResponseWithSearchTool({
    conversation,
    latestMessageText,
    clientContext,
    customData,
    shouldStream,
    reqId,
    dataStreamer,
    request,
  }) {
    const userMessage = {
      role: "user",
      content: latestMessageText,
    } satisfies UserMessage;
    try {
      // Get preceding messages to include in the LLM prompt
      const filteredPreviousMessages = filterPreviousMessages
        ? (await filterPreviousMessages(conversation)).map(
            formatMessageForAiSdk
          )
        : [];

      const searchTool = tool({
        parameters: SearchArgsSchema,
        execute: async ({ query }, { toolCallId }) => {
          dataStreamer?.streamData({
            data: `Searching for '${query}'...`,
            type: "processing",
          });
          return await findContent({
            query,
          });
        },
        description: "Search for relevant content.",
      });
      const tools: ToolSet = {
        [SEARCH_TOOL_NAME]: searchTool,
        ...(additionalTools ?? {}),
      };
      const generationArgs = {
        model: languageModel,
        messages: [
          systemMessage,
          ...filteredPreviousMessages,
          userMessage,
        ] satisfies CoreMessage[],
        tools,
        maxSteps,
      };

      // Guardrail used to validate the input
      // while the LLM is generating the response
      const inputGuardrailPromise = inputGuardrail
        ? inputGuardrail({
            conversation,
            latestMessageText,
            clientContext,
            customData,
            shouldStream,
            reqId,
            dataStreamer,
            request,
          })
        : undefined;

      const references: EmbeddedContentForModel[] = [];
      const { result, guardrailResult } = await withAbortControllerGuardrail(
        async (controller) => {
          // Pass the tools as a separate parameter
          const { fullStream, steps } = streamText({
            ...generationArgs,
            toolChoice: "auto",
            abortSignal: controller.signal,
            onStepFinish: async ({ toolResults }) => {
              toolResults?.forEach((toolResult) => {
                if (
                  toolResult.toolName === SEARCH_TOOL_NAME &&
                  toolResult.result?.content
                ) {
                  // Map the search tool results to the References format
                  const searchResults = toolResult.result
                    .content as SearchToolResult["result"]["content"];
                  const referencesToAdd = searchResults.map(
                    (item: {
                      url: string;
                      text: string;
                      metadata?: Record<string, unknown>;
                    }) => ({
                      url: item.url,
                      text: item.text,
                      metadata: item.metadata,
                    })
                  );
                  references.push(...referencesToAdd);
                }
              });
            },
          });
          if (shouldStream) {
            assert(dataStreamer, "dataStreamer is required for streaming");
            for await (const chunk of fullStream) {
              switch (chunk.type) {
                case "text-delta":
                  if (shouldStream) {
                    dataStreamer?.streamData({
                      data: chunk.textDelta,
                      type: "delta",
                    });
                  }
                  break;
                case "error":
                  console.error("Error in stream:", chunk.error);
                  throw new Error(
                    typeof chunk.error === "string"
                      ? chunk.error
                      : String(chunk.error)
                  );
                default:
                  break;
              }
            }
          }

          try {
            // Transform filtered references to include the required title property
            const referencesOut = makeReferenceLinks
              ? makeReferenceLinks(references)
              : makeDefaultReferenceLinks(references);
            dataStreamer?.streamData({
              data: referencesOut,
              type: "references",
            });
            const stepResults = await steps;

            return {
              stepResults,
              references: referencesOut,
            } satisfies {
              stepResults: StepResult<ToolSet>[];
              references: References;
            };
          } catch (error: unknown) {
            console.error("Error in stream:", error);
            throw new Error(typeof error === "string" ? error : String(error));
          }
        },
        inputGuardrailPromise
      );
      return handleReturnGeneration(
        userMessage,
        guardrailResult,
        result,
        customData,
        llmNotWorkingMessage
      );
    } catch (error: unknown) {
      // Handle other errors
      return {
        messages: [
          userMessage,
          {
            role: "assistant",
            content: llmNotWorkingMessage,
          },
        ],
      };
    }
  };
}

function stepResultsToMessages<TOOLS extends ToolSet>(
  stepResults?: StepResult<TOOLS>[],
  references?: References
): SomeMessage[] {
  if (!stepResults) {
    return [];
  }
  return stepResults
    .map((stepResult) => {
      if (stepResult.toolCalls) {
        return stepResult.toolCalls.map(
          (toolCall) =>
            ({
              role: "assistant",
              content: toolCall.args,
              toolCall: {
                function: toolCall.args,
                id: toolCall.toolCallId,
                type: "function",
              },
            } satisfies AssistantMessage)
        );
      }
      if (stepResult.toolResults) {
        return stepResult.toolResults.map(
          (toolResult) =>
            ({
              role: "tool",
              name: toolResult.toolName,
              content: toolResult.result,
            } satisfies ToolMessage)
        );
      } else {
        return {
          role: "assistant",
          content: stepResult.text,
          references,
        } satisfies AssistantMessage;
      }
    })
    .flat();
}

async function handleStreamResults(
  streamFromAiSdk: AsyncIterable<TextStreamPart<ToolSet>>,
  shouldStream: boolean,
  dataStreamer?: DataStreamer
) {
  for await (const chunk of streamFromAiSdk) {
    switch (chunk.type) {
      case "text-delta":
        if (shouldStream) {
          dataStreamer?.streamData({
            data: chunk.textDelta,
            type: "delta",
          });
        }
        break;
      case "error":
        console.error("Error in stream:", chunk.error);
        throw new Error(
          typeof chunk.error === "string" ? chunk.error : String(chunk.error)
        );
      default:
        break;
    }
  }
}

type ToolParameters = z.ZodTypeAny | Schema<any>;

type inferParameters<PARAMETERS extends ToolParameters> =
  PARAMETERS extends Schema<any>
    ? PARAMETERS["_type"]
    : PARAMETERS extends z.ZodTypeAny
    ? z.infer<PARAMETERS>
    : never;

// Extract tools that have an execute property and return their result types
type ExecutableTools<TOOLS extends ToolSet> = {
  [K in keyof TOOLS]: TOOLS[K] extends { execute: (...args: any[]) => any }
    ? K
    : never;
}[keyof TOOLS];

// Get the result type of a tool's execute function
type ToolExecuteResult<T> = T extends { execute: (...args: any[]) => infer R }
  ? Awaited<R>
  : never;

// Map tool names to their result types
type ToolResults<TOOLS extends ToolSet> = {
  [K in ExecutableTools<TOOLS>]: {
    toolName: K & string;
    toolCallId: string;
    args: inferParameters<TOOLS[K & keyof TOOLS]["parameters"]>;
    result: ToolExecuteResult<TOOLS[K & keyof TOOLS]>;
  };
};
// Helper type to get a value from an object
type ValueOf<
  ObjectType,
  ValueType extends keyof ObjectType = keyof ObjectType
> = ObjectType[ValueType];

// Create a union type of all possible tool results
type ToolResultUnion<TOOLS extends ToolSet> = ValueOf<ToolResults<TOOLS>>;

// Create an array type for tool results
type ToolResultArray<TOOLS extends ToolSet> = Array<
  ToolResultUnion<TOOLS> & { type: "tool-result" }
>;

// ... (rest of the code remains the same)
/**
  Generate the final messages to send to the user based on guardrail result and text generation result
 */
function handleReturnGeneration(
  userMessage: UserMessage,
  guardrailResult:
    | { rejected: boolean; message: string; metadata?: Record<string, unknown> }
    | undefined,
  textGenerationResult:
    | {
        stepResults?: StepResult<ToolSet>[];
        references?: References;
        text?: string;
      }
    | null
    | undefined,
  customData?: Record<string, unknown>,
  fallbackMessage = "Sorry, I'm having trouble generating a response."
): { messages: SomeMessage[] } {
  if (guardrailResult?.rejected) {
    return {
      messages: [
        userMessage,
        {
          role: "assistant",
          content: guardrailResult.message,
          metadata: guardrailResult.metadata,
          customData,
        },
      ] satisfies SomeMessage[],
    };
  }

  if (!textGenerationResult) {
    return {
      messages: [
        userMessage,
        {
          role: "assistant",
          content: fallbackMessage,
        },
      ],
    };
  }

  // Check if stepResults exist, if not but we have text, create a response with just the text
  if (!textGenerationResult.stepResults?.length && textGenerationResult.text) {
    return {
      messages: [
        userMessage,
        {
          role: "assistant",
          content: textGenerationResult.text,
          references: textGenerationResult.references,
        },
      ],
    };
  }

  return {
    messages: [
      userMessage,
      ...stepResultsToMessages(
        textGenerationResult.stepResults,
        textGenerationResult.references
      ),
    ] satisfies SomeMessage[],
  };
}

function formatMessageForAiSdk(message: SomeMessage): CoreMessage {
  if (message.role === "assistant" && typeof message.content === "object") {
    // Convert assistant messages with object content to proper format
    if (message.toolCall) {
      // This is a tool call message
      return {
        role: "assistant",
        content: [
          {
            type: "tool-call",
            toolCallId: message.toolCall.id,
            toolName: message.toolCall.function.name,
            args: message.toolCall.function.arguments,
          } satisfies ToolCallPart,
        ],
      } satisfies CoreAssistantMessage;
    } else {
      // Fallback for other object content
      return {
        role: "assistant",
        content: JSON.stringify(message.content),
      } satisfies CoreAssistantMessage;
    }
  } else if (message.role === "tool") {
    // Convert tool messages to the format expected by the AI SDK
    return {
      role: "assistant", // Use assistant role instead of function
      content:
        typeof message.content === "string"
          ? message.content
          : JSON.stringify(message.content),
    } satisfies CoreMessage;
  } else {
    // User and system messages can pass through
    return message satisfies CoreMessage;
  }
}
