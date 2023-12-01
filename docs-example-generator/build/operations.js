"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bluehawkify = exports.translatePage = exports.translate = exports.summarizePage = exports.summarize = void 0;
const common_tags_1 = require("common-tags");
const generate_1 = require("./generate");
const util_1 = require("./util");
async function summarize({ generate, sourceCode, }) {
    generate = generate ?? (0, generate_1.makeGenerateFunc)();
    const analyzeCodeChat = [
        (0, util_1.systemMessage)((0, common_tags_1.stripIndents) `
        Your task is to analyze a provided code snippet and write a succinct
        description of the code's purpose as well as its style and other
        notable choices. Limit your response to 100 words.
      `),
        (0, util_1.userMessage)((0, common_tags_1.stripIndents) `
        Analyze the following code snippet and describe its purpose:

        ${sourceCode}
      `),
    ];
    const analyzeCodeOutput = await generate(analyzeCodeChat);
    if (!analyzeCodeOutput) {
        throw new Error("Could not analyze code");
    }
    return analyzeCodeOutput;
}
exports.summarize = summarize;
async function summarizePage({ generate, sourcePage, }) {
    generate = generate ?? (0, generate_1.makeGenerateFunc)();
    const analyzeCodeChat = [
        (0, util_1.systemMessage)((0, common_tags_1.stripIndents) `
        Your task is to analyze a provided documentation page and write a succinct
        description of the content as well as its style and other notable choices.
        Limit your response to 100 words.
      `),
        (0, util_1.userMessage)((0, common_tags_1.stripIndents) `
        Analyze the following page and describe its contents:

        ${sourcePage}
      `),
    ];
    const analyzeCodeOutput = await generate(analyzeCodeChat);
    if (!analyzeCodeOutput) {
        throw new Error("Could not analyze code");
    }
    return analyzeCodeOutput;
}
exports.summarizePage = summarizePage;
async function translate({ generate, sourceCode, sourceDescription, targetDescription, }) {
    generate = generate ?? (0, generate_1.makeGenerateFunc)();
    const translateCodeChat = [
        (0, util_1.systemMessage)((0, common_tags_1.stripIndents) `
      You transform source code files from one programming language into another programming language.
      Assume the provided code is correct.
      Use idiomatic code and style conventions in the tranformed output.
      Output only the transformed code with no additional text.
    `),
        (0, util_1.userMessage)((0, common_tags_1.stripIndents) `
      The source code snippet has the following description:

      ${sourceDescription}

      The desired output has the following description:

      ${targetDescription}

      Here is the source code snippet:

      ${sourceCode}

      Now translate to the desired output. Return only the transformed code with no additional text.`),
    ];
    const output = await generate(translateCodeChat);
    if (!output) {
        throw new Error("Could not generate output for query");
    }
    return output;
}
exports.translate = translate;
async function translatePage({ generate, sourcePage, sourceDescription, targetDescription, }) {
    generate = generate ?? (0, generate_1.makeGenerateFunc)();
    const translateCodeChat = [
        (0, util_1.systemMessage)((0, common_tags_1.stripIndents) `
      Given a documentation page that describes a database drivers for a specific platform and programming language,
      translate the page for the specified platform and/or programming language.
      Assume the provided page is correct.
      Use idiomatic suggestions and style conventions in the tranformed output.
    `),
        (0, util_1.userMessage)((0, common_tags_1.stripIndents) `

      This is a description of the original page:

      ${sourceDescription}

      This is the original page written for the Node.js driver:

      <<<<<<<<<BEGIN ORIGINAL PAGE
      ${sourcePage}
      END ORIGINAL PAGE>>>>>>>>>>>>>>>>

      The desired output has the following description:

      ${targetDescription}

      Now translate to the desired output. Return only the translated page with no additional text.`),
    ];
    const output = await generate(translateCodeChat);
    if (!output) {
        throw new Error("Could not generate output for query");
    }
    return output;
}
exports.translatePage = translatePage;
async function bluehawkify({ generate, sourceCode, sourceDescription, targetDescription, }) {
    generate = generate ?? (0, generate_1.makeGenerateFunc)();
    const bluehawkifyChat = [
        (0, util_1.systemMessage)((0, common_tags_1.stripIndents) `
      You transform source code files into unit test files that ensure the behavior of the provided source code.
      The unit test files should include the provided source code rather than importing from another file or otherwise obfuscating the source code.
      Assume the provided code is correct.
      Use idiomatic code and style conventions in the test code.
      Output only the test file code with no additional text.
    `),
        (0, util_1.userMessage)((0, common_tags_1.stripIndents) `
      Adapt the following code snippet into a file that tests the provided source code. Make sure to import the necessary dependencies and declare any necessary types, classes, structs, etc.

      The source code snippet has the following description:

      ${sourceDescription}

      The desired output has the following description:

      ${targetDescription}

      Here is the source code snippet:

      ${sourceCode}

      Now generate the desired output. Return only the code with no additional text.,
    `),
    ];
    console.log("bluehawkifying - here's the chat", bluehawkifyChat);
    const output = await generate(bluehawkifyChat);
    if (!output) {
        throw new Error("Could not bluehawkify");
    }
    return output;
}
exports.bluehawkify = bluehawkify;
