import "dotenv/config";
import { ObjectId } from "mongodb-rag-core";
import { makeEvaluateConversationFaithfulness } from "./evaluateConversationFaithfulness";
import { Message } from "mongodb-chatbot-server";
import { OpenAI } from "llamaindex";
import assert from "assert";
import { mockConversationGeneratedDataFromMessages } from "../test/mockConversationGeneratedDataFromMessages";

const { OPENAI_ENDPOINT, OPENAI_API_KEY, OPENAI_CHAT_COMPLETION_DEPLOYMENT } =
  process.env;
assert(OPENAI_ENDPOINT);
assert(OPENAI_API_KEY);
assert(OPENAI_CHAT_COMPLETION_DEPLOYMENT);

describe("makeEvaluateConversationFaithfulness", () => {
  const llamaIndexLlm = new OpenAI({
    azure: {
      apiKey: OPENAI_API_KEY,
      endpoint: OPENAI_ENDPOINT,
      deploymentName: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
    },
  });
  const evaluateFaithfulness = makeEvaluateConversationFaithfulness({
    llamaIndexLlm,
  });
  const runId = new ObjectId();
  test("should evaluate that response is faithful", async () => {
    const messages = [
      {
        id: new ObjectId(),
        createdAt: new Date(),
        role: "user",
        content: "What color is the sky",
        contextContent: [
          {
            text: "The sky today is blue",
          },
          {
            text: "The sky yesterday was red",
          },
        ],
      },
      {
        id: new ObjectId(),
        createdAt: new Date(),
        role: "assistant",
        content: "The sky is blue today",
      },
    ] satisfies Message[];
    const faithfulGeneratedData =
      mockConversationGeneratedDataFromMessages(messages);

    const evalResult = await evaluateFaithfulness({
      runId,
      generatedData: faithfulGeneratedData,
    });
    expect(evalResult).toMatchObject({
      generatedDataId: faithfulGeneratedData._id,
      result: 1,
      type: "conversation_faithfulness",
      _id: expect.any(ObjectId),
      createdAt: expect.any(Date),
      commandRunMetadataId: runId,
      metadata: {
        contextContent: messages[0]!.contextContent!.map(({ text }) => text),
        userQueryContent: messages[0].content,
        assistantResponseContent: messages[1].content,
      },
    });
  });
  test("should evaluate that response is not faithful", async () => {
    const messages = [
      {
        id: new ObjectId(),
        createdAt: new Date(),
        role: "user",
        content: "What color is the sky",
        contextContent: [
          {
            text: "The sky today is blue",
          },
          {
            text: "The sky yesterday was red",
          },
        ],
      },
      {
        id: new ObjectId(),
        createdAt: new Date(),
        role: "assistant",
        content: "The sky is red today",
      },
    ] satisfies Message[];
    const faithfulGeneratedData =
      mockConversationGeneratedDataFromMessages(messages);

    const evalResult = await evaluateFaithfulness({
      runId,
      generatedData: faithfulGeneratedData,
    });
    expect(evalResult).toMatchObject({
      generatedDataId: faithfulGeneratedData._id,
      result: 0,
      type: "conversation_faithfulness",
      _id: expect.any(ObjectId),
      createdAt: expect.any(Date),
      commandRunMetadataId: runId,
      metadata: {
        contextContent: messages[0]!.contextContent!.map(({ text }) => text),
        userQueryContent: messages[0].content,
        assistantResponseContent: messages[1].content,
      },
    });
  });
});
