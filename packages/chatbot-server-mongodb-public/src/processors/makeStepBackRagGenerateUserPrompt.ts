import {
  FindContentFunc,
  FunctionMessage,
  GenerateUserPromptFunc,
  GenerateUserPromptFuncReturnValue,
  updateFrontMatter,
  UserMessage,
  AssistantMessage,
} from "mongodb-chatbot-server";
import { OpenAI } from "mongodb-rag-core/openai";
import { strict as assert } from "assert";
import { logRequest } from "../utils";
import { makeMongoDbReferences } from "./makeMongoDbReferences";
import { userMessageMongoDbGuardrail } from "./userMessageMongoDbGuardrail";
import { CoreMessage, generateText, tool } from "ai";
import { z } from "zod";
import {
  mongoDbProductNames,
  mongoDbProgrammingLanguageIds,
} from "../mongoDbMetadata";
import { OpenAIProvider } from "@ai-sdk/openai";
import { SEARCH_CONTENT_TOOL_NAME, systemPrompt } from "../systemPrompt";

function makeSearchContentTool(findContent: FindContentFunc) {
  return tool({
    description: "Search MongoDB content",
    parameters: z.object({
      query: z.string().describe("Search query"),
      programmingLanguage: z
        .enum(mongoDbProgrammingLanguageIds)
        .nullable()
        .describe(
          'Programming language present in the content. If no programming language is present, set to `null`. Default to "javascript" if any programming language would answer the query.'
        ),
      mongoDbProduct: z.enum(mongoDbProductNames).describe(
        `Most important MongoDB product present in the content.
        Include "Driver" if the user is asking about a programming language with a MongoDB driver.
        If the product is ambiguous, default to "MongoDB Server".`
      ),
    }),
    execute: async ({ query, programmingLanguage, mongoDbProduct }) => {
      const updatedQuery = updateFrontMatter(query, {
        ...(programmingLanguage === null ? {} : { programmingLanguage }),
        mongoDbProduct,
      });
      const { content } = await findContent({
        query: updatedQuery,
      });

      return { references: makeMongoDbReferences(content) };
    },
  });
}

interface MakeStepBackGenerateUserPromptProps {
  openai: OpenAIProvider;
  openAiClient: OpenAI;
  model: string;
  numPrecedingMessagesToInclude?: number;
  findContent: FindContentFunc;
  maxContextTokenCount?: number;
}

/**
  Generate user prompt using the ["step back" method of prompt engineering](https://arxiv.org/abs/2310.06117)
  to construct search query.
  Also extract metadata to use in the search query or reject the user message.
 */
export const makeStepBackRagGenerateUserPrompt = ({
  openai,
  openAiClient,
  model,
  numPrecedingMessagesToInclude = 0,
  findContent,
  maxContextTokenCount = 1800,
}: MakeStepBackGenerateUserPromptProps) => {
  assert(
    numPrecedingMessagesToInclude >= 0,
    "'numPrecedingMessagesToInclude' must be >= 0. Got: " +
      numPrecedingMessagesToInclude
  );
  assert(
    Number.isInteger(numPrecedingMessagesToInclude),
    "'numPrecedingMessagesToInclude' must be an integer. Got: " +
      numPrecedingMessagesToInclude
  );
  const stepBackRagGenerateUserPrompt: GenerateUserPromptFunc = async ({
    reqId,
    userMessageText,
    conversation,
    customData,
  }) => {
    const messages = conversation?.messages ?? [];
    const precedingMessagesToInclude =
      numPrecedingMessagesToInclude === 0
        ? []
        : messages
            .filter((m) => m.role !== "system")
            .slice(-numPrecedingMessagesToInclude);
    const [guardrailResult, generateUserPromptResult] = await Promise.all([
      (async () => {
        const guardrailResult = await userMessageMongoDbGuardrail({
          userMessageText,
          openAiClient,
          model,
          messages: precedingMessagesToInclude,
        });
        if (guardrailResult.rejectMessage) {
          const { reasoning } = guardrailResult;
          logRequest({
            reqId,
            message: `Rejected user message: ${JSON.stringify({
              userMessageText,
              reasoning,
            })}`,
          });
          return {
            messages: [
              {
                role: "user",
                content: userMessageText,
                rejectQuery: true,
                customData: {
                  rejectionReason: reasoning,
                },
              } satisfies UserMessage,
            ],
            rejectQuery: true,
          };
        }
      })(),
      (async () => {
        const userMessage = {
          role: "user",
          content: userMessageText,
          customData,
        } satisfies UserMessage;

        const response = await generateText({
          model: openai(model, {
            structuredOutputs: true,
          }),
          maxTokens: maxContextTokenCount,
          toolChoice: { type: "tool", toolName: SEARCH_CONTENT_TOOL_NAME },

          tools: {
            [SEARCH_CONTENT_TOOL_NAME]: makeSearchContentTool(findContent),
          },
          messages: [
            systemPrompt,
            ...precedingMessagesToInclude.map(
              (m) =>
                ({
                  role: m.role === "function" ? "tool" : m.role,
                  content: m.content,
                } as CoreMessage)
            ),
            {
              role: "user",
              content: userMessageText,
            },
          ],
        });
        const toolCall = {
          role: "assistant",
          content: JSON.stringify(response.toolCalls[0].args),
        } satisfies AssistantMessage;
        const { references } = response.toolResults[0].result;
        const toolResponse = {
          role: "function",
          name: SEARCH_CONTENT_TOOL_NAME,
          content: JSON.stringify(response.toolResults[0].result, null, 2),
        } satisfies FunctionMessage;
        const messagesOut = [userMessage, toolCall, toolResponse];

        return {
          messages: messagesOut,
          references,
        } satisfies GenerateUserPromptFuncReturnValue;
      })(),
    ]);
    if (guardrailResult) {
      return guardrailResult;
    }
    return generateUserPromptResult;
  };
  return stepBackRagGenerateUserPrompt;
};
