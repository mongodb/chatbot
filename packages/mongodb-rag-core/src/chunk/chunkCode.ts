import {
  RecursiveCharacterTextSplitter,
  SupportedTextSplitterLanguage,
} from "langchain/text_splitter";
import GPT3Tokenizer from "gpt3-tokenizer";
import { ChunkOptions, ContentChunk, ChunkFunc } from "./chunkPage";
import { Page } from "../contentStore";
import { PageFormat } from "../contentStore";

const defaultCodeChunkOptions: ChunkOptions = {
  maxChunkSize: 600, // max chunk size of 600 tokens gets avg ~400 tokens/chunk
  minChunkSize: 0, // chunks below this size are discarded, which improves search quality
  chunkOverlap: 0,
  tokenizer: new GPT3Tokenizer({ type: "gpt3" }),
};

export const chunkCode: ChunkFunc = async function (
  page: Page,
  optionsIn?: Partial<ChunkOptions>
) {
  const options = { ...defaultCodeChunkOptions, ...optionsIn };
  const { tokenizer, maxChunkSize, minChunkSize, chunkOverlap, transform } =
    options;
  const language = pageFormatToLanguage(page.format);
  if (!language) {
    throw new Error(`No language found for page format ${page.format}`);
  }
  const splitter = RecursiveCharacterTextSplitter.fromLanguage(language, {
    chunkOverlap,
    chunkSize: maxChunkSize,
    lengthFunction: (text) => tokenizer.encode(text).bpe.length,
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
      return chunk;
    })
  );
};

type CodePageFormat = Exclude<
  PageFormat,
  | "txt"
  | "md"
  | "mdx"
  | "restructuredtext"
  | "csv"
  | "json"
  | "yaml"
  | "toml"
  | "xml"
  | "graphql"
  | "openapi-json"
  | "openapi-yaml"
>;

type LangchainSupportedCodePageFormat = Exclude<
  CodePageFormat,
  "csharp" | "kotlin" | "objective-c" | "shell"
>;

const supportedLanguageMap: Record<
  LangchainSupportedCodePageFormat,
  SupportedTextSplitterLanguage
> = {
  c: "cpp",
  cpp: "cpp",
  go: "go",
  java: "java",
  javascript: "js",
  typescript: "js",
  php: "php",
  python: "python",
  ruby: "ruby",
  rust: "rust",
  scala: "scala",
  swift: "swift",
  latex: "latex",
  html: "html",
};

export function isSupportedLanguage(
  str: PageFormat
): str is LangchainSupportedCodePageFormat {
  return str in supportedLanguageMap;
}

export function pageFormatToLanguage(
  format: PageFormat
): SupportedTextSplitterLanguage | undefined {
  return (
    supportedLanguageMap[format as LangchainSupportedCodePageFormat] ??
    undefined
  );
}
