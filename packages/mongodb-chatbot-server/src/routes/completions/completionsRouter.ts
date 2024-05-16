import { Router } from "express";
import {
  CreateChatCompletionRequest,
  CreateChatCompletionResponse,
} from "openai";
import { ChatRequestMessage, OpenAIClient } from "@azure/openai";
import { FindContentFunc } from "../conversations";
import { updateFrontMatter, EmbeddedContent } from "mongodb-rag-core";
import {
  GenerateUserPromptFunc,
  GenerateUserPromptFuncReturnValue,
} from "../../processors";
import { UserMessage, Message, Conversation } from "../../services";
import { logRequest } from "../../utils";
import { extractMetadataFromUserMessage } from "./extractMetadataFromUserMessage";
import { stripIndents } from "common-tags";
import { makeStepBackUserQuery } from "./makeStepBackUserQuery";
import { makeMongoDbReferences } from "./makeMongoDbReferences";

export interface CompletionRouterParams {
  openAiClient: OpenAIClient;
  findContent: FindContentFunc;
}
export function makeCompletionsRouter({
  openAiClient,
  findContent,
}: CompletionRouterParams) {
  const completionsRouter = Router();
  completionsRouter.post("/", async (req: ChatCompletionsRequest, res) => {
    const { model, messages } = req.body;
    const genPrompt = makeStepBackRagGenerateUserPrompt({
      openAiClient,
      deploymentName: model,
      findContent,
    });

    try {
      const prompt = await genPrompt({
        reqId: "test",
        userMessageText: messages[messages.length - 1].content as string,
        conversation: {
          messages: messages as Message[],
          customData: {},
        } as Conversation,
        customData: {},
      });
      const metaSystemMsg = {
        role: "system",
        content: prompt.userMessage.content,
      };

      prompt.userMessage.content;
      const completion = await openAiClient.getChatCompletions(model, [
        metaSystemMsg,
        ...messages,
      ] as ChatRequestMessage[]);
      // completion.choices[0].references = [];

      res.json(completion);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Unknown error" });
      }
    }
  });
  return completionsRouter;
}
type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export interface ChatCompletionsRequest {
  body: WithRequired<
    Partial<CreateChatCompletionRequest>,
    "model" | "messages"
  >;
}

interface MakeStepBackGenerateUserPromptProps {
  openAiClient: OpenAIClient;
  deploymentName: string;
  numPrecedingMessagesToInclude?: number;
  findContent: FindContentFunc;
  maxContextTokenCount?: number;
}
export const makeStepBackRagGenerateUserPrompt = ({
  openAiClient,
  deploymentName,
  numPrecedingMessagesToInclude = 0,
  findContent,
  maxContextTokenCount = 1800,
}: MakeStepBackGenerateUserPromptProps) => {
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
        : messages.slice(-numPrecedingMessagesToInclude);
    const metadata = await extractMetadataFromUserMessage({
      openAiClient,
      deploymentName,
      userMessageText,
      messages: precedingMessagesToInclude,
    });
    if (metadata.rejectQuery) {
      const { rejectionReason } = metadata;
      logRequest({
        reqId,
        message: `Rejected user message: ${JSON.stringify({
          userMessageText,
          rejectionReason,
        })}`,
      });
      return {
        userMessage: {
          role: "user",
          content: userMessageText,
          rejectQuery: true,
          customData: {
            rejectionReason,
          },
        } satisfies UserMessage,
        rejectQuery: true,
      };
    }
    logRequest({
      reqId,
      message: `Extracted metadata from user message: ${JSON.stringify(
        metadata
      )}`,
    });
    const metadataForQuery: Record<string, unknown> = {};
    if (metadata.programmingLanguage) {
      metadataForQuery.programmingLanguage = metadata.programmingLanguage;
    }
    if (metadata.mongoDbProductName) {
      metadataForQuery.mongoDbProductName = metadata.mongoDbProductName;
    }

    const stepBackUserQuery = await makeStepBackUserQuery({
      openAiClient,
      deploymentName,
      messages: precedingMessagesToInclude,
      userMessageText,
      metadata: metadataForQuery,
    });
    logRequest({
      reqId,
      message: `Step back query: ${stepBackUserQuery}`,
    });

    const { content, queryEmbedding } = await findContent({
      query: updateFrontMatter(stepBackUserQuery, metadataForQuery),
    });
    logRequest({
      reqId,
      message: `Found ${content.length} results for query: ${content
        .map((c) => c.text)
        .join("---")}`,
    });
    const baseUserMessage = {
      role: "user",
      embedding: queryEmbedding,
      content: userMessageText,
      contextContent: content.map((c) => ({
        text: c.text,
        url: c.url,
        score: c.score,
      })),
      customData,
      preprocessedContent: stepBackUserQuery,
    } satisfies UserMessage;
    if (content.length === 0) {
      return {
        userMessage: {
          ...baseUserMessage,
          rejectQuery: true,
          customData: {
            ...customData,
            rejectionReason: "Did not find any content matching the query",
          },
        },
        rejectQuery: true,
        references: [],
      } satisfies GenerateUserPromptFuncReturnValue;
    }
    const userPrompt = {
      ...baseUserMessage,
      contentForLlm: makeUserContentForLlm({
        userMessageText,
        stepBackUserQuery,
        messages: precedingMessagesToInclude,
        metadata,
        content,
        maxContextTokenCount,
      }),
    } satisfies UserMessage;
    const references = makeMongoDbReferences(content);
    return {
      userMessage: userPrompt,
      references,
    };
  };
  return stepBackRagGenerateUserPrompt;
};

function makeUserContentForLlm({
  userMessageText,
  stepBackUserQuery,
  messages,
  metadata,
  content,
  maxContextTokenCount,
}: {
  userMessageText: string;
  stepBackUserQuery: string;
  messages: Message[];
  metadata?: Record<string, unknown>;
  content: EmbeddedContent[];
  maxContextTokenCount: number;
}) {
  const previousConversationMessages = messages
    .filter((message) => message.role !== "system")
    .map((message) => message.role.toUpperCase() + ": " + message.content)
    .join("\n");
  const relevantMetadata = JSON.stringify({
    ...(metadata ?? {}),
    searchQuery: stepBackUserQuery,
  });

  let currentTotalTokenCount = 0;
  const contentForLlm = [...content]
    .filter((c) => {
      if (currentTotalTokenCount < maxContextTokenCount) {
        currentTotalTokenCount += c.tokenCount;
        return true;
      }
      return false;
    })
    .map((c) => c.text)
    .reverse()
    .join("---");
  return `Use the following information to respond to the latest "User message".
${
  previousConversationMessages.length > 0
    ? `Previous conversation messages: ${previousConversationMessages}`
    : ""
}

Content from the MongoDB documentation:
${contentForLlm}

Relevant metadata: ${relevantMetadata}

User message: ${userMessageText}`;
}
