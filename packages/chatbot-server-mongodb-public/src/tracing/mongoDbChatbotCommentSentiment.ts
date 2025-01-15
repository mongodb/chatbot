import { Message } from "mongodb-rag-core";
import { EvalScorer } from "mongodb-rag-core/braintrust";
import { ObjectId } from "mongodb-rag-core/mongodb";
import { OpenAI } from "mongodb-rag-core/openai";
import { z } from "zod";

export interface CommentSentimentParams {
  openAiClient: OpenAI;
  judgeLlm: string;
  messages: Message[];
  messageWithCommentId: ObjectId;
}

const Sentiment = z.object({
  reasoning: z.string({
    description: "Concise reasoning justifying the sentiment",
  }),
  sentiment: z.enum(["positive", "neutral", "negative"]),
});

type Sentiment = z.infer<typeof Sentiment>;

const systemPrompt = `You are a quality assurance analyst. Your job is to calculate the sentiment of a comment in a conversation with a chatbot.
The chatbot you are analyzing answers questions about MongoDB's products and services.
You are given a snippet of a conversation between a user and the chatbot with some metadata about the conversation, including user ratings on messages and the relevant message with comment.`;

async function mongoDbChatbotCommentSentiment({
  openAiClient,
  judgeLlm,
  messages,
  messageWithCommentId,
}: CommentSentimentParams): Promise<
  ReturnType<EvalScorer<void, void, void, void>>
> {
  const score = Infinity; // TODO
  return {
    name: "CommentSentiment",
    score,
  };
}
