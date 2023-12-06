import { html, stripIndent, stripIndents } from "common-tags";
import { makeFindContent } from "./findContentFunc";
import { makeGenerateFunc } from "./generate";
import { summarizePage, translatePage } from "./operations";
import { writeFile } from "fs/promises";

export type GenerateDocsPage = {
  sourcePage: string;
};

export async function generateDocsPage(args: GenerateDocsPage) {
  const { sourcePage } = args;

  console.log(`Setting up...`);
  const generate = makeGenerateFunc();
  const { findContent, cleanup: cleanupFindContent } = makeFindContent();

  try {
    console.log(`Analyzing page...`);
    const analyzePageOutput = await summarizePage({
      generate,
      sourcePage,
    });
    console.log(`Input analysis:\n\n${analyzePageOutput}\n`);

    console.log(`Finding Relevant Content...`);
    // Find content in the existing off-site docs if we have them
    // e.g. if the target is C++ then we'd want to find content from https://mongocxx.org
    // e.g. if the target is PHP then we'd want to find content from https://www.mongodb.com/docs/php-library/current/
    const { content } = await findContent({
      // query: "How does the driver version API and ABI?",
      query: analyzePageOutput,
    });
    // Log the search results
    const chunks = content.map(
      (embed) => html`
        <Chunk
          score="{${embed.score}}"
          sourceName="${embed.sourceName}"
          url="${embed.url}"
        >
          ${embed.text}
        </Chunk>
      `
    );
    const chunkList = chunks.join("\n");
    console.log(chunkList);
    console.log(`Logged ${chunks.length} chunks`);

    console.log(`Transforming page...`);
    const transformed = await translatePage({
      generate,
      sourcePage,
      sourceDescription: analyzePageOutput,
      targetDescription: stripIndents`
        The same documentation page but in the context of the MongoDB C++ driver.
        The page should use well-formatted reStructuredText markup instead of Markdown.
      `,
    });
    // const transformed = await translate({
    //   generate,
    //   sourceCode,
    //   sourceDescription: analyzeCodeOutput,
    //   targetDescription:
    //     "A Kotlin file that contains example source code for the MongoDB Kotlin Driver. The example should match the behavior of the provided source code as closely as possible. The code should use idiomatic Kotlin features.",
    // });

    // const output = await generate(chat);
    // if (!output) {
    //   throw new Error("Could not generate output for query");
    // }

    console.log(`Created output:\n\n${transformed}\n`);
    console.log("writing");
    await writeFile("./output-generateDocsPage.txt", transformed);
    console.log("written");
    // @ts-ignore: Unreachable code error
    // console.log("process._getActiveHandles()", process._getActiveHandles());
    // @ts-ignore: Unreachable code error
    // console.log("process._getActiveRequests()", process._getActiveRequests());
  } finally {
    await cleanupFindContent();
  }
}
