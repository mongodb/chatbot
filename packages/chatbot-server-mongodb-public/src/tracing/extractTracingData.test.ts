import { strict as assert } from "assert";
import { DbMessage, Message, ToolMessage } from "mongodb-rag-core";
import { ObjectId } from "mongodb-rag-core/mongodb";
import { llmDoesNotKnowMessage } from "../systemPrompt";
import { extractTracingData } from "./extractTracingData";
import { SEARCH_TOOL_NAME, SearchToolReturnValue } from "../tools/search";
import {
  FETCH_PAGE_TOOL_NAME,
  FetchPageToolResult,
  SEARCH_ALL_FALLBACK_TEXT,
} from "../tools/fetchPage";

describe("extractTracingData", () => {
  const msgId = new ObjectId();
  const baseUserMessage: Message = {
    role: "user",
    content: "foo",
    createdAt: new Date(),
    id: new ObjectId(),
  };

  const baseSearchToolCallMessage: Message = {
    role: "assistant",
    content: "",
    toolCall: {
      id: "tool-call-id",
      type: "function",
      function: {
        name: SEARCH_TOOL_NAME,
        arguments: "{}",
      },
    },
    createdAt: new Date(),
    id: new ObjectId(),
  };

  const baseFetchPageToolCallMessage: Message = {
    role: "assistant",
    content: "",
    toolCall: {
      id: "tool-call-id",
      type: "function",
      function: {
        name: FETCH_PAGE_TOOL_NAME,
        arguments: "{}",
      },
    },
    createdAt: new Date(),
    id: new ObjectId(),
  };
  const fetchPageToolCallMessage = { ...baseFetchPageToolCallMessage };
  assert(fetchPageToolCallMessage.toolCall);
  if (fetchPageToolCallMessage.toolCall.type !== "function") {
    throw new Error("No function call in response from OpenAI");
  }
  const fetchPageArgs = {
    pageUrl: "https://mongodb.com/docs/page",
    query: "rephrased user query",
  };
  fetchPageToolCallMessage.toolCall.function.arguments = `{"pageUrl":"${fetchPageArgs.pageUrl}","query":"${fetchPageArgs.query}"}`;

  const baseAssistantResponseMessage: Message = {
    role: "assistant",
    content: "foo",
    createdAt: new Date(),
    id: msgId,
  };

  const searchToolResults = {
    results: [
      {
        text: "text",
        url: "url",
      },
      {
        text: "text",
        url: "url",
      },
    ],
  } satisfies SearchToolReturnValue;

  const fetchPageToolResults = {
    text: "mock page content",
    references: [{ url: "http://fake-url.com", title: "mock title" }],
  } satisfies FetchPageToolResult;

  const baseSearchToolMessage: DbMessage<ToolMessage> = {
    role: "tool",
    name: SEARCH_TOOL_NAME,
    content: JSON.stringify(searchToolResults),
    createdAt: new Date(),
    id: new ObjectId(),
  };

  const baseFetchPageToolMessage: DbMessage<ToolMessage> = {
    role: "tool",
    name: FETCH_PAGE_TOOL_NAME,
    content: JSON.stringify(fetchPageToolResults),
    createdAt: new Date(),
    id: new ObjectId(),
  };

  const conversationId = new ObjectId();

  test("should reject query", () => {
    const messages: Message[] = [
      {
        ...baseUserMessage,
        rejectQuery: true,
      },
      baseAssistantResponseMessage,
    ];
    const tracingData = extractTracingData(messages, msgId, conversationId);
    expect(tracingData.rejectQuery).toBe(true);
    expect(tracingData.tags.includes("rejected_query")).toBe(true);
  });
  test("should get num. chunks, tool metadata after using search tool", () => {
    const messagesNoContext: Message[] = [
      {
        ...baseUserMessage,
      },
      baseSearchToolCallMessage,
      { ...baseSearchToolMessage, content: JSON.stringify([]) },
      baseAssistantResponseMessage,
    ];
    const tracingData = extractTracingData(
      messagesNoContext,
      msgId,
      conversationId
    );
    expect(tracingData.numRetrievedChunks).toBe(0);
    expect(tracingData.tags.includes("no_retrieved_content")).toBe(true);

    const messagesWithContext: Message[] = [
      {
        ...baseUserMessage,
      },
      baseSearchToolCallMessage,
      baseSearchToolMessage,
      baseAssistantResponseMessage,
    ];
    const tracingDataWithContext = extractTracingData(
      messagesWithContext,
      msgId,
      conversationId
    );
    expect(tracingDataWithContext.numRetrievedChunks).toBe(2);
    expect(tracingDataWithContext.tags.includes("no_retrieved_content")).toBe(
      false
    );
    expect(tracingDataWithContext.firstToolMetadata).toEqual({
      name: SEARCH_TOOL_NAME,
    });
  });
  test("should get 1 chunks, tool metadata after using fetch_page tool", () => {
    const messagesNoContext: Message[] = [
      baseUserMessage,
      baseFetchPageToolCallMessage,
      { ...baseFetchPageToolMessage, content: SEARCH_ALL_FALLBACK_TEXT },
      baseAssistantResponseMessage,
    ];
    const tracingDataWithoutContext = extractTracingData(
      messagesNoContext,
      msgId,
      conversationId
    );
    console.log(tracingDataWithoutContext.contextContent);
    expect(tracingDataWithoutContext.numRetrievedChunks).toBe(0);
    expect(
      tracingDataWithoutContext.tags.includes("no_retrieved_content")
    ).toBe(true);

    const messagesWithContext: Message[] = [
      baseUserMessage,
      fetchPageToolCallMessage,
      baseFetchPageToolMessage,
      baseAssistantResponseMessage,
    ];
    const tracingDataWithContext = extractTracingData(
      messagesWithContext,
      msgId,
      conversationId
    );
    expect(tracingDataWithContext.numRetrievedChunks).toBe(1);
    expect(tracingDataWithContext.tags.includes("no_retrieved_content")).toBe(
      false
    );
    expect(tracingDataWithContext.firstToolMetadata).toEqual({
      name: FETCH_PAGE_TOOL_NAME,
      ...fetchPageArgs,
    });
  });
  test("should get multiple chunks, tool metadata after using fetch_page+search tools", () => {
    // Neither tool finds context
    const messagesNoContext: Message[] = [
      baseUserMessage,
      fetchPageToolCallMessage,
      { ...baseFetchPageToolMessage, content: SEARCH_ALL_FALLBACK_TEXT },
      baseSearchToolCallMessage,
      { ...baseSearchToolMessage, content: JSON.stringify({}) },
      baseAssistantResponseMessage,
    ];
    const tracingDataWithoutContext = extractTracingData(
      messagesNoContext,
      msgId,
      conversationId
    );
    console.log(tracingDataWithoutContext.contextContent);
    expect(tracingDataWithoutContext.numRetrievedChunks).toBe(0);
    expect(
      tracingDataWithoutContext.tags.includes("no_retrieved_content")
    ).toBe(true);

    // Fetch_page finds no context, Search tool finds context
    const messagesFallbackHasContext: Message[] = [
      baseUserMessage,
      fetchPageToolCallMessage,
      { ...baseFetchPageToolMessage, content: JSON.stringify({}) },
      baseSearchToolMessage,
      baseAssistantResponseMessage,
    ];
    const tracingDataFallbackHasContext = extractTracingData(
      messagesFallbackHasContext,
      msgId,
      conversationId
    );
    expect(tracingDataFallbackHasContext.numRetrievedChunks).toBe(2);
    expect(
      tracingDataFallbackHasContext.tags.includes("no_retrieved_content")
    ).toBe(false);
    // first tool call was still fetch_page
    expect(tracingDataWithoutContext.firstToolMetadata).toEqual({
      name: FETCH_PAGE_TOOL_NAME,
      ...fetchPageArgs,
    });
  });
  test("should capture verified answer", () => {
    const messagesNoContext: Message[] = [
      baseUserMessage,
      {
        ...baseAssistantResponseMessage,
        metadata: {
          verifiedAnswer: {
            _id: "123",
            created: new Date(),
          },
        },
      },
    ];
    const tracingData = extractTracingData(
      messagesNoContext,
      msgId,
      conversationId
    );
    expect(tracingData.isVerifiedAnswer).toBe(true);
    expect(tracingData.tags.includes("verified_answer")).toBe(true);
  });
  test("should capture LLM does not know", () => {
    const messagesNoContext: Message[] = [
      baseUserMessage,
      {
        ...baseAssistantResponseMessage,
        content: llmDoesNotKnowMessage,
      },
    ];
    const tracingData = extractTracingData(
      messagesNoContext,
      msgId,
      conversationId
    );
    expect(tracingData.llmDoesNotKnow).toBe(true);
    expect(tracingData.tags.includes("llm_does_not_know")).toBe(true);
  });
  test("should capture message indexes", () => {
    const messages: Message[] = [baseUserMessage, baseAssistantResponseMessage];
    const tracingData = extractTracingData(messages, msgId, conversationId);
    expect(tracingData.userMessageIndex).toBe(0);
    expect(tracingData.assistantMessageIndex).toBe(1);
  });

  test("should extract origin from customData", () => {
    const messagesWithOrigin: Message[] = [
      {
        ...baseUserMessage,
        customData: {
          origin: "https://example.com/chat",
        },
      },
      baseAssistantResponseMessage,
    ];
    const tracingData = extractTracingData(
      messagesWithOrigin,
      msgId,
      conversationId
    );
    expect(tracingData.origin).toBe("https://example.com/chat");
  });

  test("should handle missing origin", () => {
    const messagesNoOrigin: Message[] = [
      {
        ...baseUserMessage,
        customData: {},
      },
      baseAssistantResponseMessage,
    ];
    const tracingData = extractTracingData(
      messagesNoOrigin,
      msgId,
      conversationId
    );
    expect(tracingData.origin).toBeUndefined();
  });

  test("should handle non-string origin", () => {
    const messagesInvalidOrigin: Message[] = [
      {
        ...baseUserMessage,
        customData: {
          origin: 123, // non-string value
        },
      },
      baseAssistantResponseMessage,
    ];
    const tracingData = extractTracingData(
      messagesInvalidOrigin,
      msgId,
      conversationId
    );
    expect(tracingData.origin).toBeUndefined();
  });

  test("should extract rejectionReason from customData", () => {
    const messagesWithRejection: Message[] = [
      {
        ...baseUserMessage,
        customData: {
          rejectionReason: "Query contains inappropriate content",
        },
      },
      baseAssistantResponseMessage,
    ];
    const tracingData = extractTracingData(
      messagesWithRejection,
      msgId,
      conversationId
    );
    expect(tracingData.rejectionReason).toBe(
      "Query contains inappropriate content"
    );
  });

  test("should use default rejection reason when missing", () => {
    const messagesNoRejection: Message[] = [
      {
        ...baseUserMessage,
        customData: {},
      },
      baseAssistantResponseMessage,
    ];
    const tracingData = extractTracingData(
      messagesNoRejection,
      msgId,
      conversationId
    );
    expect(tracingData.rejectionReason).toBe("Unknown rejection reason");
  });

  test("should use default rejection reason for non-string value", () => {
    const messagesInvalidRejection: Message[] = [
      {
        ...baseUserMessage,
        customData: {
          rejectionReason: { reason: "complex object" }, // non-string value
        },
      },
      baseAssistantResponseMessage,
    ];
    const tracingData = extractTracingData(
      messagesInvalidRejection,
      msgId,
      conversationId
    );
    expect(tracingData.rejectionReason).toBe("Unknown rejection reason");
  });
});
