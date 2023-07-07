import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import GPT3Tokenizer from "gpt3-tokenizer";
import { EmbeddedContent, Page } from "chat-core";

export type ContentChunk = Omit<EmbeddedContent, "embedding" | "updated">;

export type SomeTokenizer = {
  encode(text: string): {
    bpe: number[];
    text: string[];
  };
};

export type ChunkOptions = {
  chunkSize: number;
  chunkOverlap: number;
  tokenizer: SomeTokenizer;
};

const defaultChunkOptions: ChunkOptions = {
  chunkSize: 1000,
  chunkOverlap: 0,
  tokenizer: new GPT3Tokenizer({ type: "gpt3" }),
};

/**
  Returns chunked of a content page.
 */
export const chunkPage = async (
  page: Page,
  optionsIn?: Partial<ChunkOptions>
): Promise<ContentChunk[]> => {
  const options = { ...defaultChunkOptions, ...optionsIn };
  const { tokenizer, chunkSize, chunkOverlap } = options;

  const splitter = new RecursiveCharacterTextSplitter({
    chunkOverlap,
    chunkSize,
  });

  const chunks = await splitter.createDocuments([page.body]);

  return chunks.map(
    ({ pageContent }, chunkIndex): ContentChunk => ({
      chunkIndex,
      sourceName: page.sourceName,
      url: page.url,
      text: pageContent,
      tokenCount: tokenizer.encode(pageContent).bpe.length,
      tags: [...page.tags],
    })
  );
};
