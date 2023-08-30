import { EmbeddedContent, Page } from "chat-core";
import { chunkOpenApiSpecYaml } from "./chunkOpenApiSpecYaml";
import { chunkMd } from "./chunkMd";
import { ChunkTransformer } from "./ChunkTransformer";

export type ContentChunk = Omit<EmbeddedContent, "embedding" | "updated">;

/**
  A ChunkFunc is a function that takes a page and returns it in chunks.
 */
export type ChunkFunc = (
  page: Page,
  options?: Partial<ChunkOptions>
) => Promise<ContentChunk[]>;

export type ChunkOptions = {
  chunkSize: number;
  chunkOverlap: number;
  tokenizer: SomeTokenizer;
  yamlChunkSize?: number;

  /**
    Transform to be applied to each chunk as it is produced.
    Provides the opportunity to prepend metadata, etc.
   */
  transform?: ChunkTransformer;
};

export type SomeTokenizer = {
  encode(text: string): {
    bpe: number[];
    text: string[];
  };
};

/**
  Returns chunked of a content page.
 */
export const chunkPage: ChunkFunc = async (
  page: Page,
  chunkOptions?: Partial<ChunkOptions>
): Promise<ContentChunk[]> => {
  switch (page.format) {
    case "openapi-yaml":
      return await chunkOpenApiSpecYaml(page, chunkOptions);
    case "md": // fallthrough
    case "txt": // fallthrough
    default:
      return await chunkMd(page, chunkOptions);
  }
};
