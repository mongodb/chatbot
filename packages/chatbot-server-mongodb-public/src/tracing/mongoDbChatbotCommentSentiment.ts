import { Message } from "mongodb-rag-core";
import { ObjectId } from "mongodb-rag-core/mongodb";
import { z } from "zod";
import { wrapTraced } from "mongodb-rag-core/braintrust";
import { extractSampleMessages } from "./extractSampleMessages";
import {
  generateObject,
  LanguageModel,
  ModelMessage,
} from "mongodb-rag-core/aiSdk";

export interface CommentSentimentParams {
  messages: Message[];
  messageWithCommentId: ObjectId;
}

const Sentiment = z.object({
  reasoning: z.string({
    description: "Concise reasoning justifying the sentiment",
  }),
  sentiment: z.enum(["positive", "neutral", "negative"]),
});

export type Sentiment = z.infer<typeof Sentiment>;

const schemaName = "comment_sentiment";
const schemaDescription =
  "Calculate the sentiment of a comment in a conversation";

const systemMessage = {
  role: "system",
  content: `You are a quality assurance analyst. Your job is to calculate the sentiment of a comment in a conversation with a chatbot.
The chatbot you are analyzing answers questions about MongoDB's products and services.
You are given a snippet of a conversation between a user and the chatbot with some metadata about the conversation, including user ratings on messages and the relevant message with comment.`,
} satisfies ModelMessage;

export const makeJudgeMongoDbChatbotCommentSentiment = (
  languageModel: LanguageModel
) =>
  wrapTraced(
    async function ({
      messages,
      messageWithCommentId,
    }: CommentSentimentParams) {
      const userMessage = makeUserMessage(messages, messageWithCommentId);

      const messagesForLlm = [systemMessage, userMessage];

      const { sentiment, reasoning } = await getSentiment(
        languageModel,
        messagesForLlm
      );

      const SENTIMENT_SCORES = {
        positive: 1,
        negative: 0,
        neutral: 0.5,
      } as const;

      const score = SENTIMENT_SCORES[sentiment];

      return {
        name: "CommentSentiment",
        score,
        metadata: {
          reasoning,
          sentiment,
        },
      };
    },
    {
      name: "JudgeMongoDbChatbotCommentSentiment",
    }
  );

async function getSentiment(
  languageModel: LanguageModel,
  messages: ModelMessage[]
) {
  const { object: sentiment } = await generateObject({
    model: languageModel,
    schema: Sentiment,
    messages,
    schemaName,
    schemaDescription,
  });
  return sentiment;
}

function makeUserMessage(
  messages: Message[],
  messageWithCommentId: ObjectId
): ModelMessage {
  const { sampleMessages, targetMessageIndex } = extractSampleMessages({
    messages,
    targetMessageId: messageWithCommentId,
  });
  let transcript = "Conversation Transcript:\n\n";
  sampleMessages.forEach((message, i) => {
    transcript += `${formatRole(message.role)}:\n ${message.content}\n`;
    if (message.role === "assistant" && typeof message.rating === "boolean") {
      transcript += `\nUser rating: ${message.rating}\n`;
      if (i === targetMessageIndex) {
        transcript += `User comment to analyze: ${message.userComment}\n`;
      }
    }
    transcript += "\n";
  });
  return {
    role: "user",
    content: transcript,
  };
}
function formatRole(role: string): string {
  if (role.length === 0) return role;
  // Capitalize first letter
  role = role.charAt(0).toUpperCase() + role.slice(1);
  // Wrap in MD bold
  role = `**${role}**`;
  return role;
}
