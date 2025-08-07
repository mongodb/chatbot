import {
  CollectionInfo,
  makeTextToDriverPrompt,
  TextToDriverPromptParams,
} from "./makeTextToDriverPrompt";
import {
  extractDeterministicSampleOfDocuments,
  ExtractSampleDocumentsParams,
} from "./extractDeterministicSampleOfDocuments";
import { strict as assert } from "assert";
import { Document } from "mongodb-rag-core/mongodb";
import { OpenAI } from "mongodb-rag-core/openai";

type ChatCompletionCreateParamsNonStreaming =
  OpenAI.Chat.ChatCompletionCreateParamsNonStreaming;

type CollectionWithoutExampleDocs = Omit<CollectionInfo, "exampleDocuments">;

type MongoDbWithoutExampleDocs = Omit<
  TextToDriverPromptParams["mongoDb"],
  "collections"
> & {
  collections: [
    CollectionWithoutExampleDocs,
    ...CollectionWithoutExampleDocs[]
  ];
};

export type PromptGenerationConfig = Omit<
  TextToDriverPromptParams,
  "mongoDb"
> & {
  mongoDb: MongoDbWithoutExampleDocs;
};

export interface MakeGenerateDriverCodeParams {
  promptGenerationConfig: PromptGenerationConfig;
  sampleGenerationConfig: Pick<
    ExtractSampleDocumentsParams,
    "limit" | "mongoClient"
  >;
}

/**
  Construct the function that generates driver code for a given user prompt
  for a given MongoDB database.
 */
export async function makeGenerateDriverCode({
  promptGenerationConfig,
  sampleGenerationConfig,
}: MakeGenerateDriverCodeParams) {
  // Create new collections with exampleDocuments added
  const collectionsWithExamples = (await Promise.all(
    promptGenerationConfig.mongoDb.collections.map(async (collection) => {
      const exampleDocs = await extractDeterministicSampleOfDocuments({
        mongoClient: sampleGenerationConfig.mongoClient,
        collectionName: collection.collectionName,
        databaseName: promptGenerationConfig.mongoDb.databaseName,
        limit: sampleGenerationConfig.limit,
      });
      assert(exampleDocs.length > 0, "Must have at least one example document");
      return {
        ...collection,
        exampleDocuments: exampleDocs satisfies Document[] as [
          Document,
          ...Document[]
        ],
      } satisfies CollectionInfo;
    })
  )) satisfies CollectionInfo[] as [CollectionInfo, ...CollectionInfo[]];

  const promptGenerationConfigWithExamples: TextToDriverPromptParams = {
    ...promptGenerationConfig,
    mongoDb: {
      ...promptGenerationConfig.mongoDb,
      collections: collectionsWithExamples,
    },
  };
  const promptMessages = await makeTextToDriverPrompt(
    promptGenerationConfigWithExamples
  );
  return async function generateDriverCode({
    openAiClient,
    userPrompt,
    llmOptions,
  }: GenerateDriverCodeParams) {
    const {
      choices: [
        {
          message: { content },
        },
      ],
    } = await openAiClient.chat.completions.create({
      ...llmOptions,
      messages: [...promptMessages, { role: "user", content: userPrompt }],
    });
    assert(content !== null, "Expected content in response");
    return content;
  };
}

export interface GenerateDriverCodeParams {
  openAiClient: OpenAI;
  userPrompt: string;
  llmOptions: Omit<
    ChatCompletionCreateParamsNonStreaming,
    | "messages"
    | "stream"
    | "function_call"
    | "functions"
    | "parallel_tool_calls"
    | "n"
    | "response_format"
    | "stream_options"
    | "tool_choice"
    | "tools"
  >;
}
