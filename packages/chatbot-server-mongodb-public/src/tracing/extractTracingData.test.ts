import { DbMessage, Message, ToolMessage } from "mongodb-rag-core";
import { ObjectId } from "mongodb-rag-core/mongodb";
import { llmDoesNotKnowMessage } from "../systemPrompt";
import { extractTracingData } from "./extractTracingData";
import { SEARCH_TOOL_NAME, SearchToolReturnValue } from "../tools/search";

describe("extractTracingData", () => {
  const msgId = new ObjectId();
  const baseUserMessage: Message = {
    role: "user",
    content: "foo",
    createdAt: new Date(),
    id: new ObjectId(),
  };
  const baseAssistantMessage: Message = {
    role: "assistant",
    content: "foo",
    createdAt: new Date(),
    id: msgId,
  };
  const toolResults = {
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

  const baseToolMessage: DbMessage<ToolMessage> = {
    role: "tool",
    name: SEARCH_TOOL_NAME,
    content: JSON.stringify(toolResults),
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
      baseAssistantMessage,
    ];
    const tracingData = extractTracingData(messages, msgId, conversationId);
    expect(tracingData.rejectQuery).toBe(true);
    expect(tracingData.tags.includes("rejected_query")).toBe(true);
  });
  test("should get number of retrieved chunks", () => {
    const messagesNoContext: Message[] = [
      {
        ...baseUserMessage,
      },
      { ...baseToolMessage, content: JSON.stringify([]) },
      baseAssistantMessage,
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
      baseToolMessage,
      baseAssistantMessage,
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
  });
  test("should capture verified answer", () => {
    const messagesNoContext: Message[] = [
      baseUserMessage,
      {
        ...baseAssistantMessage,
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
        ...baseAssistantMessage,
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
    const messages: Message[] = [baseUserMessage, baseAssistantMessage];
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
      baseAssistantMessage,
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
      baseAssistantMessage,
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
      baseAssistantMessage,
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
      baseAssistantMessage,
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
      baseAssistantMessage,
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
      baseAssistantMessage,
    ];
    const tracingData = extractTracingData(
      messagesInvalidRejection,
      msgId,
      conversationId
    );
    expect(tracingData.rejectionReason).toBe("Unknown rejection reason");
  });
});
