import { makeEvaluateConversationQuality } from "./evaluateConversationQuality";
import { strict as assert } from "assert";
import "dotenv/config";
import { AzureOpenAI } from "mongodb-rag-core/openai";
import { ObjectId } from "mongodb-rag-core/mongodb";
import { ConversationGeneratedData } from "../generate";
import { EvalResult } from "./EvaluationStore";
import { mongodbResponseQualityExamples } from "./checkResponseQuality";
import { assertEnvVars, CORE_ENV_VARS } from "mongodb-rag-core";

const {
  OPENAI_ENDPOINT,
  OPENAI_API_KEY,
  OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  OPENAI_API_VERSION,
} = assertEnvVars(CORE_ENV_VARS);
assert(OPENAI_ENDPOINT);
assert(OPENAI_API_KEY);
assert(OPENAI_CHAT_COMPLETION_DEPLOYMENT);

jest.setTimeout(10000);

const deploymentName = OPENAI_CHAT_COMPLETION_DEPLOYMENT;
const openAiClient = new AzureOpenAI({
  apiKey: OPENAI_API_KEY,
  endpoint: OPENAI_ENDPOINT,
  apiVersion: OPENAI_API_VERSION,
});

const generatedConversationData = {
  _id: new ObjectId(),
  commandRunId: new ObjectId(),
  type: "conversation",
  data: {
    _id: new ObjectId(),
    createdAt: new Date(),
    messages: [
      {
        createdAt: new Date(),
        id: new ObjectId(),
        role: "user",
        content: "I am a golden retriever named Jasper.",
      },
      {
        createdAt: new Date(),
        id: new ObjectId(),
        role: "assistant",
        content: "Hi Jasper! What can I help you with today?",
      },
      {
        createdAt: new Date(),
        id: new ObjectId(),
        role: "user",
        content: "What's my name?",
      },
      {
        createdAt: new Date(),
        id: new ObjectId(),
        role: "assistant",
        content: "Your name is Jasper.",
      },
    ],
  },
  evalData: {
    qualitativeFinalAssistantMessageExpectation:
      "The assistant should correctly respond with the user's name.",
    name: "User name",
  },
  createdAt: new Date(),
} satisfies ConversationGeneratedData;

describe("makeEvaluateConversationQuality", () => {
  const evaluateConversationQuality = makeEvaluateConversationQuality({
    openAiClient,
    deploymentName,
    fewShotExamples: mongodbResponseQualityExamples,
  });
  const commandRunId = new ObjectId();
  it("should return '1' if the conversation meets quality standards", async () => {
    const evalResult = await evaluateConversationQuality({
      runId: commandRunId,
      generatedData: generatedConversationData,
    });
    expect(evalResult).toMatchObject({
      result: 1,
      generatedDataId: generatedConversationData._id,
      type: "conversation_quality",
      metadata: {
        reason: expect.any(String),
      },
      createdAt: expect.any(Date),
      _id: expect.any(ObjectId),
      commandRunMetadataId: commandRunId,
    } satisfies EvalResult);
  });
  it("should return '0' if the conversation does not meets quality standards. Also includes reason in metadata", async () => {
    const evalResult = await evaluateConversationQuality({
      runId: commandRunId,
      generatedData: {
        ...generatedConversationData,
        evalData: {
          qualitativeFinalAssistantMessageExpectation:
            "The assistant should respond in Chinese.",
        },
      },
    });
    expect(evalResult).toMatchObject({
      result: 0,
      generatedDataId: generatedConversationData._id,
      type: "conversation_quality",
      metadata: {
        reason: expect.any(String),
      },
      createdAt: expect.any(Date),
      _id: expect.any(ObjectId),
      commandRunMetadataId: commandRunId,
    } satisfies EvalResult);
  });
  it("should throw if no 'qualitativeFinalAssistantMessageExpectation'", async () => {
    expect(async () =>
      evaluateConversationQuality({
        runId: commandRunId,
        generatedData: {
          ...generatedConversationData,
          evalData: {},
        },
      })
    ).rejects.toThrow();
  });
});
