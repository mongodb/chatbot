"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCodeExample = void 0;
const common_tags_1 = require("common-tags");
const findContentFunc_1 = require("./findContentFunc");
const generate_1 = require("./generate");
const operations_1 = require("./operations");
async function generateCodeExample(args) {
    const { sourceCode } = args;
    console.log(`Setting up...`);
    const generate = (0, generate_1.makeGenerateFunc)();
    const findContent = (0, findContentFunc_1.makeFindContentFunc)();
    // console.log(`Querying...`);
    // const { queryEmbedding, content } = await findContent({
    //   query: "How does the driver version API and ABI?",
    //   ipAddress: "::1",
    // });
    // console.log(`Logging...`);
    // for (const embed of content) {
    //   console.log(`Embedding: ${embed.score}`, embed);
    // }
    // console.log(`Logged ${content.length} chunks`);
    // Find content in the existing off-site docs if we have them
    // e.g. if the target is C++ then we'd want to find content from https://mongocxx.org
    // e.g. if the target is PHP then we'd want to find content from https://mongocxx.org
    console.log(`Analyzing code...`);
    const analyzeCodeOutput = await (0, operations_1.summarize)({ generate, sourceCode });
    console.log(`Input analysis:\n\n${analyzeCodeOutput}\n`);
    console.log(`Transforming code...`);
    const transformed = await (0, operations_1.bluehawkify)({
        generate,
        sourceCode,
        sourceDescription: analyzeCodeOutput,
        targetDescription: (0, common_tags_1.stripIndents) `
        A file that uses jest to test the provided source code.

        The file MUST include:

        - a \`describe()\` block with a title that matches the provided source code's title.

        - assertions via the \`expect()\` function that test actual behavior and values against expected behavior and values.

        - comments with Bluehawk annotations such that the output of \`bluehawk snip\` is identical to the provided source code.
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
}
exports.generateCodeExample = generateCodeExample;
