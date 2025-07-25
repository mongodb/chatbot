import assert from "node:assert/strict";
import { Embedder } from "mongodb-rag-core";

export const calculateEmbeddings = async ({
  text,
  embedders,
}: {
  text: string;
  embedders: Embedder[];
}) => {
  return Object.fromEntries(
    await Promise.all(
      embedders.map(async (embedder): Promise<[string, number[]]> => {
        const { embedding } = await embedder.embed({ text });
        const model = embedder.modelName;
        assert(model !== undefined, "Missing embedder model name!");
        return [model, embedding];
      })
    )
  );
};
