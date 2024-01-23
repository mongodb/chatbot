// TODO: see if can refactor to use the RAG module..
// there's good edge case handling and logging there
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
interface MakeStepBackGenerateUserPromptProps {
  openAiClient: OpenAIClient;
  deploymentName: string;
  numPrecedingMessagesToInclude?: number;
  findContent: FindContentFunc;
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
}: MakeStepBackGenerateUserPromptProps) => {
  const stepBackRagGenerateUserPrompt: GenerateUserPromptFunc = async ({
    reqId,
    userMessageText,
    conversation,
    customData,
  }) => {
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
      return {
        userMessage: {
          role: "user",
          content: userMessageText,
          rejectQuery: true,
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
        messages,
        metadata,
        content,
      }),
      customData,
    } satisfies UserMessage;
    const references = content.map((c) => ({
      url: c.url,
      ...(typeof c.metadata?.title === "string"
        ? {
            title: c.metadata.title,
          }
        : { title: c.url }),
    }));
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
}: {
  userMessageText: string;
  stepBackUserQuery: string;
  messages: Message[];
  metadata?: Record<string, any>;
  content: EmbeddedContent[];
}) {
  return stripIndents`Use the following information to respond to the "user message".
  Previous conversation messages:
  ${messages
    .filter((message) => message.role !== "system")
    .map((message) => message.role.toUpperCase() + ": " + message.content)
    .join("\n")}

  Content from the MongoDB documentation:
  ${[...content]
    .reverse()
    .map((c) => c.text)
    .join("---")}

  Relevant metadata: ${JSON.stringify({
    ...(metadata ?? {}),
    searchQuery: stepBackUserQuery,
  })}

  User message: ${userMessageText}

  `;
}
