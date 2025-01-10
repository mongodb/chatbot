import { SomeMessage } from "mongodb-rag-core";
import { extractTracingData } from "./tracing";
import { llmDoesNotKnowMessage } from "./systemPrompt";
describe("extractTracingData", () => {
  test("should reject query", () => {
    const messages: SomeMessage[] = [
      {
        role: "user",
        rejectQuery: true,
        content: "",
      },
    ];
    const tracingData = extractTracingData(messages);
    expect(tracingData.rejectQuery).toBe(true);
    expect(tracingData.tags.includes("rejected_query")).toBe(true);
  });
  test("should extract metadata", () => {
    const messages: SomeMessage[] = [
      {
        role: "user",
        content: "",
        customData: {
          programmingLanguage: "javascript",
          mongoDbProduct: "MongoDB Atlas",
        },
      },
    ];
    const tracingData = extractTracingData(messages);
    expect(tracingData.tags.includes("javascript")).toBe(true);
    expect(tracingData.tags.includes("mongodb_atlas")).toBe(true);
  });
  test("should get number of retrieved chunks", () => {
    const messagesNoContext: SomeMessage[] = [
      {
        role: "user",
        content: "",
        contextContent: [],
      },
    ];
    const tracingData = extractTracingData(messagesNoContext);
    expect(tracingData.numRetrievedChunks).toBe(0);
    expect(tracingData.tags.includes("no_retrieved_content")).toBe(true);

    const messagesWithContext: SomeMessage[] = [
      {
        role: "user",
        content: "",
        contextContent: [
          {
            text: "",
          },
          {
            text: "",
          },
        ],
      },
    ];
    const tracingDataWithContext = extractTracingData(messagesWithContext);
    expect(tracingDataWithContext.numRetrievedChunks).toBe(2);
    expect(tracingDataWithContext.tags.includes("no_retrieved_content")).toBe(
      false
    );
  });
  test("should capture verified answer", () => {
    const messagesNoContext: SomeMessage[] = [
      {
        role: "assistant",
        content: "",
        metadata: {
          verifiedAnswer: {
            _id: "123",
            created: new Date(),
          },
        },
      },
    ];
    const tracingData = extractTracingData(messagesNoContext);
    expect(tracingData.isVerifiedAnswer).toBe(true);
    expect(tracingData.tags.includes("verified_answer")).toBe(true);
  });
  test("should capture LLM does not know", () => {
    const messagesNoContext: SomeMessage[] = [
      {
        role: "assistant",
        content: llmDoesNotKnowMessage,
      },
    ];
    const tracingData = extractTracingData(messagesNoContext);
    expect(tracingData.llmDoesNotKnow).toBe(true);
    expect(tracingData.tags.includes("llm_does_not_know")).toBe(true);
  });
});
