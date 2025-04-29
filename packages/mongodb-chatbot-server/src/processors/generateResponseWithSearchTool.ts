import {
  References,
  SomeMessage,
  SystemMessage,
  FindContentResult,
  DataStreamer,
  UserMessage,
  AssistantMessage,
  ToolMessage,
} from "mongodb-rag-core";
import { z } from "zod";
import { GenerateResponse } from "../routes/conversations/addMessageToConversation";
import {
  CoreAssistantMessage,
  CoreMessage,
  CoreSystemMessage,
  CoreToolMessage,
  CoreUserMessage,
  LanguageModel,
  StepResult,
  streamText,
  TextStreamPart,
  Tool,
  ToolResultPart,
  ToolSet,
} from "mongodb-rag-core/aiSdk";
import { FilterPreviousMessages } from "./FilterPreviousMessages";
import { InputGuardrail, withAbortControllerGuardrail } from "./InputGuardrail";
import { strict as assert } from "assert";

export interface GenerateResponseWithSearchToolParams {
  languageModel: LanguageModel;
  llmNotWorkingMessage: string;
  noRelevantContentMessage: string;
  inputGuardrail?: InputGuardrail;
  systemMessage: SystemMessage;
  filterPreviousMessages?: FilterPreviousMessages;
  /**
    Required tool for performing content search and gathering {@link References}
   */
  searchTool: SearchTool;
  additionalTools?: ToolSet;
}

export const SEARCH_TOOL_NAME = "search_content";

export const DefaultSearchArgsSchema = z.object({ query: z.string() });
export type SearchArguments = z.infer<typeof DefaultSearchArgsSchema>;

export type SearchToolResult = {
  content: FindContentResult["content"];
};
export type SearchTool = Tool<typeof DefaultSearchArgsSchema, SearchToolResult>;

// this is basically v2 of chatbot server which makes the thing an agent.
export function makeGenerateResponseWithSearchTool({
  languageModel,
  llmNotWorkingMessage,
  inputGuardrail,
  systemMessage,
  filterPreviousMessages,
  searchTool,
  additionalTools,
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
            convertConversationMessageToLlmMessage
          )
        : [];

      const generationArgs = {
        model: languageModel,
        messages: [
          systemMessage,
          ...filteredPreviousMessages,
          userMessage,
        ] as CoreMessage[],
        tools: {
          [SEARCH_TOOL_NAME]: searchTool,
          ...(additionalTools ?? {}),
        } satisfies {
          [SEARCH_TOOL_NAME]: SearchTool;
        },
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

      const { result: textGenerationResult, guardrailResult } =
        await withAbortControllerGuardrail(async (controller) => {
          const toolDefinitions = {
            [SEARCH_TOOL_NAME]: searchTool,
            ...(additionalTools ?? {}),
          };

          // Pass the tools as a separate parameter
          const { fullStream, steps } = streamText({
            ...generationArgs,
            abortSignal: controller.signal,
            tools: toolDefinitions,
          });
          // TODO: add logic to get references..need to play around with the best approach for this...TBD
          const references: References = [];
          if (shouldStream) {
            assert(dataStreamer, "dataStreamer is required for streaming");
            await streamResults(fullStream, dataStreamer);
          }
          const stepResults = await steps;
          return {
            references,
            stepResults,
          };
        }, inputGuardrailPromise);

      return handleReturnGeneration(
        userMessage,
        guardrailResult,
        textGenerationResult,
        customData,
        llmNotWorkingMessage
      );
    } catch (error: unknown) {
      // Handle other errors
      console.error("Error in generateResponseAiSdk:", error);
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

async function streamResults(
  streamFromAiSdk: AsyncIterable<
    TextStreamPart<{
      readonly search_content: SearchTool;
    }>
  >,
  dataStreamer: DataStreamer
) {
  // Define type guards for each stream element type we care about
  function isTextDelta(
    chunk: unknown
  ): chunk is { type: "text-delta"; textDelta: string } {
    return (
      typeof chunk === "object" &&
      chunk !== null &&
      "type" in chunk &&
      chunk.type === "text-delta" &&
      "textDelta" in chunk
    );
  }

  function isToolResult(chunk: unknown): chunk is {
    type: "tool-result";
    toolName: string;
    result: SearchToolResult;
  } {
    return (
      typeof chunk === "object" &&
      chunk !== null &&
      "type" in chunk &&
      chunk.type === "tool-result" &&
      "toolName" in chunk &&
      "result" in chunk
    );
  }

  // Keep track of references for caller
  const toolReferences: References = [];

  // Process the stream with type guards instead of switch
  for await (const chunk of streamFromAiSdk) {
    // Cast to unknown first to allow proper type narrowing
    const item: unknown = chunk;

    // Handle text deltas
    if (isTextDelta(item)) {
      dataStreamer?.streamData({
        data: item.textDelta,
        type: "delta",
      });
    }
    // Handle tool results
    else if (isToolResult(item) && item.toolName === SEARCH_TOOL_NAME) {
      const toolResult = item.result;
      if (
        toolResult &&
        "content" in toolResult &&
        Array.isArray(toolResult.content)
      ) {
        const references = toolResult.content.map((c) => ({
          url: c.url,
          title: c.metadata?.pageTitle ?? "",
          metadata: c.metadata,
        }));

        toolReferences.push(...references);
        dataStreamer?.streamData({
          data: references,
          type: "references",
        });
      }
    }
  }

  // Return collected references
  return toolReferences;
}

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

function convertConversationMessageToLlmMessage(
  message: SomeMessage
): CoreMessage {
  const { content, role } = message;
  if (role === "system") {
    return {
      content: content,
      role: "system",
    } satisfies CoreSystemMessage;
  }
  if (role === "tool") {
    return {
      content: [
        {
          type: "tool-result",
          toolCallId: "",
          result: content,
          toolName: message.name,
        } satisfies ToolResultPart,
      ],
      role: "tool",
    } satisfies CoreToolMessage;
  }
  if (role === "user") {
    return {
      content: content,
      role: "user",
    } satisfies CoreUserMessage;
  }
  if (role === "assistant") {
    return {
      content: content,
      role: "assistant",
      ...(message.toolCall
        ? {
            function_call: {
              name: message.toolCall.function?.name || "",
              arguments:
                typeof message.toolCall.function === "object"
                  ? JSON.stringify(message.toolCall.function)
                  : "{}",
            },
          }
        : {}),
    } satisfies CoreAssistantMessage;
  }
  throw new Error(`Invalid message role: ${role}`);
}
