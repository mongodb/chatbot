import { z } from "zod";
import { generateObject, LanguageModel } from "ai";
import {
  mongoDbProducts,
  mongoDbProgrammingLanguageIds,
  mongoDbProgrammingLanguages,
  MongoDbTag,
  mongoDbTopics,
} from "mongodb-rag-core/mongoDbMetadata";

const baseSystemPrompt = `You are an expert data labeler employed by MongoDB.
You must label metadata based on the provided label categories:`;

export const ExtractMongoDbProgrammingLanguageSchema = z.object({
  programmingLanguage: z
    .enum(mongoDbProgrammingLanguageIds)
    .nullable()
    .describe(
      "Most important programming language present in the content. If no programming language is present, set to `null`."
    ),
});

/**
  Extract metadata relevant to the MongoDB docs chatbot
  from a user message in the conversation.
 */
export const extractMongoDbProgrammingLanguage = async (
  model: LanguageModel,
  data: string
) =>
  generateObject({
    messages: [
      {
        role: "system",
        content: `${baseSystemPrompt}

${mongoDbProgrammingLanguages.map((l) => ` - ${l.id}: ${l.name}`).join("\n")}`,
      },
      {
        role: "user",
        content: data,
      },
    ],
    model,
    schema: ExtractMongoDbProgrammingLanguageSchema,
  });

export const ExtractMongoDbProductSchema = z.object({
  mongoDbProduct: z
    .enum(mongoDbProducts.map((p) => p.id) as [string, ...string[]])
    .nullable()
    .describe(
      `Most important MongoDB product present in the content.
If it is not clear what the product is, set to \`null\`.`
    ),
});

export const extractMongoDbProduct = async (
  model: LanguageModel,
  data: string
) =>
  generateObject({
    messages: [
      {
        role: "system",
        content: `${baseSystemPrompt}

${mongoDbProducts
  .map((p) => ` - ${p.id}: **${p.name}**. ${p.description}`)
  .join("\n")}

Keep in mind:
1. Include "Driver" if the user is asking about a programming language with a MongoDB driver. 
2. If asking about MongoDB database but not specifying if Atlas/Server/Op Manager, etc, set to "MongoDB Server".
3. If not clear what product is being asked about, set to \`null\`.`,
      },
      {
        role: "user",
        content: data,
      },
    ],
    model,
    schema: ExtractMongoDbProductSchema,
  });

export const ExtractMongoDbTopicSchema = z.object({
  topic: z
    .enum(mongoDbTopics.map((t) => t.id) as [string, ...string[]])
    .nullable()
    .describe(
      `Most important MongoDB-related topic present in the content. If none of the listed topics are clearly present, set to \`null\`.`
    ),
});

export const extractMongoDbTopic = async (model: LanguageModel, data: string) =>
  generateObject({
    messages: [
      {
        role: "system",
        content: `${baseSystemPrompt}

${mongoDbTopics.map((t) => ` - ${t.id}`).join("\n")}`,
      },
      {
        role: "user",
        content: data,
      },
    ],
    model,
    schema: ExtractMongoDbTopicSchema,
  });

// Type guard to check if a value is a non-null MongoDbTag
function isMongoDbTag(value: string | null): value is MongoDbTag {
  return value !== null;
}

export const extractMongoDbTags = async (
  model: LanguageModel,
  data: string
) => {
  const [programmingLanguage, product, topic] = await Promise.all([
    extractMongoDbProgrammingLanguage(model, data),
    extractMongoDbProduct(model, data),
    extractMongoDbTopic(model, data),
  ]);

  return [
    programmingLanguage.object.programmingLanguage,
    product.object.mongoDbProduct,
    topic.object.topic,
  ].filter(isMongoDbTag);
};
