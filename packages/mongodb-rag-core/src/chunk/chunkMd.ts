import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import GPT3Tokenizer from "gpt3-tokenizer";
import { ChunkOptions, ContentChunk, ChunkFunc } from "./chunkPage";
import { extractFrontMatter } from "../frontMatter";
import { Page } from "../contentStore";

const defaultMdChunkOptions: ChunkOptions = {
  maxChunkSize: 600, // max chunk size of 600 tokens gets avg ~400 tokens/chunk
  minChunkSize: 15, // chunks below this size are discarded, which improves search quality
  chunkOverlap: 0,
  tokenizer: new GPT3Tokenizer({ type: "gpt3" }),
};

// separators modified from https://github.com/hwchase17/langchainjs/blob/d017e0dac9d84c9d58fd816698125ab0ae1c0826/langchain/src/text_splitter.ts#L566C5-L566C5
const separators = [
  // First, try to split along Markdown headings (starting with level 2)
  "\n## ",
  "\n### ",
  "\n#### ",
  "\n##### ",
  "\n###### ",
  '\n\n<Tab name="',
  "\n\n<Tabs>\n\n",
  "<table>\n",
  "<tr>\n",
  "<th>\n",
  "<td>\n",
  "```\n\n",
  "\n\n***\n\n",
  "\n\n---\n\n",
  "\n\n___\n\n",
  "\n\n",
  "\n",
  " ",
  "",
];
export const chunkMd: ChunkFunc = async function (
  page: Page,
  optionsIn?: Partial<ChunkOptions>
) {
  const options = { ...defaultMdChunkOptions, ...optionsIn };
  const { tokenizer, maxChunkSize, minChunkSize, chunkOverlap, transform } =
    options;
  const splitter = new RecursiveCharacterTextSplitter({
    chunkOverlap,
    chunkSize: maxChunkSize,
    lengthFunction: (text) => tokenizer.encode(text).bpe.length,
    separators,
  });

  let chunks = await splitter.createDocuments([page.body]);
  if (minChunkSize) {
    chunks = chunks.filter(
      (chunk) => tokenizer.encode(chunk.pageContent).bpe.length > minChunkSize
    );
  }
  return await Promise.all(
    chunks.map(async ({ pageContent }, chunkIndex): Promise<ContentChunk> => {
      const preTransformChunk: Omit<ContentChunk, "tokenCount"> = {
        chunkIndex,
        sourceName: page.sourceName,
        url: page.url,
        text: pageContent,
      };
      const transformedChunk = transform
        ? await transform(preTransformChunk, { page })
        : preTransformChunk;

      const chunk = {
        ...transformedChunk,
        tokenCount: tokenizer.encode(transformedChunk.text).bpe.length,
      };
      const { metadata } = extractFrontMatter(transformedChunk.text);
      if (metadata) {
        chunk["metadata"] = metadata;
      }
      return chunk;
    })
  );
};
