import SwaggerParser from "@apidevtools/swagger-parser";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import yaml from "yaml";
import GPT3Tokenizer from "gpt3-tokenizer";
import {
  ChunkFunc,
  ChunkOptions,
  ContentChunk,
  SomeTokenizer,
} from "./chunkPage";
import { logger } from "../logger";
import { Page } from "../contentStore/Page";
import { updateFrontMatter } from "../frontMatter/updateFrontMatter";

export const defaultOpenApiSpecYamlChunkOptions: ChunkOptions = {
  maxChunkSize: 1250,
  chunkOverlap: 0,
  minChunkSize: 15,
  tokenizer: new GPT3Tokenizer({ type: "gpt3" }),
};

export const chunkOpenApiSpecYaml: ChunkFunc = async function (
  page: Page,
  optionsIn?: Partial<ChunkOptions>
): Promise<ContentChunk[]> {
  const options: ChunkOptions = {
    ...defaultOpenApiSpecYamlChunkOptions,
    ...optionsIn,
    maxChunkSize:
      optionsIn?.yamlChunkSize ??
      defaultOpenApiSpecYamlChunkOptions.maxChunkSize,
  };
  const { tokenizer, maxChunkSize, chunkOverlap } = options;
  const splitter = makeOpenApiSpecYamlTextSplitter({
    chunkOverlap,
    maxChunkSize,
    tokenizer,
  });
  const spec: Awaited<ReturnType<typeof SwaggerParser.parse>> & {
    servers?: { url?: string }[];
    components?: object;
  } = await SwaggerParser.parse(yaml.parse(page.body));
  const apiName = spec?.info?.title ?? page.title ?? "";
  const baseUrls = spec?.servers?.map((server) => server.url);
  const chunks: ContentChunk[] = [];
  let chunkIndex = 0;
  // Deal with paths
  const { paths } = spec;
  if (paths !== undefined) {
    for (const path of Object.keys(paths)) {
      const actions = paths[path];
      if (actions === undefined) {
        continue;
      }

      for (const action of Object.keys(actions ?? {})) {
        const resourceName = `${action.trim().toUpperCase()} ${path.trim()}`;
        const methodBody = actions[action as keyof typeof actions];
        if (!methodBody) {
          logger.info(`Skipping ${resourceName} - no method body`);
          continue;
        }
        const method = {
          [`${path}`]: {
            [`${action}`]: methodBody,
          },
        };
        const stringChunks = await splitter.splitText(yaml.stringify(method));

        chunks.push(
          ...stringChunks.map((stringChunk) => {
            const metadata = {
              resourceName,
              openApiSpec: true,
              apiName: apiName.trim(),
              baseUrls,
              specTags: (methodBody as { tags?: string[] }).tags ?? [],
            };
            const text = updateFrontMatter(stringChunk.trim(), metadata);
            const tokenCount = tokenizer.encode(text).bpe.length;
            const chunk: ContentChunk = {
              url: page.url,
              sourceName: page.sourceName,
              text,
              tokenCount,
              metadata,
              chunkIndex: chunkIndex++,
            };
            return chunk;
          })
        );
      }
    }
  }
  // deal with other parts of the spec to index besides paths
  const otherSpecInfoToKeep = {
    info: spec.info,
    security: spec.security,
    servers: spec.servers,
    tags: spec.tags,
    components: spec.components,
  };
  let stringChunks = await splitter.splitText(
    yaml.stringify(otherSpecInfoToKeep)
  );
  if (options.minChunkSize !== undefined) {
    const { minChunkSize } = options;
    stringChunks = stringChunks.filter(
      (chunk) => tokenizer.encode(chunk).bpe.length > minChunkSize
    );
  }
  chunks.push(
    ...stringChunks.map((stringChunk) => {
      const metadata = {
        openApiSpec: true,
        apiName: apiName,
        baseUrls,
      };
      const text = updateFrontMatter(stringChunk, metadata);
      const tokenCount = tokenizer.encode(text).bpe.length;
      const chunk: ContentChunk = {
        url: page.url,
        sourceName: page.sourceName,
        text,
        tokenCount,
        metadata,
        chunkIndex: chunkIndex++,
      };
      return chunk;
    })
  );

  return chunks;
};

interface OpenApiSpecTextSplitterParams {
  chunkOverlap: number;
  maxChunkSize: number;
  tokenizer: SomeTokenizer;
}
function makeOpenApiSpecYamlTextSplitter({
  chunkOverlap,
  maxChunkSize,
  tokenizer,
}: OpenApiSpecTextSplitterParams) {
  const separators = [
    "\npaths:\n",
    "\nget:\n",
    "\npost:\n",
    "\nput:\n",
    "\ndelete:\n",
    "\npatch:\n",
    "\nhead:\n",
    "\noptions:\n",
    "\nconnect:\n",
    "\ntrace:\n",
    "\nrequestBody:\n",
    "\nresponses:\n",
    "\n100:\n",
    "\n101:\n",
    "\n102:\n",
    "\n200:\n",
    "\n201:\n",
    "\n202:\n",
    "\n204:\n",
    "\n206:\n",
    "\n300:\n",
    "\n301:\n",
    "\n302:\n",
    "\n303:\n",
    "\n304:\n",
    "\n307:\n",
    "\n308:\n",
    "\n400:\n",
    "\n401:\n",
    "\n403:\n",
    "\n404:\n",
    "\n405:\n",
    "\n406:\n",
    "\n409:\n",
    "\n410:\n",
    "\n413:\n",
    "\n415:\n",
    "\n429:\n",
    "\n500:\n",
    "\n501:\n",
    "\n502:\n",
    "\n503:\n",
    "\n504:\n",
    "\n505:\n",
    "\ncontent\n",
    "\nschema:\n",
    "\n\n",
    "\n",
    " ",
    "",
  ];
  return new RecursiveCharacterTextSplitter({
    chunkOverlap,
    chunkSize: maxChunkSize,
    separators,
    lengthFunction: (text) => tokenizer.encode(text).bpe.length,
  });
}
