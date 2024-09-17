import { Document, IndexDescription } from "mongodb-rag-core";
import { OpenAI } from "openai";

type ChatCompletionMessageParam =
  OpenAI.Chat.Completions.ChatCompletionMessageParam;

export interface BuildPromptParams {
  fewShotExamples: ChatCompletionMessageParam[];

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
    collections: {
      /**
        Name of collection to use in queries.
       */
      collectionName: string;
      indexes?: IndexDescription[];
      /**
          Example documents to include in the system prompt.
          These are also used to generate a collection schema
          that is included in the system prompt
          if `generateCollectionSchemas: true`.
        */
      exampleDocuments?: Document[];
    }[];
  };
  /**
    Driver-specific instructions to include in the system prompt.
   */
  systemPromptInstructions?: string;
}

/**
  Create the Chat Completion API chat messages
  to send to the LLM along with each natural language prompt.
 */
export async function makeTextToDriverPrompt(
  params: BuildPromptParams
): Promise<ChatCompletionMessageParam[]> {
  // TODO
  return [];
}

function makeSystemPrompt() {}
function makeCollectionInformation() {
  return ``;
}
