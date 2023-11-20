"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const openai_1 = require("@azure/openai");
const mongodb_rag_core_1 = require("mongodb-rag-core");
const fs_1 = require("fs");
const yaml_1 = __importDefault(require("yaml"));
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
    const x = await Promise.allSettled([
        fs_1.promises.readFile(inputCodeFilePath, "utf8"),
        // fs.readFile(outputFilePath, "utf8"),
        fs_1.promises.readFile(transformationFilePath, "utf8"),
    ]);
    const [inputCodeFile, 
    // outputFile,
    transformationFile,] = x.map((x) => {
        if (x.status === "rejected") {
            throw x.reason;
        }
        return x.value;
    });
    console.log(`inputCodeFilePath: ${inputCodeFilePath}`, inputCodeFile);
    // console.log(`outputFilePath: ${outputFilePath}`, outputFile);
    console.log(`transformationFilePath: ${transformationFilePath}`, transformationFile);
    const transformation = yaml_1.default.parse(transformationFile);
    console.log(`transformation:`, transformation);
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
        await generate_example({
            // findContent,
            sourceCode: inputCodeFile,
            transformation,
            // generate: makeGenerateFunc(),
        });
    }
    finally {
        // await mongodb.close();
    }
}
main();
async function generate_example({ 
// findContent,
sourceCode, transformation, }) {
    console.log(`Setting up...`);
    const generate = makeGenerateFunc();
    // console.log(`Found content: ${content.length}`);
    // content.sort((a, b) => b.score - a.score);
    console.log(`Analyzing code...`);
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
    console.log(`Input analysis:\n\n${analyzeCodeOutput}\n`);
    console.log(`Transforming code...`);
    const chat = [
        (0, util_1.systemMessage)(`You transform source code files into new representations as described by the user.`),
        (0, util_1.userMessage)((0, common_tags_1.stripIndents) `
      The source code snippet has the following description:

      ${transformation.source.description}

      The desired output has the following description:

      ${transformation.target.description}

      Here is the source code snippet:

      ${sourceCode}

      Now translate to the desired output.
    `),
    ];
    const output = await generate(chat);
    if (!output) {
        throw new Error("Could not generate output for query");
    }
    console.log(`Created output:\n\n${output}\n`);
}
function makeGenerateFunc() {
    const { OPENAI_API_KEY, OPENAI_CHAT_COMPLETION_DEPLOYMENT, OPENAI_ENDPOINT } = (0, mongodb_rag_core_1.assertEnvVars)(mongodb_rag_core_1.CORE_ENV_VARS);
    const openAiClient = new openai_1.OpenAIClient(OPENAI_ENDPOINT, new openai_1.AzureKeyCredential(OPENAI_API_KEY));
    return async (messages) => {
        try {
            const { choices: [{ message }], } = await openAiClient.getChatCompletions(OPENAI_CHAT_COMPLETION_DEPLOYMENT, messages);
            return message?.content ?? undefined;
        }
        catch (err) {
            throw err;
        }
    };
}
