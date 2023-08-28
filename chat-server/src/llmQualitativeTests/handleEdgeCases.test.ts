import { MongoDB } from "chat-core";
import { Express } from "express";
import { makeConversationsRoutesDefaults } from "../testHelpers";
import { ConversationsService } from "../services/conversations";
import { CONVERSATIONS_API_V1_PREFIX } from "../app";
import { TestCaseMessage, generateTranscript } from "./generateChatTranscript";
import { conversationConstants } from "../services/conversations";
import "../../global.d";

const { NO_RELEVANT_CONTENT } = conversationConstants;
let mongodb: MongoDB;
let app: Express;
let conversations: ConversationsService;
let ipAddress: string;
const addMessageEndpoint =
  CONVERSATIONS_API_V1_PREFIX + "/:conversationId/messages?stream=false";

jest.setTimeout(30000);
beforeAll(async () => {
  ({ mongodb, app, conversations, ipAddress } =
    await makeConversationsRoutesDefaults());
});
afterAll(async () => {
  await mongodb?.db.dropDatabase();
  await mongodb?.close();
});

describe("Do not mention context information if search results but LLM doesn't know how to answer the question", () => {
  test("Should not mention context information if nonsense question with semantically relevant phrases", async () => {
    const messages: TestCaseMessage[] = [
      {
        role: "user",
        content:
          "how do i use mongodb to run linear regressions leveraging atlas app services",
      },
    ];
    const transcript = await generateTranscript({
      messages: messages,
      conversations,
      app,
      ipAddress,
      endpoint: addMessageEndpoint,
    });

    await expect(transcript).toMeetChatQualityStandard(
      "The assistant DOES NOT mention the context information (<CONTEXT>) provided to the chatbot"
    );
  });
  test("Should not mention context information for a good question that is not directly covered in the source material", async () => {
    const messages: TestCaseMessage[] = [
      {
        role: "user",
        content:
          "How can I use MongoDB community edition in conjunction with Azure functions and the Google Maps API?",
      },
    ];
    const transcript = await generateTranscript({
      messages: messages,
      conversations,
      app,
      ipAddress,
      endpoint: addMessageEndpoint,
    });
    await expect(transcript).toMeetChatQualityStandard(
      "The assistant DOES NOT mention the context information (<CONTEXT>) provided to the chatbot"
    );
  });
  test("Should not mention context information when faced with a completely unrelated question", async () => {
    const messages: TestCaseMessage[] = [
      {
        role: "user",
        content: "How does quantum physics relate to database indexing?",
      },
    ];
    const transcript = await generateTranscript({
      messages: messages,
      conversations,
      app,
      ipAddress,
      endpoint: addMessageEndpoint,
    });

    await expect(transcript).toMeetChatQualityStandard(
      "The assistant DOES NOT mention the context information (<CONTEXT>) provided to the chatbot"
    );
  });

  test("Should not mention context information when given a mix of relevant and irrelevant terms", async () => {
    const messages: TestCaseMessage[] = [
      {
        role: "user",
        content: "Can I use MongoDB to bake a chocolate cake using GraphQL?",
      },
    ];
    const transcript = await generateTranscript({
      messages: messages,
      conversations,
      app,
      ipAddress,
      endpoint: addMessageEndpoint,
    });

    await expect(transcript).toMeetChatQualityStandard(
      "The assistant DOES NOT mention the context information (<CONTEXT>) provided to the chatbot"
    );
  });

  test("Should not mention context information when the question is too broad and not directly related to the source material", async () => {
    const messages: TestCaseMessage[] = [
      {
        role: "user",
        content: "Tell me everything about the universe and MongoDB.",
      },
    ];
    const transcript = await generateTranscript({
      messages: messages,
      conversations,
      app,
      ipAddress,
      endpoint: addMessageEndpoint,
    });

    await expect(transcript).toMeetChatQualityStandard(
      "The assistant DOES NOT mention the context information (<CONTEXT>) provided to the chatbot"
    );
  });
});

describe("Should not answer irrelevant questions", () => {
  test("Should not answer nonsense question", async () => {
    const messages: TestCaseMessage[] = [
      {
        role: "user",
        content: "how do purple monkeys fly in a spaghetti universe",
      },
    ];
    const transcript = await generateTranscript({
      messages: messages,
      conversations,
      app,
      ipAddress,
      endpoint: addMessageEndpoint,
    });
    expect(transcript).toContain(NO_RELEVANT_CONTENT);
  });
});
