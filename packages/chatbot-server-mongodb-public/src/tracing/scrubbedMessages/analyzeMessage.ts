import { mongoDbTopics } from "mongodb-rag-core/mongoDbMetadata";
import { z } from "zod";
import { generateObject, LanguageModel } from "mongodb-rag-core/aiSdk";

export const MessageAnalysisSchema = z.object({
  topics: z
    .array(
      z.enum(mongoDbTopics.map((topic) => topic.id) as [string, ...string[]])
    )
    .nullable()
    .describe(`MongoDB-related topics from the user query.`),
  keywords: z
    .array(z.string())
    .describe(
      `Keywords and phrases from the user query. Limit to a small handful.`
    ),

  sentiment: z
    .string()
    .optional()
    .nullable()
    .describe(
      `In a few words, characterize the sentiment of the given message.`
    ),

  relevance: z
    .number()
    .min(0)
    .max(1)
    .describe(
      `On a scale of 0-1, rate how appropriate it is to ask the given query of a chatbot whose expertise is in MongoDB.`
    ),
});

export const systemPrompt = `You are a MongoDB expert. You are analyzing conversations between a user and a MongoDB chatbot. Your task is to classify the user query on the provided dimensions.

Dimensions:
- Topics: MongoDB-related topics from the user query.
- Keywords: Keywords and phrases from the user query. Limit to a small handful.
- Sentiment: In as few words as possible, characterize the sentiment of the given user query. Examples: "Informational/Technical", "Troubleshooting", "Sales".
- Relevance: On a scale of 0-1, rate how appropriate it is to ask the given query of a chatbot whose expertise is in MongoDB.

For all nullable fields, set to \`null\` if it is unclear or unknown.`;

export type MessageAnalysis = z.infer<typeof MessageAnalysisSchema>;

export async function analyzeMessage(
  messageContent: string,
  model: LanguageModel
): Promise<MessageAnalysis> {
  const result = await generateObject({
    model,
    schema: MessageAnalysisSchema,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: messageContent,
      },
    ],
  });
  return result.object;
}
