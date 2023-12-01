import { stripIndents } from "common-tags";
import { makeFindContentFunc } from "./findContentFunc";
import { makeGenerateFunc } from "./generate";
import { bluehawkify, summarize, summarizePage, translate, translatePage } from "./operations";
import { writeFile } from "fs/promises";

export type GenerateDocsPage = {
  sourcePage: string;
};

export async function generateDocsPage(args: GenerateDocsPage) {
  const { sourcePage } = args;

  console.log(`Setting up...`);
  const generate = makeGenerateFunc();
  const findContent = makeFindContentFunc();

  console.log(`Querying...`);
  // Find content in the existing off-site docs if we have them
  // e.g. if the target is C++ then we'd want to find content from https://mongocxx.org
  // e.g. if the target is PHP then we'd want to find content from https://mongocxx.org
  const { queryEmbedding, content } = await findContent({
    query: "How does the driver version API and ABI?",
    ipAddress: "::1",
  });
  console.log(`Logging...`);
  for (const embed of content) {
    console.log(`Embedding: ${embed.score}`, embed);
  }
  console.log(`Logged ${content.length} chunks`);



  console.log(`Analyzing page...`);
  const analyzePageOutput = await summarizePage({
    generate,
    sourcePage,
  });
  console.log(`Input analysis:\n\n${analyzePageOutput}\n`);


  console.log(`Transforming page...`);
  const transformed = await translatePage({
    generate,
    sourcePage,
    sourceDescription: analyzePageOutput,
    targetDescription: stripIndents`
        The same documentation page but in the context of the MongoDB C++ driver.
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
  await writeFile("./output-generateDocsPage.txt", transformed);
}
