import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import GPT3Tokenizer from "gpt3-tokenizer";
import { EmbeddedContent, Page } from "chat-core";
import { stringify } from "yaml";

export type ContentChunk = Omit<EmbeddedContent, "embedding" | "updated">;

export type SomeTokenizer = {
  encode(text: string): {
    bpe: number[];
    text: string[];
  };
};

export type ChunkTransformer = (
  chunk: Omit<ContentChunk, "tokenCount">,
  details: {
    page: Page;
  }
) => Promise<Omit<ContentChunk, "tokenCount">>;

export type ChunkOptions = {
  chunkSize: number;
  chunkOverlap: number;
  tokenizer: SomeTokenizer;

  /**
    Transform to be applied to each chunk as it is produced.
    Provides the opportunity to prepend metadata, etc.
   */
  transform?: ChunkTransformer;
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
  const { tokenizer, chunkSize, chunkOverlap, transform } = options;

  const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
    chunkOverlap,
    chunkSize,
  });

  const chunks = await splitter.createDocuments([page.body]);

  return await Promise.all(
    chunks.map(async ({ pageContent }, chunkIndex): Promise<ContentChunk> => {
      const preTransformChunk: Omit<ContentChunk, "tokenCount"> = {
        chunkIndex,
        sourceName: page.sourceName,
        url: page.url,
        text: pageContent,
        tags: [...page.tags],
      };
      const transformedChunk = transform
        ? await transform(preTransformChunk, { page })
        : preTransformChunk;
      return {
        ...transformedChunk,
        tokenCount: tokenizer.encode(transformedChunk.text).bpe.length,
      };
    })
  );
};

/**
  Adds metadata about the page and chunk to a chunk body.
 */
export const prependFrontMatter: ChunkTransformer = async (chunk, { page }) => {
  // Detect code examples
  const match = /```([A-z0-1-_]*)/.exec(chunk.text);
  const hasCodeExample = match !== null;

  const frontMatter: Record<string, unknown> = {
    pageTitle: page.title,
    sourceName: page.sourceName,
    hasCodeExample,
  };

  // There might be multiple code examples, but we'll include the first language
  // to give an idea.
  const codeExampleLanguage = match && match[1];
  if (codeExampleLanguage) {
    frontMatter.codeExampleLanguage = codeExampleLanguage;
  }

  return {
    ...chunk,
    text: ["---", stringify(frontMatter).trimEnd(), "---", "", chunk.text].join(
      "\n"
    ),
  };
};
