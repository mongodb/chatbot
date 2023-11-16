import { AzureKeyCredential, OpenAIClient } from "@azure/openai";
import {
  makeDatabaseConnection,
  assertEnvVars,
  CORE_ENV_VARS,
  makeOpenAiEmbedFunc,
} from "chat-core";
import { promises as fs } from "fs";
// import { makeDefaultFindContentFunc, FindContentFunc } from "chat-server";
import YAML from "yaml";
import { stripIndents } from "common-tags";

import "dotenv/config";

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};
function chatMessage<T extends ChatMessage>(t: T) {
  return t;
}

const system = (content: string) => chatMessage({ role: "system", content });
const user = (content: string) => chatMessage({ role: "user", content });
const assistant = (content: string) =>
  chatMessage({ role: "assistant", content });

// ./code2code <input code file> <output path> <transformation file>

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
    fs.readFile(inputCodeFilePath, "utf8"),
    // fs.readFile(outputFilePath, "utf8"),
    fs.readFile(transformationFilePath, "utf8"),
  ]);
  const [
    inputCodeFile,
    // outputFile,
    transformationFile,
  ] = x.map((x) => {
    if (x.status === "rejected") {
      throw x.reason;
    }
    return x.value;
  });

  console.log(`inputCodeFilePath: ${inputCodeFilePath}`, inputCodeFile);
  // console.log(`outputFilePath: ${outputFilePath}`, outputFile);
  console.log(
    `transformationFilePath: ${transformationFilePath}`,
    transformationFile
  );

  const transformation: Transformation = YAML.parse(transformationFile);
  console.log(`transformation:`, transformation);

  const {
    MONGODB_CONNECTION_URI: connectionUri,
    MONGODB_DATABASE_NAME: databaseName,
    OPENAI_API_KEY: apiKey,
    OPENAI_EMBEDDING_MODEL_VERSION: apiVersion,
    OPENAI_EMBEDDING_DEPLOYMENT: deployment,
    OPENAI_ENDPOINT: baseUrl,
  } = assertEnvVars(CORE_ENV_VARS);

  const store = makeDatabaseConnection({
    connectionUri,
    databaseName,
  });

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
  } finally {
    await store.close();
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

async function generate_example({
  // findContent,
  sourceCode,
  transformation,
}: // topic,
// generate,
{
  // findContent: FindContentFunc;
  sourceCode: string;
  transformation: Transformation;
  // generate: GenerateFunc;
}) {
  console.log(`Setting up...`);
  const generate = makeGenerateFunc();
  // const { content } = await findContent({
  //   query: `About ${topic}`,
  //   ipAddress: "::1",
  // });

  // console.log(`Found content: ${content.length}`);
  // content.sort((a, b) => b.score - a.score);
  console.log(`Analyzing code...`);
  const analyzeCodeChat = [
    system(stripIndents`
      Your task is to analyze a provided code snippet and write a succinct
      description of the code's purpose as well as its style and other
      notable choices. Limit your response to 100 words.
    `),
    user(stripIndents`
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
    system(
      `You transform source code files into new representations as described by the user.`
    ),
    user(stripIndents`
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

  // console.log(`Refining outline...`);

  // chat.push(`Improve the following outline for the online course. Ensure a clear learning path through all topics. Combine or discard modules if necessary. Limit the number of modules to 5; prefer fewer modules if possible.
  //   Outline: ${outline}`);

  // const improvedOutline = await generate(chat);

  // console.log(`Refined outline:\n\n${improvedOutline}\n`);

  // console.log(`Generating quiz sample...`);
  // chat.push(
  //   `Generate a sample quiz of 3 multiple-choice questions for the second module of this outline. Each question should include 4 options, exactly one of which must be correct.`
  // );

  // const quiz = await generate(chat);

  // console.log(`Quiz sample:\n\n${quiz}`);
}

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
    console.log("  generating 1...", messages);
    try {
      const {
        choices: [choice],
      } = await openAiClient.getChatCompletions(
        OPENAI_CHAT_COMPLETION_DEPLOYMENT,
        messages
      );
      console.log("  generating 2...");
      const { message } = choice;
      console.log("  generating 3...");
      return message?.content ?? undefined;
    } catch (err) {
      console.log("err", err);
      throw err;
    }
  };
}
