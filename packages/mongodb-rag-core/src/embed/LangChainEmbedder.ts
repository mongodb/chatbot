import { Embedder } from "./Embedder";
import { Embeddings } from "@langchain/core/embeddings";
export type MakeLangChainEmbedderParams = {
  /**
    LangChain.js `Embeddings` instance.
    You can configure things like caching and retry behavior in the `Embeddings` instance.
   */
  langChainEmbeddings: Embeddings;
};

/**
  Constructor for implementation of the {@link Embedder} using a LangChain.js [`Embeddings`](https://js.langchain.com/docs/modules/data_connection/text_embedding/) class.
 */
export const makeLangChainEmbedder = ({
  langChainEmbeddings,
}: MakeLangChainEmbedderParams): Embedder => {
  return {
    async embed({ text }) {
      const embedding = await langChainEmbeddings.embedQuery(text);
      return { embedding };
    },
  };
};
