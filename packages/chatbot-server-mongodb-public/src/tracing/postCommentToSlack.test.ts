import { ObjectId } from "mongodb-rag-core/mongodb";
import { makeBraintrustLogUrl, postCommentToSlack } from "./postCommentToSlack";
import "dotenv/config";
import {
  assertEnvVars,
  CORE_OPENAI_CONNECTION_ENV_VARS,
} from "mongodb-rag-core";
import { EVAL_ENV_VARS } from "../EnvVars";

const {
  JUDGE_EMBEDDING_MODEL,
  JUDGE_LLM,
  OPENAI_API_KEY,
  OPENAI_ENDPOINT,
  OPENAI_API_VERSION,
} = assertEnvVars({
  ...EVAL_ENV_VARS,
  ...CORE_OPENAI_CONNECTION_ENV_VARS,
});

// Optional env vars
const { SLACK_BOT_TOKEN, SLACK_COMMENT_CONVERSATION_ID } = process.env;

describe.skip("postCommentToSlack", () => {
  it("should post message to slack", async () => {
    if (!SLACK_BOT_TOKEN || !SLACK_COMMENT_CONVERSATION_ID) {
      throw new Error(
        "SLACK_BOT_TOKEN and SLACK_COMMENT_CONVERSATION_ID must be set"
      );
    }
    const id = new ObjectId();
    await postCommentToSlack({
      slackToken: SLACK_BOT_TOKEN,
      slackConversationId: SLACK_COMMENT_CONVERSATION_ID,
      conversation: {
        _id: new ObjectId(),
        createdAt: new Date(),
        messages: [
          {
            role: "user",
            content: "hey",
            id: new ObjectId(),
            createdAt: new Date(),
          },
          {
            role: "assistant",
            content: "hello",
            rating: true,
            userComment: "good",
            id,
            createdAt: new Date(),
            references: [
              {
                title: "title",
                url: "https://example.com",
              },
            ],
          },
        ],
      },
      messageWithCommentId: id,
      llmAsAJudge: {
        judgeEmbeddingModel: JUDGE_EMBEDDING_MODEL,
        judgeModel: JUDGE_LLM,
        openAiConfig: {
          azureOpenAi: {
            apiKey: OPENAI_API_KEY,
            endpoint: OPENAI_ENDPOINT,
            apiVersion: OPENAI_API_VERSION,
          },
        },
      },
    });
  });
});

describe("makeBraintrustLogUrl", () => {
  it("should make a valid braintrust log url", () => {
    const url = makeBraintrustLogUrl({
      orgName: "mongodb-education-ai",
      projectName: "chatbot-responses-prod",
      traceId: "67c2023c218d1c08ae1cf0ed",
    });
    expect(url).toBe(
      "https://www.braintrust.dev/app/mongodb-education-ai/p/chatbot-responses-prod/logs?search=%7B%22filter%22:%5B%7B%22text%22:%22id%2520=%2520%252267c2023c218d1c08ae1cf0ed%2522%22%7D%5D%7D&r=67c2023c218d1c08ae1cf0ed"
    );
  });
});
