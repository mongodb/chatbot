import {
  AstExtractedCodeblock,
  AugmentedAstExtractedCodeblock,
} from "./AstExtractedCodeBlock.js";
import "dotenv/config";
import { makeCreatePromptsFromText } from "./createPromptsFromText.js";
import { contextualizeCodeBlock } from "./contextualizeCodeBlock.js";
import { makeClassifyCodeExample } from "./classifyCodeExample.js";
import { PersistedPage } from "mongodb-rag-core";

export async function appendLlmMetadata({
  pages,
  codeExamples,
  batchSize = 5,
}: {
  pages: PersistedPage[];
  codeExamples: AstExtractedCodeblock[];
  batchSize?: number;
}): Promise<AugmentedAstExtractedCodeblock[]> {
  const pagesMap: { [url: string]: PersistedPage } = {};
  for (const page of pages) {
    pagesMap[page.url] = page;
  }

  const createQuestionsFromText = makeCreatePromptsFromText();
  const classifyCodeExample = await makeClassifyCodeExample();

  const codeBlocksWithPrompts: AugmentedAstExtractedCodeblock[] = [];

  for (let i = 0; i < codeExamples.length; i += batchSize) {
    console.log(
      `Processing codeblocks indexes ${i} to ${i + batchSize - 1} of ${
        codeExamples.length
      } total...`
    );
    const batchPromises = codeExamples
      .slice(i, i + batchSize)
      .map(async (codeblock) => {
        const page = pagesMap[codeblock.metadata.pageUrl];
        const text = contextualizeCodeBlock({
          codeblock,
          page,
        });
        const [prompts, classification] = await Promise.all([
          createQuestionsFromText({ text }),
          classifyCodeExample({ text }),
        ]);

        return {
          ...codeblock,
          prompts,
          classification,
        } satisfies AugmentedAstExtractedCodeblock;
      });

    const results = await Promise.allSettled(batchPromises);
    results.forEach((result) => {
      if (result.status === "fulfilled") {
        codeBlocksWithPrompts.push(result.value);
      } else {
        console.error("Failed to process codeblock:", result.reason);
      }
    });
  }
  return codeBlocksWithPrompts;
}
