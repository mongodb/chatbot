import { strict as assert } from "assert";
import frontmatter from "front-matter";
import { ContentChunk } from "./chunkPage";
import { Page } from "../contentStore/Page";
import { updateFrontMatter } from "../frontMatter/updateFrontMatter";

export type ChunkTransformer = (
  chunk: Omit<ContentChunk, "tokenCount">,
  details: {
    page: Page;
  }
) => Promise<Omit<ContentChunk, "tokenCount">>;

export type ChunkMetadataGetter<
  T extends Record<string, unknown> = Record<string, unknown>
> = (args: {
  chunk: Omit<ContentChunk, "tokenCount">;

  page: Page;

  /**
    Previous metadata, if any. Omitting this from the return value should not
    overwrite previous metadata.
   */
  metadata?: T;

  /**
    The text of the chunk without metadata.
   */
  text: string;
}) => Promise<T>;

/**
  Create a function that adds or updates front matter metadata to the chunk
  text.
 */
export const makeChunkFrontMatterUpdater = <
  T extends Record<string, unknown> = Record<string, unknown>
>(
  getMetadata: ChunkMetadataGetter<T>
): ChunkTransformer => {
  return async (chunk, { page }) => {
    // Extract existing front matter, if any
    const frontMatterResult = frontmatter.test(chunk.text)
      ? frontmatter<T>(chunk.text)
      : undefined;
    const body = frontMatterResult?.body ?? chunk.text;

    // Construct new metadata object from existing front matter (if any) and
    // user-provided metadata function
    const metadata = {
      ...(frontMatterResult?.attributes ?? {}),
      ...(await getMetadata({
        chunk,
        page,
        metadata: frontMatterResult?.attributes,
        text: body,
      })),
    };

    // Update chunk with new front matter in yaml format
    return {
      ...chunk,
      text: updateFrontMatter(body, metadata),
    };
  };
};

/**
  Forms common metadata based on the chunk text, including info about any code
  examples in the text.
 */
export const standardMetadataGetter: ChunkMetadataGetter<{
  pageTitle?: string;
  hasCodeBlock: boolean;
  codeBlockLanguages?: string[];
  tags?: string[];
  [k: string]: unknown;
}> = async ({ page, text }) => {
  // Detect code blocks
  const mdCodeBlockToken = /```([A-z0-1-_]*)/;
  const codeBlockLanguages = Array.from(
    new Set(
      text
        .split("\n")
        .map((line) => mdCodeBlockToken.exec(line))
        .filter((match) => match !== null)
        .map((match) => {
          assert(match !== null);
          return match[1];
        })
    )
  );

  const metadata: Awaited<ReturnType<typeof standardMetadataGetter>> = {
    pageTitle: page.title,
    hasCodeBlock: codeBlockLanguages.length !== 0,
  };

  // Which code examples
  const specifiedLanguages = codeBlockLanguages.filter(
    (language) => language !== ""
  );

  if (specifiedLanguages.length) {
    metadata["codeBlockLanguages"] = specifiedLanguages;
  }

  return { ...getPageChunkMetadata(page.metadata), ...metadata };
};

function getPageChunkMetadata(pageMetadata: Page["metadata"]) {
  if (pageMetadata !== undefined) {
    const { page, ...copy } = pageMetadata;
    return copy;
  }
  return undefined;
}

export const standardChunkFrontMatterUpdater = makeChunkFrontMatterUpdater(
  standardMetadataGetter
);
