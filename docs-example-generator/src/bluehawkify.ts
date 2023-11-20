import { AzureKeyCredential, OpenAIClient } from "@azure/openai";
import {
  DatabaseConnection,
  assertEnvVars,
  CORE_ENV_VARS,
  makeOpenAiEmbedder,
} from "mongodb-rag-core";
import { promises as fs } from "fs";
import { MongoClient } from "mongodb";
import {
  makeDefaultFindContentFunc,
  FindContentFunc,
} from "mongodb-chatbot-server";
import YAML from "yaml";
import { stripIndents } from "common-tags";

import "dotenv/config";
import { ChatMessage, systemMessage, userMessage } from "./util";

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

  const [inputCodeFile, transformationFile] = (
    await Promise.allSettled([
      fs.readFile(inputCodeFilePath, "utf8"),
      fs.readFile(transformationFilePath, "utf8"),
    ])
  ).map((x) => {
    if (x.status === "rejected") {
      throw x.reason;
    }
    return x.value;
  });

  console.log(`inputCodeFilePath: ${inputCodeFilePath}`, inputCodeFile);
  console.log(
    `transformationFilePath: ${transformationFilePath}`,
    transformationFile
  );

  const transformation: Transformation = YAML.parse(transformationFile);
  console.log(`transformation:`, transformation);

  const {
    MONGODB_CONNECTION_URI,
    MONGODB_DATABASE_NAME,
    OPENAI_API_KEY,
    OPENAI_EMBEDDING_MODEL_VERSION,
    OPENAI_EMBEDDING_DEPLOYMENT,
    OPENAI_ENDPOINT,
  } = assertEnvVars(CORE_ENV_VARS);

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
    const analyzeCodeChat = [
      systemMessage(stripIndents`
        Your task is to analyze a provided code snippet and write a succinct
        description of the code's purpose as well as its style and other
        notable choices. Limit your response to 100 words.
      `),
      userMessage(stripIndents`
        Analyze the following code snippet and describe its purpose:

        ${sourceCode}
      `),
    ];

    const analyzeCodeOutput = await generate(analyzeCodeChat);
    if (!analyzeCodeOutput) {
      throw new Error("Could not analyze code");
    }

    console.log(`Input analysis:\n\n${analyzeCodeOutput}\n`);

    // console.log(`Transforming code...`);

    // const chat = [
    //   systemMessage(
    //     `You transform source code files into new representations as described by the user.`
    //   ),
    //   userMessage(stripIndents`
    //   The source code snippet has the following description:

    //   ${transformation.source.description}

    //   The desired output has the following description:

    //   ${transformation.target.description}

    //   Here is the source code snippet:

    //   ${sourceCode}

    //   Now translate to the desired output.
    // `),
    // ];

    // const output = await generate(chat);
    // if (!output) {
    //   throw new Error("Could not generate output for query");
    // }

    // console.log(`Created output:\n\n${output}\n`);
  } finally {
    // await store.close();
  }
}

main();

type Transformation = {
  source: {
    description: string;
  };
  target: {
    description: string;
  };
};

export type GenerateFunc = (
  messages: ChatMessage[]
) => Promise<string | undefined>;

function makeGenerateFunc(): GenerateFunc {
  const { OPENAI_API_KEY, OPENAI_CHAT_COMPLETION_DEPLOYMENT, OPENAI_ENDPOINT } =
  assertEnvVars(CORE_ENV_VARS);

  const openAiClient = new OpenAIClient(
    OPENAI_ENDPOINT,
    new AzureKeyCredential(OPENAI_API_KEY)
  );

  return async (messages) => {
    console.log("generating 1", messages)
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
