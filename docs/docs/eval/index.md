# Evaluation CLI

The MongoDB Chatbot Framework comes with an Evaluation CLI that allows you
to evaluate the performance of your chatbot and its components.

Evaluation is important to ensure that the chatbot is providing accurate and relevant responses to user queries.
It also helps you measure the effect of changes to the chatbot's components
as you develop your application.

The CLI evaluates the chatbot's performance by comparing the chatbot's responses to a set of questions with the expected answers.

## How It Works

The Evaluation CLI works by running a series of commands that generate, evaluate, and report on the performance of your chatbot.

TODO:...

## Install

To install the Evaluation CLI, run the following command:

```bash
npm i mongodb-chatbot-eval mongodb-chatbot-server
```

## Create a Configuration File

The MongoDB Evaluation CLI uses a [CommonJS](https://en.wikipedia.org/wiki/CommonJS)
JavaScript configuration file to determine how to evaluate content.

Every configuration file must export a [`ConfigConstructor`](../reference/eval/modules.md#configconstructor) object as its default export.

You must either:

- Pass the path to a configuration file to every command with the `--config` flag.
- Put a CommonJS file named `eval.config.js` in the root of your project.

For example, to run the `generate` command with a configuration file called `my-eval.config.js` and generation called `my-conversations`, run the following command:

```bash
eval generate --config my-eval.config.js --name my-conversations
```

## Define Configuration Files with TypeScript

:::important[Use TypeScript Configuration Files!]

We **strongly** recommend using TypeScript configuration files.
The typing system helps you ensure that your configuration is valid.

:::

You can use TypeScript to make your configuration file. This allows you to use
the type system to ensure that your configuration is valid.

You must compile your configuration file to **CommmonJS** before running the CLI.
The CLI only accepts CommonJS configuration files.

You can build your CommonJS configuration file with `tsc`:

```bash
tsc --module commonjs --target es2017 --outDir build eval.config.ts
```

Then run the Evaluation CLI with the compiled configuration file:

```bash
eval generate --config build/eval.config.js --name my-conversations
```

## Example Configuration

Here's a simple example configuration file for the Evaluation CLI.
You can use this configuration file as a starting point for your own configuration.

Example configuration file:

```ts
// eval.config.ts

import {
  EvalConfig,
  makeMongoDbCommandMetadataStore,
  makeMongoDbGeneratedDataStore,
  makeGenerateConversationData,
  getConversationsTestCasesFromYaml,
  makeEvaluateConversationQuality,
  makeMongoDbEvaluationStore,
  makeMongoDbReportStore,
  mongodbResponseQualityExamples,
} from "mongodb-chatbot-eval";
import { makeMongoDbConversationsService } from "mongodb-chatbot-server";
import "dotenv/config";
import fs from "fs";
import path from "path";
import { MongoClient } from "mongodb";
import { envVars } from "./envVars";
import { strict as assert } from "assert";

const {
  MONGODB_DATABASE_NAME,
  MONGODB_CONNECTION_URI,
  CONVERSATIONS_SERVER_BASE_URL,
  OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  OPENAI_ENDPOINT,
  OPENAI_API_KEY,
} = process.env;
assert(MONGODB_DATABASE_NAME, "MONGODB_DATABASE_NAME is required");
assert(MONGODB_CONNECTION_URI, "MONGODB_CONNECTION_URI is required");
assert(
  CONVERSATIONS_SERVER_BASE_URL,
  "CONVERSATIONS_SERVER_BASE_URL is required"
);
assert(
  OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  "OPENAI_CHAT_COMPLETION_DEPLOYMENT is required"
);
assert(OPENAI_ENDPOINT, "OPENAI_ENDPOINT is required");
assert(OPENAI_API_KEY, "OPENAI_API_KEY is required");

export default async () => {
  const { OpenAIClient, AzureKeyCredential } = await import("@azure/openai");
  const testCases = getConversationsTestCasesFromYaml(
    fs.readFileSync(
      path.resolve(__dirname, "..", "testCases", "conversations.yml"),
      "utf8"
    )
  );
  const storeDbOptions = {
    connectionUri: MONGODB_CONNECTION_URI,
    databaseName: MONGODB_DATABASE_NAME,
  };

  const mongodb = new MongoClient(MONGODB_CONNECTION_URI);
  await mongodb.connect();

  const db = mongodb.db(MONGODB_DATABASE_NAME);
  const conversations = makeMongoDbConversationsService(db);

  const evalConfig = {
    metadataStore: makeMongoDbCommandMetadataStore(storeDbOptions),
    generatedDataStore: makeMongoDbGeneratedDataStore(storeDbOptions),
    evaluationStore: makeMongoDbEvaluationStore(storeDbOptions),
    reportStore: makeMongoDbReportStore(storeDbOptions),

    commands: {
      generate: {
        conversations: {
          type: "conversation",
          testCases,
          generator: makeGenerateConversationData({
            conversations,
            httpHeaders: {
              Origin: "Testing",
            },
            apiBaseUrl: CONVERSATIONS_SERVER_BASE_URL,
          }),
        },
      },
      evaluate: {
        conversationQuality: {
          evaluator: makeEvaluateConversationQuality({
            deploymentName: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
            openAiClient: new OpenAIClient(
              OPENAI_ENDPOINT,
              new AzureKeyCredential(OPENAI_API_KEY)
            ),
            fewShotExamples: mongodbResponseQualityExamples,
          }),
        },
      },
    },
    async afterAll() {
      await mongodb.close();
    },
  } satisfies EvalConfig;
  return evalConfig;
};
```

## Configuration Reference

For complete reference documentation, refer to the [Configuration Reference](./configuration-reference.md) documentation.

## Additional Example Configurations

For additional example configurations, check out the following projects:

- [MongoDB documentation eval](https://github.com/mongodb/chatbot/blob/main/packages/chatbot-eval-mongodb-public/src/eval.config.ts): Evaluations for the MongoDB AI chatbot.
