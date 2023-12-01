"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeFindContentFunc = void 0;
const mongodb_chatbot_server_1 = require("mongodb-chatbot-server");
const mongodb_rag_core_1 = require("mongodb-rag-core");
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
function makeFindContentFunc() {
    const { MONGODB_CONNECTION_URI, MONGODB_DATABASE_NAME, OPENAI_API_KEY, OPENAI_EMBEDDING_DEPLOYMENT, OPENAI_ENDPOINT, } = (0, mongodb_rag_core_1.assertEnvVars)(mongodb_rag_core_1.CORE_ENV_VARS);
    const openAiClient = new mongodb_rag_core_1.OpenAIClient(OPENAI_ENDPOINT, new mongodb_rag_core_1.AzureKeyCredential(OPENAI_API_KEY));
    const embedder = (0, mongodb_rag_core_1.makeOpenAiEmbedder)({
        openAiClient,
        deployment: OPENAI_EMBEDDING_DEPLOYMENT,
        backoffOptions: {
            numOfAttempts: 3,
            maxDelay: 5000,
        },
    });
    const store = (0, mongodb_rag_core_1.makeMongoDbEmbeddedContentStore)({
        connectionUri: MONGODB_CONNECTION_URI,
        databaseName: MONGODB_DATABASE_NAME,
    });
    const findContent = (0, mongodb_chatbot_server_1.makeDefaultFindContentFunc)({
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
exports.makeFindContentFunc = makeFindContentFunc;
