import { Message } from "mongodb-rag-core";
import { EvalScorer } from "mongodb-rag-core/braintrust";
import { ObjectId } from "mongodb-rag-core/mongodb";
import { OpenAI } from "mongodb-rag-core/openai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

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

export async function judgeMongoDbChatbotCommentSentiment({
  openAiClient,
  judgeLlm,
  messages,
  messageWithCommentId,
}: CommentSentimentParams): Promise<
  ReturnType<EvalScorer<void, void, void, void>>
> {
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
}

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
  const commentIdx = messages.findLastIndex((message) =>
    message.id.equals(messageWithCommentId)
  );
  const sampleMessagesStartIndex = Math.max(0, commentIdx - 5);
  const sampleMessagesEndIndex = Math.min(messages.length - 1, commentIdx + 2);
  const sampleMessages = messages.slice(
    sampleMessagesStartIndex,
    sampleMessagesEndIndex
  );
  const sampleMessagesTargetCommentIdx = sampleMessages.findIndex((message) =>
    message.id.equals(messageWithCommentId)
  );
  let transcript = "Conversation Transcript:\n\n";
  sampleMessages.forEach((message, i) => {
    transcript += `${message.role}: ${message.content}\n`;
    if (message.role === "assistant" && message.rating) {
      transcript += `User rating: ${message.rating}\n`;
      if (i === sampleMessagesTargetCommentIdx) {
        transcript += `User comment to analyze: ${message.content}\n`;
      }
    }
    transcript += "\n";
  });
  return {
    role: "user",
    content: transcript,
  };
}
