import { chunkOpenApiSpecYaml } from "./chunkOpenApiSpecYaml";
import { chunkMd } from "./chunkMd";
import { ChunkTransformer } from "./ChunkTransformer";
import { chunkCode, isSupportedLanguage } from "./chunkCode";
import { EmbeddedContent } from "../contentStore";
import { Page } from "../contentStore";

export type ContentChunk = Omit<EmbeddedContent, "embeddings" | "updated">;

/**
  A ChunkFunc is a function that takes a page and returns it in chunks.
 */
export type ChunkFunc = (
  page: Page,
  options?: Partial<ChunkOptions>
) => Promise<ContentChunk[]>;

/**
  Options for converting a `Page` into `ContentChunk[]`.
 */
export type ChunkOptions = {
  /**
    Minimum chunk size before transform function is applied to it.
    If a chunk has fewer tokens than this number, it is discarded  before ingestion.

    You can use this as a vector search optimization to avoid including chunks
    with very few tokens and thus very little semantic meaning.

    @example
    You might set this to `15` to avoid including chunks that are just a few characters or words.
    For instance, you likely would not want to set a chunk that is just the closing
    of a code block (```), which occurs not infrequently if chunking using the
    Langchain RecursiveCharacterTextSplitter.

    Chunk 1:
    ````text
    ```py
    foo = "bar"
    # more semantically relevant python code...
    ````

    Chunk 2:
    ````text
    ```
    ````
  */
  minChunkSize?: number;

  /**
    Maximum chunk size before transform function is applied to it.
    If Page has more tokens than this number, it is split into smaller chunks.
   */
  maxChunkSize: number;

  /**
    Number of tokens to overlap between chunks.
    If this is 0, chunks will not overlap.
    If this is greater than 0, chunks will overlap by this number of tokens.
   */
  chunkOverlap: number;

  /**
    Tokenizer to use to count number of tokens in text.
   */
  tokenizer: SomeTokenizer;

  /**
    If provided, this will override the maxChunkSize for openapi-yaml pages.
    This is useful because openapi-yaml pages tend to be very large, and
    we want to split them into smaller chunks than the default maxChunkSize.
   */
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
  // Handle code file formats
  if (isSupportedLanguage(page.format)) {
    return await chunkCode(page, chunkOptions);
  }
  // Handle remaining formats
  switch (page.format) {
    case "openapi-yaml":
      return await chunkOpenApiSpecYaml(page, chunkOptions);
    case "md": // fallthrough
    case "txt": // fallthrough
    default:
      return await chunkMd(page, chunkOptions);
  }
};
