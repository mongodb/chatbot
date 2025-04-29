import { ObjectId } from "mongodb-rag-core/mongodb";
import { makeVerifiedAnswerGenerateResponse } from "./makeVerifiedAnswerGenerateResponse";
import { VerifiedAnswer, WithScore, DataStreamer } from "mongodb-rag-core";

describe("makeVerifiedAnswerGenerateResponse", () => {
  const MAGIC_VERIFIABLE = "VERIFIABLE";
  const references = [{ title: "title", url: "url" }];
  const verifiedAnswerContent = "verified answer";
  const verifiedAnswerId = "123";

  const testDate = new Date();
  const queryEmbedding = [1, 2, 3];
  const mockObjectId = new ObjectId();

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
      messages: [
        {
          role: "user",
          content: "returned from onNoVerifiedAnswerFound",
        },
      ],
    }),
  });

  it("uses onNoVerifiedAnswerFound if no verified answer is found", async () => {
    const answer = await generateResponse(
      createBaseRequestParams("not verified")
    );

    expect(answer.messages).toHaveLength(1);
    expect(answer.messages[0].content).toBe(
      "returned from onNoVerifiedAnswerFound"
    );
  });

  it("uses verified answer if available", async () => {
    const answer = await generateResponse(
      createBaseRequestParams(MAGIC_VERIFIABLE)
    );

    expect(answer.messages).toHaveLength(2);
    expect(answer.messages[0].content).toBe(MAGIC_VERIFIABLE);
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

    it("doesn't stream data when shouldStream is false", async () => {
      const mockDataStreamer = createMockDataStreamer();

      await generateResponse(
        createBaseRequestParams(MAGIC_VERIFIABLE, false, mockDataStreamer)
      );

      expect(mockDataStreamer.streamData).not.toHaveBeenCalled();
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
    });
  });
});
