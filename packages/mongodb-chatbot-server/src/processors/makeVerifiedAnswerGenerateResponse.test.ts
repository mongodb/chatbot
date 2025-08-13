import { ObjectId } from "mongodb-rag-core/mongodb";
import {
  makeVerifiedAnswerGenerateResponse,
  responsesVerifiedAnswerStream,
  type StreamFunction,
} from "./makeVerifiedAnswerGenerateResponse";
import { VerifiedAnswer, WithScore, DataStreamer } from "mongodb-rag-core";
import { GenerateResponseReturnValue } from "./GenerateResponse";

describe("makeVerifiedAnswerGenerateResponse", () => {
  const MAGIC_VERIFIABLE = "VERIFIABLE";
  const references = [{ title: "title", url: "url" }];
  const verifiedAnswerContent = "verified answer";
  const verifiedAnswerId = "123";

  const testDate = new Date();
  const queryEmbedding = [1, 2, 3];
  const mockObjectId = new ObjectId();

  const noVerifiedAnswerFoundMessages = [
    {
      role: "user",
      content: "returned from onNoVerifiedAnswerFound",
    },
    {
      role: "assistant",
      content: "Not verified!",
    },
  ] satisfies GenerateResponseReturnValue["messages"];

  const streamVerifiedAnswer: StreamFunction<{
    verifiedAnswer: VerifiedAnswer;
  }> = async ({ dataStreamer, verifiedAnswer }) => {
    dataStreamer.streamData({
      type: "metadata",
      data: {
        verifiedAnswer: {
          _id: verifiedAnswer._id,
          created: verifiedAnswer.created,
          updated: verifiedAnswer.updated,
        },
      },
    });
    dataStreamer.streamData({
      type: "delta",
      data: verifiedAnswer.answer,
    });
    dataStreamer.streamData({
      type: "references",
      data: verifiedAnswer.references,
    });
  };

  // Create a mock verified answer
  const createMockVerifiedAnswer = (): WithScore<VerifiedAnswer> => ({
    answer: verifiedAnswerContent,
    _id: verifiedAnswerId,
    author_email: "example@mongodb.com",
    created: testDate,
    references,
    question: {
      text: "question",
      embedding: queryEmbedding,
      embedding_model: "model",
      embedding_model_version: "version",
    },
    updated: testDate,
    score: 1,
  });

  // Create a mock conversation
  const createMockConversation = () => ({
    _id: mockObjectId,
    messages: [],
    createdAt: testDate,
  });

  // Create a mock data streamer
  const createMockDataStreamer = (): DataStreamer => ({
    connected: true,
    streamData: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    stream: jest.fn(),
    streamResponses: jest.fn(),
  });

  // Create base request parameters
  const createBaseRequestParams = (
    text: string,
    shouldStream = false,
    dataStreamer?: DataStreamer
  ) => ({
    reqId: "",
    latestMessageText: text,
    shouldStream,
    ...(dataStreamer && { dataStreamer }),
    conversation: createMockConversation(),
  });

  const generateResponse = makeVerifiedAnswerGenerateResponse({
    findVerifiedAnswer: async ({ query }) => ({
      queryEmbedding,
      answer:
        query === MAGIC_VERIFIABLE ? createMockVerifiedAnswer() : undefined,
    }),
    onNoVerifiedAnswerFound: async () => ({
      messages: noVerifiedAnswerFoundMessages,
    }),
    stream: {
      onVerifiedAnswerFound: streamVerifiedAnswer,
    },
  });

  it("uses onNoVerifiedAnswerFound if no verified answer is found", async () => {
    const answer = await generateResponse(
      createBaseRequestParams("not verified")
    );

    expect(answer.messages).toMatchObject(noVerifiedAnswerFoundMessages);
  });

  it("uses verified answer if available", async () => {
    const answer = await generateResponse(
      createBaseRequestParams(MAGIC_VERIFIABLE)
    );

    expect(answer.messages).toHaveLength(2);
    expect(answer.messages[0].content).toBe(MAGIC_VERIFIABLE);
  });

  it("skips verified answer if custom system prompt", async () => {
    const answer = await generateResponse({
      ...createBaseRequestParams(
        MAGIC_VERIFIABLE,
        true,
        createMockDataStreamer()
      ),
      customSystemPrompt: "Custom system prompt",
    });

    expect(answer.messages).toMatchObject(noVerifiedAnswerFoundMessages);
  });

  it("skips verified answer if tools", async () => {
    const answer = await generateResponse({
      ...createBaseRequestParams(
        MAGIC_VERIFIABLE,
        true,
        createMockDataStreamer()
      ),
      toolDefinitions: [
        { name: "tool", description: "description", parameters: {} },
      ],
    });

    expect(answer.messages).toMatchObject(noVerifiedAnswerFoundMessages);
  });

  it("skips verified answer if tool choice", async () => {
    const answer = await generateResponse({
      ...createBaseRequestParams(
        MAGIC_VERIFIABLE,
        true,
        createMockDataStreamer()
      ),
      toolChoice: "auto",
    });

    expect(answer.messages).toMatchObject(noVerifiedAnswerFoundMessages);
  });

  describe("streaming functionality", () => {
    it("streams verified answer data when shouldStream is true", async () => {
      const mockDataStreamer = createMockDataStreamer();

      await generateResponse(
        createBaseRequestParams(MAGIC_VERIFIABLE, true, mockDataStreamer)
      );

      expect(mockDataStreamer.streamData).toHaveBeenCalledTimes(3);

      // Check metadata was streamed
      expect(mockDataStreamer.streamData).toHaveBeenCalledWith({
        type: "metadata",
        data: {
          verifiedAnswer: {
            _id: verifiedAnswerId,
            created: testDate,
            updated: testDate,
          },
        },
      });

      // Check answer was streamed
      expect(mockDataStreamer.streamData).toHaveBeenCalledWith({
        type: "delta",
        data: verifiedAnswerContent,
      });

      // Check references were streamed
      expect(mockDataStreamer.streamData).toHaveBeenCalledWith({
        type: "references",
        data: references,
      });
    });

    it("streams verified answer annotations when shouldStream is true", async () => {
      const mockDataStreamer = createMockDataStreamer();

      // Create a separate generateResponse that uses the actual responsesVerifiedAnswerStream
      const generateResponseWithActualStream =
        makeVerifiedAnswerGenerateResponse({
          findVerifiedAnswer: async ({ query }) => ({
            queryEmbedding,
            answer:
              query === MAGIC_VERIFIABLE
                ? createMockVerifiedAnswer()
                : undefined,
          }),
          onNoVerifiedAnswerFound: async () => ({
            messages: noVerifiedAnswerFoundMessages,
          }),
          stream: responsesVerifiedAnswerStream,
        });

      await generateResponseWithActualStream(
        createBaseRequestParams(MAGIC_VERIFIABLE, true, mockDataStreamer)
      );

      // Check that streamResponses was called for text delta first
      expect(mockDataStreamer.streamResponses).toHaveBeenCalledWith({
        type: "response.output_text.delta",
        delta: verifiedAnswerContent,
        content_index: 0,
        output_index: 0,
        item_id: expect.any(String),
      });

      // Check that streamResponses was called for URL citations (one per reference)
      expect(mockDataStreamer.streamResponses).toHaveBeenCalledWith({
        type: "response.output_text.annotation.added",
        annotation: {
          type: "url_citation",
          url: "url",
          title: "title",
          start_index: 0,
          end_index: 0,
        },
        annotation_index: 0,
        content_index: 0,
        output_index: 0,
        item_id: expect.any(String),
      });

      // Check that streamResponses was called for file citation annotation
      expect(mockDataStreamer.streamResponses).toHaveBeenCalledWith({
        type: "response.output_text.annotation.added",
        annotation: {
          type: "file_citation",
          file_id: verifiedAnswerId,
          filename: "verified_answer",
          index: testDate.getTime(), // Uses updated time, falls back to created time
        },
        annotation_index: references.length, // One more than the last reference
        content_index: 0,
        output_index: 0,
        item_id: expect.any(String),
      });

      // Check that streamResponses was called for text done
      expect(mockDataStreamer.streamResponses).toHaveBeenCalledWith({
        type: "response.output_text.done",
        text: verifiedAnswerContent,
        content_index: 0,
        output_index: 0,
        item_id: expect.any(String),
      });

      // Verify total number of streamResponses calls
      expect(mockDataStreamer.streamResponses).toHaveBeenCalledTimes(4); // 1 text delta + 1 URL citation + 1 file citation + 1 text done
    });

    it("doesn't stream data when shouldStream is false", async () => {
      const mockDataStreamer = createMockDataStreamer();

      await generateResponse(
        createBaseRequestParams(MAGIC_VERIFIABLE, false, mockDataStreamer)
      );

      expect(mockDataStreamer.streamData).not.toHaveBeenCalled();
      expect(mockDataStreamer.streamResponses).not.toHaveBeenCalled();
    });

    it("throws an error when shouldStream is true but dataStreamer is missing", async () => {
      await expect(
        generateResponse(createBaseRequestParams(MAGIC_VERIFIABLE, true))
      ).rejects.toThrow("Must have dataStreamer if shouldStream=true");
    });

    it("doesn't attempt to stream when no verified answer is found", async () => {
      const mockDataStreamer = createMockDataStreamer();

      await generateResponse(
        createBaseRequestParams("not verified", true, mockDataStreamer)
      );

      expect(mockDataStreamer.streamData).not.toHaveBeenCalled();
      expect(mockDataStreamer.streamResponses).not.toHaveBeenCalled();
    });
  });
});
