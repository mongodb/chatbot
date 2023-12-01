import { FindContentFunc, makeDefaultFindContentFunc } from "mongodb-chatbot-server";
import {
  WithScore,
  EmbeddedContent,
  Embedder,
  EmbeddedContentStore,
  FindNearestNeighborsOptions,
  assertEnvVars,
  OpenAIClient,
  AzureKeyCredential,
  makeOpenAiEmbedder,
  makeMongoDbEmbeddedContentStore,
  CORE_ENV_VARS,
} from "mongodb-rag-core";
// import { SearchBooster } from "../../processors/SearchBooster";

export type FindContentArgs = {
  query: string;
};

export type FindContentResult = {
  queryEmbedding: number[];
  content: WithScore<EmbeddedContent>[];
};

export type FindContent = ({ query }: FindContentArgs) => Promise<FindContentResult>;

export type MakeDefaultFindContentArgs = {
  embedder: Embedder;
  store: EmbeddedContentStore;
  findNearestNeighborsOptions?: Partial<FindNearestNeighborsOptions>;
  // searchBoosters?: SearchBooster[];
};

/**
  Basic implementation of FindContent.
 */
// export const makeDefaultFindContent = ({
//   embedder,
//   store,
//   findNearestNeighborsOptions,
//   // searchBoosters,
// }: MakeDefaultFindContentArgs): FindContent => {
//   return async ({ query }) => {
//     const { embedding } = await embedder.embed({
//       text: query,
//       userIp: "::1",
//     });

//     let content = await store.findNearestNeighbors(
//       embedding,
//       findNearestNeighborsOptions
//     );

//     // for (const booster of searchBoosters ?? []) {
//     //   if (await booster.shouldBoost({ text: query })) {
//     //     content = await booster.boost({
//     //       existingResults: content,
//     //       embedding,
//     //       store,
//     //     });
//     //   }
//     // }

//     return { queryEmbedding: embedding, content };
//   };
// };

export function makeFindContentFunc(): FindContentFunc {
  const {
    MONGODB_CONNECTION_URI,
    MONGODB_DATABASE_NAME,
    OPENAI_API_KEY,
    OPENAI_EMBEDDING_DEPLOYMENT,
    OPENAI_ENDPOINT,
  } = assertEnvVars(CORE_ENV_VARS);

  const openAiClient = new OpenAIClient(
    OPENAI_ENDPOINT,
    new AzureKeyCredential(OPENAI_API_KEY)
  );

  const embedder = makeOpenAiEmbedder({
    openAiClient,
    deployment: OPENAI_EMBEDDING_DEPLOYMENT,
    backoffOptions: {
      numOfAttempts: 3,
      maxDelay: 5000,
    },
  });

  const store = makeMongoDbEmbeddedContentStore({
    connectionUri: MONGODB_CONNECTION_URI,
    databaseName: MONGODB_DATABASE_NAME,
  });

  const findContent = makeDefaultFindContentFunc({
    embedder,
    store,
    findNearestNeighborsOptions: {
      indexName: "default",
      path: "embedding",
      k: 3,
      minScore: 0.85,
      // filter: {
      //   phrase: {
      //     path: "sourceName",
      //     query: "cxx-driver",
      //   },
      // },
    },
  });

  return findContent;
}
