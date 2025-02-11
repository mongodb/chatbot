import fs from "fs";
import path from "path";
import {
  extractCodeBlocksWithHeadings,
  makePageParser,
} from "../extractPageElements.js";
import { PersistedPage } from "mongodb-rag-core";
async function main(): Promise<void> {
  const basePath = path.resolve("data");
  const pathIn = path.resolve(
    basePath,
    "docs-devcenter-content-snapshot.2024-05-20.json"
  );
  const pathOut = path.resolve(
    basePath,
    `docs-chatbot.code-examples-with-headings-${Date.now()}.json`
  );
  const pageParser = makePageParser();
  const pages = JSON.parse(fs.readFileSync(pathIn, "utf-8")) as PersistedPage[];
  const allCodeBlocks = [];
  for (const page of pages) {
    const ast = pageParser.parse(page.body);
    const codeBlocks = extractCodeBlocksWithHeadings({ page, ast });
    allCodeBlocks.push(...codeBlocks);
  }
  fs.writeFileSync(pathOut, JSON.stringify(allCodeBlocks, null, 2));
}
main();
