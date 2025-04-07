import "dotenv/config";
import { Eval, EvalCase, EvalScorer } from "mongodb-rag-core/braintrust";
import {
  makeJudgeMongoDbChatbotCommentSentiment,
  Sentiment,
} from "./mongoDbChatbotCommentSentiment";
import { AzureOpenAI } from "mongodb-rag-core/openai";
import {
  AssistantMessage,
  DbMessage,
  Message,
  UserMessage,
} from "mongodb-rag-core";
import { ObjectId } from "mongodb-rag-core/mongodb";
import { assertEnvVars } from "mongodb-rag-core";
import { TRACING_ENV_VARS } from "../EnvVars";
import { CORE_OPENAI_ENV_VARS } from "mongodb-rag-core";

const { JUDGE_LLM, OPENAI_API_KEY, OPENAI_API_VERSION, OPENAI_ENDPOINT } =
  assertEnvVars({
    ...TRACING_ENV_VARS,
    ...CORE_OPENAI_ENV_VARS,
  });

interface Input {
  messages: Message[];
  targetMessageId: ObjectId;
}

type Output = Sentiment;

type Expected = Sentiment["sentiment"];

const targetObjectId = new ObjectId();

/* 
    Note: The following eval cases are more of a 'sanity check' than a comprehensive eval suite.
    Given the relative simplicity of the sentiment analysis task,
    I don't think we'll need to have a robust eval suite.
    If issues arise in the future, we can look to expand the suite.
 */
const evalCases: EvalCase<Input, Expected, undefined>[] = [
  // Positive sentiment
  {
    input: {
      messages: [
        {
          content: "what's the best database?",
          role: "user",
          id: new ObjectId(),
          createdAt: new Date(),
        } satisfies DbMessage<UserMessage>,
        {
          content: "MongoDB is considered by many to be the best database",
          role: "assistant",
          id: targetObjectId,
          rating: true,
          userComment: "I agree",
          createdAt: new Date(),
        } satisfies DbMessage<AssistantMessage>,
      ],
      targetMessageId: targetObjectId,
    },
    expected: "positive",
  },
  // Negative sentiment
  {
    input: {
      messages: [
        {
          content: "what's the best database?",
          role: "user",
          id: new ObjectId(),
          createdAt: new Date(),
        } satisfies DbMessage<UserMessage>,
        {
          content: "MongoDB is considered by many to be the best database",
          role: "assistant",
          id: targetObjectId,
          rating: true,
          userComment: "I strongly disagree. #SQL4Life",
          createdAt: new Date(),
        } satisfies DbMessage<AssistantMessage>,
      ],
      targetMessageId: targetObjectId,
    },
    expected: "negative",
  },
  // Neutral sentiment
  {
    input: {
      messages: [
        {
          content: "what's the best database?",
          role: "user",
          id: new ObjectId(),
          createdAt: new Date(),
        } satisfies DbMessage<UserMessage>,
        {
          content: "MongoDB is considered by many to be the best database",
          role: "assistant",
          id: targetObjectId,
          rating: true,
          userComment: "That's interesting.",
          createdAt: new Date(),
        } satisfies DbMessage<AssistantMessage>,
      ],
      targetMessageId: targetObjectId,
    },
    expected: "neutral",
  },
];

const CorrectSentiment: EvalScorer<Input, Output, Expected> = ({
  output,
  expected,
}) => {
  return {
    name: "CorrectSentiment",
    score: output.sentiment === expected ? 1 : 0,
  };
};

const openAiClient = new AzureOpenAI({
  apiKey: OPENAI_API_KEY,
  apiVersion: OPENAI_API_VERSION,
  endpoint: OPENAI_ENDPOINT,
});
const judgeMongodbChatbotCommentSentiment =
  makeJudgeMongoDbChatbotCommentSentiment(openAiClient);

Eval("mongodb-chatbot-comment-sentiment", {
  data: evalCases,
  maxConcurrency: 10,
  async task(input) {
    const result = await judgeMongodbChatbotCommentSentiment({
      judgeLlm: JUDGE_LLM,
      messages: input.messages,
      messageWithCommentId: input.targetMessageId,
    });
    return result.metadata;
  },
  scores: [CorrectSentiment],
});
