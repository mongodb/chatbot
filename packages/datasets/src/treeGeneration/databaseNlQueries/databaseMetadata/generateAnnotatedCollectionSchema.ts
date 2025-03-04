import { OpenAI } from "mongodb-rag-core/openai";
import { CollectionInfo, DatabaseMetadata } from "./getDatabaseMetadata";
import { LlmOptions } from "./LlmOptions";
import assert from "assert/strict";
import { z } from "zod";
import { getOpenAiFunctionResponse } from "./getOpenAiFunctionResponse";

const systemPrompt = `You are an expert MongoDB database architect. Your task is to analyze the provided database metadata and generate clear, concise descriptions and an annotated schema for the specified collection. The descriptions that you generate will be used in the prompt of a LLM for performing database-related tasks.


In the annotated schema, create a TypeScript schema with the relevant types. Requirements:
1. Include descriptions in comments next to the fields of each field in the schema.
2. Do not include the top-level description of the collection. This is provided elsewhere. 
3. Include raw TypeScript code. DO NOT wrap in a Markdown code block.

For each index on the collection, include a comment describing what the index does. You can also briefly note potential use cases for this index.
`;

const functionName = "get_annotated_collection_schema";

const functionDescription =
  "Generate annotated schema and index definitions for the specified collection.";

function makeDetailedColelctionDescriptionSchema(
  collectionInfo: CollectionInfo
) {
  const indexNames = collectionInfo.indexes
    .map((metadata) => metadata.name)
    .filter((name) => name !== "undefined");

  // Create a record schema where each key must be one of the collection names
  const indexDescriptionSchema = z.array(
    z.object({
      name: z.enum(indexNames as [string, ...string[]]),
      description: z.string(),
    })
  );

  const DetailedCollectionDescriptionsSchema = z.object({
    typeScriptSchema: z
      .string()
      .describe(
        "Annotated TypeScript schema for the collection. Annotate with TypeDoc comments."
      ),
    indexDescriptions: indexDescriptionSchema,
  });
  return DetailedCollectionDescriptionsSchema;
}

export type DetailedCollectionDescriptions = z.infer<
  ReturnType<typeof makeDetailedColelctionDescriptionSchema>
>;

export async function generateAnnotatedCollectionSchema(
  databaseMetadata: DatabaseMetadata,
  collectionName: string,
  llmOptions: LlmOptions
): Promise<DetailedCollectionDescriptions> {
  const collection = databaseMetadata.collections.find(
    (c) => c.collectionName === collectionName
  );
  assert(collection, `Collection ${collectionName} not found`);

  const messages = [
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content: `Analyze the following collection: '${collectionName}'.

Database metadata:
${JSON.stringify(databaseMetadata, null, 2)}
        
Again, analyze the collection named '${collectionName}'.`,
    },
  ] satisfies OpenAI.ChatCompletionMessageParam[];

  return await getOpenAiFunctionResponse({
    messages,
    llmOptions,
    schema: makeDetailedColelctionDescriptionSchema(collection),
    functionName,
    functionDescription,
  });
}
