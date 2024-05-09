import "dotenv/config";
import { ObjectId } from "mongodb-rag-core";
import { makeEvaluateConversationRelevancy } from "./evaluateConversationRelevancy";
import { Message } from "mongodb-chatbot-server";
import { OpenAI } from "llamaindex";
import assert from "assert";
import { mockConversationGeneratedDataFromMessages } from "../test/mockConversationGeneratedDataFromMessages";

const { OPENAI_ENDPOINT, OPENAI_API_KEY, OPENAI_CHAT_COMPLETION_DEPLOYMENT } =
  process.env;
assert(OPENAI_ENDPOINT);
assert(OPENAI_API_KEY);
assert(OPENAI_CHAT_COMPLETION_DEPLOYMENT);

describe("makeEvaluateConversationRelevancy", () => {
  const llamaIndexLlm = new OpenAI({
    azure: {
      apiKey: OPENAI_API_KEY,
      endpoint: OPENAI_ENDPOINT,
      deploymentName: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
    },
  });
  const evaluateRelevancy = makeEvaluateConversationRelevancy({
    llamaIndexLlm,
  });
  const runId = new ObjectId();
  test("should evaluate that response is relevant", async () => {
    const messages = [
      {
        id: new ObjectId(),
        createdAt: new Date(),
        role: "user",
        content: "What color is the sky",
        contextContent: [
          {
            text: "The sky is blue",
          },
          {
            text: "Skies can be a variety of colors",
          },
        ],
      },
      {
        id: new ObjectId(),
        createdAt: new Date(),
        role: "assistant",
        content: "The sky is blue",
      },
    ] satisfies Message[];
    const faithfulGeneratedData =
      mockConversationGeneratedDataFromMessages(messages);

    const evalResult = await evaluateRelevancy({
      runId,
      generatedData: faithfulGeneratedData,
    });

    expect(evalResult).toMatchObject({
      generatedDataId: faithfulGeneratedData._id,
      result: 1,
      type: "conversation_relevancy",
      _id: expect.any(ObjectId),
      createdAt: expect.any(Date),
      commandRunMetadataId: runId,
      metadata: {
        contextContent:
          messages[0]?.contextContent?.map(({ text }) => text) ?? "",
        userQueryContent: messages[0].content,
        assistantResponseContent: messages[1].content,
      },
    });
  });
  test("should evaluate that response is not relevant", async () => {
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
        content: "My dog's name is Georgia",
      },
    ] satisfies Message[];
    const faithfulGeneratedData =
      mockConversationGeneratedDataFromMessages(messages);

    const evalResult = await evaluateRelevancy({
      runId,
      generatedData: faithfulGeneratedData,
    });
    expect(evalResult).toMatchObject({
      generatedDataId: faithfulGeneratedData._id,
      result: 0,
      type: "conversation_relevancy",
      _id: expect.any(ObjectId),
      createdAt: expect.any(Date),
      commandRunMetadataId: runId,
      metadata: {
        contextContent:
          messages[0]?.contextContent?.map(({ text }) => text) ?? "",
        userQueryContent: messages[0].content,
        assistantResponseContent: messages[1].content,
      },
    });
  });
});
