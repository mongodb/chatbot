"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeDefaultFindContent = void 0;
/**
  Basic implementation of FindContent.
 */
const makeDefaultFindContent = ({ embedder, store, findNearestNeighborsOptions,
// searchBoosters,
 }) => {
    return async ({ query }) => {
        const { embedding } = await embedder.embed({
            text: query,
            userIp: "::1",
        });
        let content = await store.findNearestNeighbors(embedding, findNearestNeighborsOptions);
        // for (const booster of searchBoosters ?? []) {
        //   if (await booster.shouldBoost({ text: query })) {
        //     content = await booster.boost({
        //       existingResults: content,
        //       embedding,
        //       store,
        //     });
        //   }
        // }
        return { queryEmbedding: embedding, content };
    };
};
exports.makeDefaultFindContent = makeDefaultFindContent;
