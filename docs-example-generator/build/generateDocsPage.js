"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDocsPage = void 0;
const common_tags_1 = require("common-tags");
const findContentFunc_1 = require("./findContentFunc");
const generate_1 = require("./generate");
const operations_1 = require("./operations");
const promises_1 = require("fs/promises");
async function generateDocsPage(args) {
    const { sourcePage } = args;
    console.log(`Setting up...`);
    const generate = (0, generate_1.makeGenerateFunc)();
    const findContent = (0, findContentFunc_1.makeFindContentFunc)();
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
    const analyzePageOutput = await (0, operations_1.summarizePage)({
        generate,
        sourcePage,
    });
    console.log(`Input analysis:\n\n${analyzePageOutput}\n`);
    console.log(`Transforming page...`);
    const transformed = await (0, operations_1.translatePage)({
        generate,
        sourcePage,
        sourceDescription: analyzePageOutput,
        targetDescription: (0, common_tags_1.stripIndents) `
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
    await (0, promises_1.writeFile)("./output-generateDocsPage.txt", transformed);
}
exports.generateDocsPage = generateDocsPage;
