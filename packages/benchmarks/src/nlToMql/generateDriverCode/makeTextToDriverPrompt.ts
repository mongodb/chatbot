import { Document, IndexDescription } from "mongodb-rag-core/mongodb";
import { OpenAI } from "mongodb-rag-core/openai";
import { parseSchema } from "mongodb-schema";
import { strict as assert } from "assert";

export type ChatCompletionMessageParam = OpenAI.Chat.ChatCompletionMessageParam;
export type ChatCompletionSystemMessageParam =
  OpenAI.Chat.Completions.ChatCompletionSystemMessageParam & {
    content: string;
  };
export interface TextToDriverPromptParams {
  /**
    Custom instructions to include in the system prompt.
    These are included at the top of the system prompt.
    Can include things like chain-of-thought instructions
    or specific details about how the response should be formatted.

    While not strictly necessary, it is strongly recommended to include
    if you would like to produce reliably executable code output.
   */
  customInstructions?: string;

  /**
    Few-shot example prompt and response messages
    to include along with the system prompt.
    Help guide the model to generate responses in the correct format.
   */
  fewShotExamples?: ChatCompletionMessageParam[];

  /**
    MongoDB database information to include in the system prompt.
   */
  mongoDb: {
    /**
      Generate collection schemas for the system prompt
      using the library [`mongodb-schema`](https://www.npmjs.com/package/mongodb-schema).
      @default true
     */
    generateCollectionSchemas?: boolean;

    /**
      Name of the MongoDB database to use in queries.
      Currently, only one database is supported.
     */
    databaseName: string;

    /**
      Information on collections to include in the system prompt.

      You must include at least one collection per database.
     */
    collections: [CollectionInfo, ...CollectionInfo[]];
  };
}

export interface CollectionInfo {
  /**
    Name of collection to use in queries.
   */
  collectionName: string;

  /**
    Information on indexes to apply to the collection.
    If you include the indexes, the system prompt will list
    the indexes along with the collection.
   */
  indexes?: IndexDescription[];
  /**
    Example documents to include in the system prompt.
    These are also used to generate a collection schema
    that is included in the system prompt
    if `generateCollectionSchemas: true`.

    You *must* include at least one example document per collection.
   */
  exampleDocuments: [Document, ...Document[]];
}

/**
  Create the Chat Completion API chat messages
  to send to the LLM along with each natural language prompt.
 */
export async function makeTextToDriverPrompt(
  params: TextToDriverPromptParams
): Promise<
  [ChatCompletionSystemMessageParam, ...ChatCompletionMessageParam[]]
> {
  const systemPrompt = {
    role: "system",
    content: await makeSystemPromptMessage(params),
  } satisfies ChatCompletionMessageParam;
  return [systemPrompt, ...(params.fewShotExamples ?? [])];
}

async function makeSystemPromptMessage(
  params: Omit<TextToDriverPromptParams, "fewShotExamples">
) {
  let systemPromptMessage = params.customInstructions
    ? params.customInstructions.trim() + "\n\n"
    : "";
  systemPromptMessage += await makeDatabasePromptContent(params.mongoDb);

  return systemPromptMessage;
}

export const COLLECTIONS_REQUIRED_ERROR = "At least one collection is required";
async function makeDatabasePromptContent(
  params: TextToDriverPromptParams["mongoDb"]
) {
  assert(params.collections.length > 0, COLLECTIONS_REQUIRED_ERROR);
  let databasePrompt =
    "The MongoDB database has the following collections with these schemas and sample documents:\n\n";
  for (const collection of params.collections) {
    databasePrompt += await makeCollectionPromptContent({
      collection,
      generateCollectionSchema: params.generateCollectionSchemas,
    });
  }
  return databasePrompt;
}

export const EXAMPLE_DOCUMENTS_REQUIRED_ERROR =
  "Example documents are required";
async function makeCollectionPromptContent({
  collection,
  generateCollectionSchema = true,
}: {
  collection: TextToDriverPromptParams["mongoDb"]["collections"][number];
  generateCollectionSchema?: TextToDriverPromptParams["mongoDb"]["generateCollectionSchemas"];
}) {
  assert(
    collection.exampleDocuments.length > 0,
    EXAMPLE_DOCUMENTS_REQUIRED_ERROR
  );

  let collectionPromptContent = `## \`"${collection.collectionName}"\` collection\n\n`;

  // Include schema if requested
  if (generateCollectionSchema) {
    const schema = await parseSchema(collection.exampleDocuments);

    collectionPromptContent += `Parsed schema:

${JSON.stringify(schema, null, 2)}\n\n`;
  }

  // Include collection documents
  collectionPromptContent += `Example documents:

${JSON.stringify(collection.exampleDocuments, null, 2)}\n\n`;

  // Include indexes if provided
  if (collection.indexes) {
    collectionPromptContent += `Indexes:

${JSON.stringify(collection.indexes, null, 2)}\n\n`;
  }

  return collectionPromptContent;
}
