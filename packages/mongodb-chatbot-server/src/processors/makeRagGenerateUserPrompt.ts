import { stripIndents } from "common-tags";
import { FindContentFunc } from "../routes";
import { GenerateUserPromptFunc } from "./GenerateUserPromptFunc";
import { QueryPreprocessorFunc } from "./QueryPreprocessorFunc";
import { logRequest } from "../utils";
import { Conversation, UserMessage } from "../services";
import { EmbeddedContent } from "mongodb-rag-core";
import { MakeReferenceLinksFunc } from "./MakeReferenceLinksFunc";
import { makeDefaultReferenceLinks } from "./makeDefaultReferenceLinks";

export interface MakeRagGenerateUserPromptParams {
  queryPreprocessor: QueryPreprocessorFunc;
  findContent: FindContentFunc;
  makeReferenceLinks?: MakeReferenceLinksFunc;
  maxChunkContextTokens?: number;
  makeUserMessage: MakeUserMessageFunc;
}

export type MakeUserMessageFuncParams = {
  content: EmbeddedContent[];
  originalUserMessage: string;
  preprocessedUserMessage?: string;
  queryEmbedding?: number[];
  rejectQuery?: boolean;
};

export type MakeUserMessageFunc = (
  params: MakeUserMessageFuncParams
) => Promise<UserMessage>;

const DEFAULT_MAX_CONTEXT_TOKENS = 1500; // magic number for max context tokens for LLM

/**
  Construct a {@link GenerateUserPromptFunc} function
  that uses retrieval augmented generation (RAG) to generate the user prompt
  and return references to use in the answer.
  The returned RAG user prompt generator performs the following steps:
  1. Preprocess the user's message using the query preprocessor.
  2. Find content using vector search.
  3. Removes any chunks that would exceed the max context tokens.
  4. Generate the user message using the make user message function.
  5. Return the user message and references.0                                                                                                                  */
export function makeRagGenerateUserPrompt({
  queryPreprocessor,
  findContent,
  makeReferenceLinks = makeDefaultReferenceLinks,
  maxChunkContextTokens = DEFAULT_MAX_CONTEXT_TOKENS,
  makeUserMessage,
}: MakeRagGenerateUserPromptParams): GenerateUserPromptFunc {
  return async ({ userMessageText, conversation, reqId }) => {
    // --- PREPROCESS ---
    const preprocessResult = await preProcessUserMessage({
      queryPreprocessor,
      userMessageText,
      conversation,
      reqId,
    });
    const { rejectQuery, query: preprocessedUserMessageContent } =
      preprocessResult ?? {};
    if (rejectQuery) {
      logRequest({
        reqId,
        message: "Preprocessor rejected query",
      });
      return {
        rejectQuery: true,
        userMessage: { role: "user", content: userMessageText },
      };
    }

    const query = preprocessedUserMessageContent ?? userMessageText;

    // --- VECTOR SEARCH / RETRIEVAL ---
    const { content, queryEmbedding } = await findContent({
      query,
    });
    if (content.length === 0) {
      logRequest({
        reqId,
        message: "No matching content found",
      });
      return {
        userMessage: {
          role: "user",
          content: userMessageText,
          embedding: queryEmbedding,
        },
        rejectQuery: true,
      };
    }

    logRequest({
      reqId,
      message: stripIndents`Chunks found: ${JSON.stringify(
        content.map(
          ({ embedding, chunkAlgoHash, ...wantedProperties }) =>
            wantedProperties
        )
      )}`,
    });

    const references = makeReferenceLinks(content);
    const includedContent = includeChunksForMaxTokensPossible({
      maxTokens: maxChunkContextTokens,
      content,
    });

    const userMessage = await makeUserMessage({
      content: includedContent,
      originalUserMessage: userMessageText,
      preprocessedUserMessage: preprocessedUserMessageContent,
      queryEmbedding,
      rejectQuery,
    });
    logRequest({
      reqId,
      message: `Latest message sent to LLM: ${JSON.stringify(userMessage)}`,
    });
    return {
      userMessage,
      references,
      rejectQuery: false,
    };
  };
}

interface PreProcessUserMessageParams {
  queryPreprocessor?: QueryPreprocessorFunc;
  userMessageText: string;
  conversation?: Conversation;
  reqId: string;
}

async function preProcessUserMessage({
  queryPreprocessor,
  userMessageText,
  conversation,
  reqId,
}: PreProcessUserMessageParams): Promise<
  { query: string; rejectQuery?: boolean } | undefined
> {
  // Try to preprocess the user's message. If the user's message cannot be preprocessed
  // (likely due to LLM timeout), then we will just use the original message.
  if (!queryPreprocessor) {
    return undefined;
  }
  try {
    const { query, rejectQuery } = await queryPreprocessor({
      query: userMessageText,
      messages: conversation?.messages,
    });
    logRequest({
      reqId,
      message: stripIndents`Successfully preprocessed user query.
      Original query: ${userMessageText}
      Preprocessed query: ${query}`,
    });
    return { query: query ?? userMessageText, rejectQuery };
  } catch (err: unknown) {
    logRequest({
      reqId,
      type: "error",
      message: `Error preprocessing query: ${JSON.stringify(
        err
      )}. Using original query: ${userMessageText}`,
    });
  }
}

/**
      This function returns the chunks that can fit in the maxTokens.
      It limits the number of tokens that are sent to the LLM.
      */
export function includeChunksForMaxTokensPossible({
  maxTokens,
  content,
}: {
  maxTokens: number;
  content: EmbeddedContent[];
}): EmbeddedContent[] {
  let total = 0;
  const fitRangeEndIndex = content.findIndex(
    ({ tokenCount }) => (total += tokenCount) > maxTokens
  );
  return fitRangeEndIndex === -1 ? content : content.slice(0, fitRangeEndIndex);
}
