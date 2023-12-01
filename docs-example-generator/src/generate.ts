import { AzureKeyCredential, OpenAIClient } from "@azure/openai";
import {
  DatabaseConnection,
  assertEnvVars,
  CORE_ENV_VARS,
  makeOpenAiEmbedder,
  makeMongoDbEmbeddedContentStore,
} from "mongodb-rag-core";
import { promises as fs } from "fs";
import { MongoClient } from "mongodb";
// import {
//   makeDefaultFindContentFunc,
//   FindContentFunc,
// } from "mongodb-chatbot-server";
import YAML from "yaml";
import { stripIndents } from "common-tags";

import "dotenv/config";
import { ChatMessage, systemMessage, userMessage } from "./util";
import { makeFindContentFunc } from "./findContentFunc";
import { generateCodeExample } from "./generateCodeExample";
import { generateDocsPage } from "./generateDocsPage";

type TaskName = (typeof TaskName)[number];
const TaskName = [
  "generateCodeExample",
  "generateDocsPage",
  "generateTestFile",
  "generateBluehawkTestFile",
] as const;

// ./build/generate.js <task name> <input code file>
async function main() {
  const taskName = process.argv[2];
  if (taskName === undefined) {
    console.error(`Missing argument: taskName`);
    return;
  }
  if (!TaskName.includes(taskName as TaskName)) {
    console.error(
      `Invalid task name: ${taskName}.\n\nMust be one of ["${TaskName.join(
        '", "'
      )}"]`
    );
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
      await generateCodeExample({
        sourceCode: inputCodeFile,
      });
      return;
    }
    case "generateDocsPage": {
      await generateDocsPage({
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

export type GenerateFunc = (
  messages: ChatMessage[]
) => Promise<string | undefined>;

export function makeGenerateFunc(): GenerateFunc {
  const { OPENAI_API_KEY, OPENAI_CHAT_COMPLETION_DEPLOYMENT, OPENAI_ENDPOINT } =
    assertEnvVars(CORE_ENV_VARS);

  const openAiClient = new OpenAIClient(
    OPENAI_ENDPOINT,
    new AzureKeyCredential(OPENAI_API_KEY)
  );

  return async (messages) => {
    try {
      const {
        choices: [{ message }],
      } = await openAiClient.getChatCompletions(
        OPENAI_CHAT_COMPLETION_DEPLOYMENT,
        messages
      );
      return message?.content ?? undefined;
    } catch (err) {
      console.error(`Error generating chat completion`, err);
      throw err;
    }
  };
}

async function readFiles(filePaths: string[]): Promise<string[]> {
  const results = await Promise.allSettled(
    filePaths.map((filePath) => fs.readFile(filePath, "utf8"))
  );
  return results.map((x) => {
    if (x.status === "rejected") {
      throw x.reason;
    }
    return x.value;
  });
}
