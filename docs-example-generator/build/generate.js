"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeGenerateFunc = void 0;
const openai_1 = require("@azure/openai");
const mongodb_rag_core_1 = require("mongodb-rag-core");
const fs_1 = require("fs");
require("dotenv/config");
const generateCodeExample_1 = require("./generateCodeExample");
const generateDocsPage_1 = require("./generateDocsPage");
const TaskName = [
    "generateCodeExample",
    "generateDocsPage",
    "generateTestFile",
    "generateBluehawkTestFile",
];
// ./build/generate.js <task name> <input code file>
async function main() {
    const taskName = process.argv[2];
    if (taskName === undefined) {
        console.error(`Missing argument: taskName`);
        return;
    }
    if (!TaskName.includes(taskName)) {
        console.error(`Invalid task name: ${taskName}.\n\nMust be one of ["${TaskName.join('", "')}"]`);
        return;
    }
    const inputCodeFilePath = process.argv[3];
    if (inputCodeFilePath === undefined) {
        console.error(`Missing argument: inputCodeFilePath`);
        return;
    }
    const [inputCodeFile] = await readFiles([inputCodeFilePath]);
    console.log(`inputCodeFilePath: ${inputCodeFilePath}`, inputCodeFile);
    switch (taskName) {
        case "generateCodeExample": {
            await (0, generateCodeExample_1.generateCodeExample)({
                sourceCode: inputCodeFile,
            });
            return;
        }
        case "generateDocsPage": {
            await (0, generateDocsPage_1.generateDocsPage)({
                sourcePage: inputCodeFile,
            });
            return;
        }
        case "generateTestFile": {
            console.log(`NotImplemented: "generateTestFile"`);
            return;
        }
        case "generateBluehawkTestFile": {
            console.log(`NotImplemented: "generateBluehawkTestFile"`);
            return;
        }
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
exports.makeGenerateFunc = makeGenerateFunc;
async function readFiles(filePaths) {
    const results = await Promise.allSettled(filePaths.map((filePath) => fs_1.promises.readFile(filePath, "utf8")));
    return results.map((x) => {
        if (x.status === "rejected") {
            throw x.reason;
        }
        return x.value;
    });
}
