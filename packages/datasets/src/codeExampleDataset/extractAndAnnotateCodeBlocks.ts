import { PromisePool } from "@supercharge/promise-pool";
import {
  makePageParser,
  makeExtractCodeBlocksWithHeadings,
} from "./extractPageElements";
import { makeCreateCodeExampleDatasetEntry } from "./createCodeExampleDatasetEntry";
import { OpenAI } from "mongodb-rag-core/openai";
import { AstExtractedCodeblock } from "./AstExtractedCodeBlock";
import { PageDatasetEntry } from "../pageDataset/loadPageDataset";
import { logger } from "mongodb-rag-core";

export async function extractAndAnnotateCodeBlocks(
  pages: PageDatasetEntry[],
  openAiClient: OpenAI,
  model: string,
  codeBlockProcessingConcurrency = 5
) {
  // Construct data processors
  const pageParser = await makePageParser();
  const extractCodeBlocksWithHeadings =
    await makeExtractCodeBlocksWithHeadings();
  const createCodeExampleDatasetEntry = await makeCreateCodeExampleDatasetEntry(
    {
      openAiClient,
      model,
    }
  );

  // Extract code blocks from pages
  const allCodeBlocks = extractAllCodeBlocksFromPages(
    pages,
    pageParser,
    extractCodeBlocksWithHeadings
  );

  // Transform code blocks into dataset entries
  const codeBlockDatasetEntries = transformCodeBlocksIntoDatasetEntries(
    allCodeBlocks,
    pages,
    createCodeExampleDatasetEntry,
    codeBlockProcessingConcurrency
  );

  return codeBlockDatasetEntries;
}

type PageIdxCodeBlockTuple = [
  pageIdx: number,
  codeBlock: AstExtractedCodeblock
];

function extractAllCodeBlocksFromPages(
  pages: PageDatasetEntry[],
  pageParser: Awaited<ReturnType<typeof makePageParser>>,
  extractCodeBlocksWithHeadings: Awaited<
    ReturnType<typeof makeExtractCodeBlocksWithHeadings>
  >
) {
  const allCodeBlocks: PageIdxCodeBlockTuple[] = [];
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const ast = pageParser.parse(page.body);
    const codeBlocks = extractCodeBlocksWithHeadings({ page, ast });
    logger.info(
      `Extracted ${codeBlocks.length} code blocks from page ${page.url}`
    );
    const pageIdxCodeBlockTuples = codeBlocks.map(
      (codeBlock) => [i, codeBlock] satisfies PageIdxCodeBlockTuple
    );
    allCodeBlocks.push(...pageIdxCodeBlockTuples);
  }
  return allCodeBlocks;
}

async function transformCodeBlocksIntoDatasetEntries(
  codeBlocks: PageIdxCodeBlockTuple[],
  pages: PageDatasetEntry[],
  createCodeExampleDatasetEntry: Awaited<
    ReturnType<typeof makeCreateCodeExampleDatasetEntry>
  >,
  concurrency: number
) {
  const { results } = await PromisePool.withConcurrency(concurrency)
    .for(codeBlocks)
    .process(async ([pageIdx, codeBlock], i) => {
      const page = pages[pageIdx];
      logger.info(
        `Processing code block ${i + 1}/${codeBlocks.length} for page ${
          page.url
        }`
      );
      const codeExampleDatasetEntry = await createCodeExampleDatasetEntry({
        page,
        codeBlock,
      });
      return codeExampleDatasetEntry;
    });
  return results;
}
