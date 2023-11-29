"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const openai_1 = require("@azure/openai");
const mongodb_rag_core_1 = require("mongodb-rag-core");
const fs_1 = require("fs");
const common_tags_1 = require("common-tags");
require("dotenv/config");
const util_1 = require("./util");
// ./build/code2code.js <input code file> <output path> <transformation file>
async function main() {
    const inputCodeFilePath = process.argv[2];
    if (inputCodeFilePath === undefined) {
        console.error(`Missing argument: inputCodeFilePath`);
        return;
    }
    const outputFilePath = process.argv[3];
    if (outputFilePath === undefined) {
        console.error(`Missing argument: outputFilePath`);
        return;
    }
    const transformationFilePath = process.argv[4];
    if (transformationFilePath === undefined) {
        console.error(`Missing argument: transformationFilePath`);
        return;
    }
    const [inputCodeFile,
    // transformationFile
    ] = (await Promise.allSettled([
        fs_1.promises.readFile(inputCodeFilePath, "utf8"),
        // fs.readFile(transformationFilePath, "utf8"),
    ])).map((x) => {
        if (x.status === "rejected") {
            throw x.reason;
        }
        return x.value;
    });
    console.log(`inputCodeFilePath: ${inputCodeFilePath}`, inputCodeFile);
    // console.log(
    //   `transformationFilePath: ${transformationFilePath}`,
    //   transformationFile
    // );
    // const transformation: Transformation = YAML.parse(transformationFile);
    // console.log(`transformation:`, transformation);
    const { MONGODB_CONNECTION_URI, MONGODB_DATABASE_NAME, OPENAI_API_KEY, OPENAI_EMBEDDING_MODEL_VERSION, OPENAI_EMBEDDING_DEPLOYMENT, OPENAI_ENDPOINT, } = (0, mongodb_rag_core_1.assertEnvVars)(mongodb_rag_core_1.CORE_ENV_VARS);
    // const mongodb = new MongoClient(MONGODB_CONNECTION_URI);
    try {
        // const findContent = makeDefaultFindContentFunc({
        //   embed: makeOpenAiEmbedFunc({
        //     apiKey,
        //     apiVersion,
        //     baseUrl,
        //     deployment,
        //   }),
        //   store,
        //   findNearestNeighborsOptions: {
        //     k: 25,
        //   },
        // });
        const sourceCode = inputCodeFile;
        console.log(`Setting up...`);
        const generate = makeGenerateFunc();
        console.log(`Analyzing code...`);
        const analyzeCodeOutput = await summarize({ generate, sourceCode });
        console.log(`Input analysis:\n\n${analyzeCodeOutput}\n`);
        console.log(`Transforming code...`);
        const transformed = await bluehawkify({
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
    finally {
        // await store.close();
    }
}
main();
function makeGenerateFunc() {
    const { OPENAI_API_KEY, OPENAI_CHAT_COMPLETION_DEPLOYMENT, OPENAI_ENDPOINT } = (0, mongodb_rag_core_1.assertEnvVars)(mongodb_rag_core_1.CORE_ENV_VARS);
    const openAiClient = new openai_1.OpenAIClient(OPENAI_ENDPOINT, new openai_1.AzureKeyCredential(OPENAI_API_KEY));
    return async (messages) => {
        try {
            const { choices: [{ message }], } = await openAiClient.getChatCompletions(OPENAI_CHAT_COMPLETION_DEPLOYMENT, messages);
            return message?.content ?? undefined;
        }
        catch (err) {
            console.error(`Error generating chat completion`, err);
            throw err;
        }
    };
}
async function summarize({ generate, sourceCode, }) {
    generate = generate ?? makeGenerateFunc();
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
async function translate({ generate, sourceCode, sourceDescription, targetDescription, }) {
    generate = generate ?? makeGenerateFunc();
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
async function bluehawkify({ generate, sourceCode, sourceDescription, targetDescription, }) {
    generate = generate ?? makeGenerateFunc();
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
