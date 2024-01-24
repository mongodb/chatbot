import {
  EmbeddedContent,
  FindContentFunc,
  GenerateUserPromptFunc,
  GenerateUserPromptFuncReturnValue,
  Message,
  OpenAIClient,
  UserMessage,
  updateFrontMatter,
} from "mongodb-chatbot-server";
import { extractMetadataFromUserMessage } from "./extractMetadataFromUserMessage";
import { makeStepBackUserQuery } from "./makeStepBackUserQuery";
import { stripIndents } from "common-tags";
import { strict as assert } from "assert";
import { logRequest } from "../utils";
import { makeMongoDbReferences } from "./makeMongoDbReferences";
interface MakeStepBackGenerateUserPromptProps {
  openAiClient: OpenAIClient;
  deploymentName: string;
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
  openAiClient,
  deploymentName,
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
    const userPrompt = {
      role: "user",
      embedding: queryEmbedding,
      content: userMessageText,
      contentForLlm: makeUserContentForLlm({
        userMessageText,
        stepBackUserQuery,
        messages: precedingMessagesToInclude,
        metadata,
        content,
        maxContextTokenCount,
      }),
      customData,
      preprocessedContent: stepBackUserQuery,
    } satisfies UserMessage;
    const references = makeMongoDbReferences(content);
    logRequest({
      reqId,
      message: stripIndents`Generated user prompt for LLM: ${
        userPrompt.contentForLlm
      }
      Generated references: ${JSON.stringify(references)}`,
    });
    return {
      userMessage: userPrompt,
      references,
    } satisfies GenerateUserPromptFuncReturnValue;
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
  metadata?: Record<string, any>;
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
  if (content.length === 0) {
    return stripIndents`Use the following information to respond to the "user message" by:
    1. Asking the user to rephrase their query
    2. Providing a few suggestions for how to rephrase the query as a more general search query (e.g. "how do i filter documents in python to only find where carType is 'suv'" -> "How do I query MongoDB documents in Python based on a specific field value?")

    Relevant metadata: ${JSON.stringify({
      ...(metadata ?? {}),
      searchQuery: stepBackUserQuery,
    })}

    User message: ${userMessageText}`;
  }

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
  return stripIndents`Use the following information to respond to the "user message".
  Previous conversation messages:
  ${previousConversationMessages}

  Content from the MongoDB documentation:
  ${contentForLlm}

  Relevant metadata: ${relevantMetadata}

  User message: ${userMessageText}`;
}
