import { Message } from "mongodb-rag-core";
import { ObjectId } from "mongodb-rag-core/mongodb";
import { OpenAI } from "mongodb-rag-core/openai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { wrapTraced } from "mongodb-rag-core/braintrust";
import { extractSampleMessages } from "./extractSampleMessages";

export interface CommentSentimentParams {
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

export type Sentiment = z.infer<typeof Sentiment>;

const commentSentimentToolDefinition: OpenAI.ChatCompletionTool = {
  type: "function",
  function: {
    name: "comment_sentiment",
    description: "Calculate the sentiment of a comment in a conversation",
    parameters: zodToJsonSchema(Sentiment, {
      $refStrategy: "none",
    }),
  },
};

const systemMessage = {
  role: "system",
  content: `You are a quality assurance analyst. Your job is to calculate the sentiment of a comment in a conversation with a chatbot.
The chatbot you are analyzing answers questions about MongoDB's products and services.
You are given a snippet of a conversation between a user and the chatbot with some metadata about the conversation, including user ratings on messages and the relevant message with comment.`,
} satisfies OpenAI.Chat.Completions.ChatCompletionSystemMessageParam;

export const makeJudgeMongoDbChatbotCommentSentiment = (openAiClient: OpenAI) =>
  wrapTraced(
    async function ({
      judgeLlm,
      messages,
      messageWithCommentId,
    }: CommentSentimentParams) {
      const userMessage = makeUserMessage(messages, messageWithCommentId);

      const messagesForLlm = [systemMessage, userMessage];

      const { sentiment, reasoning } = await getSentiment(
        openAiClient,
        judgeLlm,
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
  openAiClient: OpenAI,
  judgeLlm: string,
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
) {
  const modelRes = await openAiClient.chat.completions.create({
    messages: messages,
    model: judgeLlm,
    tools: [commentSentimentToolDefinition],
    stream: false,
    tool_choice: {
      function: { name: commentSentimentToolDefinition.function.name },
      type: "function",
    },
  });
  return Sentiment.parse(
    JSON.parse(
      modelRes.choices?.[0].message.tool_calls?.[0].function.arguments ?? "{}"
    )
  );
}

function makeUserMessage(
  messages: Message[],
  messageWithCommentId: ObjectId
): OpenAI.Chat.Completions.ChatCompletionUserMessageParam {
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
