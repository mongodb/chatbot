# Configuration Reference

This page contains reference documentation for the configuration options for the MongoDB Chatbot Evaluation CLI.

An Evaluation CLI config file is a CommonJS file that exports a `ConfigConstructor` function as its default export.

For an example of setting up a configuration file, refer to the [Configuration](./index.md) documentation.

To set up a configuration file, you must first install the following packages:

```bash
npm install mongodb-chatbot-evaluation
```

## API Reference

For a full API reference of all modules exported by `mongodb-chatbot-evaluation`, refer to the [API Reference](../reference/evaluation/) documentation.

This page links to the key reference documentation for configuring the Ingest CLI.

## `ConfigConstructor`

The [`ConfigConstructor`](../reference/evaluation/modules.md#configconstructor) function is the root configuration type for the Ingest CLI. This exports an [`EvalConfig`](../reference/evaluation/interfaces/EvalConfig.md) object.

## Data Stores

### `CommandMetadataStore`

The [`CommandMetadataStore`](../reference/evaluation/interfaces/CommandMetadataStore.md) is an interface to interact with MongoDB collection that tracks metadata of each command run.

To create a `CommandMetadataStore`, use the function [`makeMongoDbCommandMetadataStore()`](../reference/evaluation/modules.md#makemongodbcommandmetadatastore).

```ts
import { makeMongoDbCommandMetadataStore } from "mongodb-chatbot-evaluation";

const commandMetadataStore = makeMongoDbCommandMetadataStore({
  connectionUri: MONGODB_CONNECTION_URI,
  databaseName: MONGODB_DATABASE_NAME,
});
```

### `GeneratedDataStore`

The [`GeneratedDataStore`](../reference/evaluation/interfaces/GeneratedDataStore.md) is an interface to interact with MongoDB collection that stores generated data.

To create a `GeneratedDataStore`, use the function [`makeMongoDbGeneratedDataStore()`](../reference/evaluation/modules.md#makemongodbgenerateddatastore).

```ts
import { makeMongoDbGeneratedDataStore } from "mongodb-chatbot-evaluation";

const generatedDataStore = makeMongoDbGeneratedDataStore({
  connectionUri: MONGODB_CONNECTION_URI,
  databaseName: MONGODB_DATABASE_NAME,
});
```

### `EvaluationStore`

The [`EvaluationStore`](../reference/evaluation/interfaces/EvaluationStore.md) is an interface to interact with MongoDB collection that stores evaluation data.

To create an `EvaluationStore`, use the function [`makeMongoDbEvaluationStore()`](../reference/evaluation/modules.md#makemongodbevaluationstore).

```ts
import { makeMongoDbEvaluationStore } from "mongodb-chatbot-evaluation";

const evaluationStore = makeMongoDbEvaluationStore({
  connectionUri: MONGODB_CONNECTION_URI,
  databaseName: MONGODB_DATABASE_NAME,
});
```

### `ReportStore`

The [`ReportStore`](../reference/evaluation/interfaces/ReportStore.md) is an interface to interact with MongoDB collection that stores reports.

To create a `ReportStore`, use the function [`makeMongoDbReportStore()`](../reference/evaluation/modules.md#makemongodbreportstore).

```ts
import { makeMongoDbReportStore } from "mongodb-chatbot-evaluation";

const reportStore = makeMongoDbReportStore({
  connectionUri: MONGODB_CONNECTION_URI,
  databaseName: MONGODB_DATABASE_NAME,
});
```

## Test Cases

You must provide test cases to evaluate the chatbot. Pass the test cases to the `commands.generate` property in the `EvalConfig`.

```typescript
const testCases: ConversationTestCase[] = [
  {
    name: `It understands "why the chicken crossed the road" jokes`,
    expectation: `
      The ASSISTANT responds with a completion of the classic chicken crossing the road joke.
      The joke should be completed in a way that is both humorous and appropriate.
    `,
    tags: ["joke"],
    messages: [
      { role: "user", content: "Why did the chicken cross the road?" }
    ]
  },
];

const evalConfig: EvalConfig = {
  // ... other fields,
  commands: {
    generate: {
      myTest: {
        type: "conversation",
        // highlight-start
        testCases: testCases,
        // highlight-end
        generator: makeGenerateConversationData({ ... }),
      },
    },
    evaluate: { /* ... */ },
    report: { /* ... */ },
  },
};
```

The `mongodb-chatbot-evaluation` package includes built-in support for the [`ConversationTestCase`](../reference/evaluation/interfaces/ConversationTestCase.md) type.
You can use this to evaluate the chatbot's performance on conversation data.

### Load test cases from a file
You can load `ConversationTestCase` object from a YAML file using the [`getConversationsTestCasesFromYaml()`](../reference/evaluation/modules.md#getconversationstestcasesfromyaml) function.

```ts
import { getConversationsTestCasesFromYaml } from "mongodb-chatbot-evaluation";

const testCases = getConversationsTestCasesFromYaml("path/to/test-cases.yaml");
```

## Command Executor Functions

These functions are used to execute commands in the pipeline.
There are different functions for the different commands.

### `GenerateDataFunc`

The [`GenerateDataFunc`](../reference/evaluation/modules.md#generatedatafunc) is a function that generates data to be evaluated.

Pass a `GenerateDataFunc` to the `commands.generate` property in the `EvalConfig`.

The `mongodb-chatbot-evaluation` package includes the following `GenerateDataFunc` implementation functions:

- [`makeGenerateConversationData()`](../reference/evaluation/modules.md#makegenerateconversationdata): Generates conversation data from the test cases.
  The function calls a MongoDB Chatbot Server API to create conversations and add messages.
  This lets you evaluate the chatbot's performance on a running server to get behavior resembling how your actual app behaves.
- [`makeGenerateLlmConversationData()`](../reference/evaluation/modules.md#makegeneratellmconversationdata): Generates conversation data from the test cases.
  The function calls a [`ChatLlm`](../reference/server/interfaces/ChatLlm.md) instance to generate responses. This is useful to see how a language model without retrieval-augmented generation performs on a test case.

Example of using `makeGenerateConversationData()`:

```ts
// eval.config.ts
import { makeGenerateConversationData } from "mongodb-chatbot-evaluation";

const generateDataFunc = makeGenerateConversationData({
  conversations,
  httpHeaders: {
    Origin: "Testing",
  },
  apiBaseUrl: CONVERSATIONS_SERVER_BASE_URL,
});

export default async function configConstructor() {
  return {
    // ... other configuration options
    commands: {
      generate: {
        conversations: {
          type: "conversation",
          testCases: someTestCases,
          generator: generateDataFunc,
        },
      },
      // ... other commands
    },
  };
}
```

### `EvaluateQualityFunc`

The [`EvaluateQualityFunc`](../reference/evaluation/modules.md#evaluatequalityfunc) is a function that evaluates some quality of generated data.

Pass an `EvaluateQualityFunc` to the `commands.evaluate` property in the `EvalConfig`.

The `mongodb-chatbot-evaluation` package includes the following `EvaluateQualityFunc` implementation functions:

- [`makeEvaluateConversationQuality()`](../reference/evaluation/modules.md#makeevaluateconversationquality): Evaluates the quality of a conversation by comparing the generated response to a provided expectation.
  The function uses the OpenAI API to evaluate the quality of the responses.
- [`makeEvaluateConversationFaithfulness()`](../reference/evaluation/modules.md#makeevaluateconversationfaithfulness): Evaluates the faithfulness of a conversation by comparing the generated response to the context information retrieved before generating an answer.
- [`evaluateConversationAverageRetrievalScore()`](../reference/evaluation/modules.md#evaluateconversationaverageretrievalscore): Evaluates the average retrieval score of a conversation by comparing the generated responses to a provided expectation.

Example of using `makeEvaluateConversationQuality()`:

```ts
// eval.config.ts

import { makeEvaluateConversationQuality } from "mongodb-chatbot-evaluation";
import { OpenAIClient, AzureKeyCredential } from "@azure/openai";

const evaluateQualityFunc = makeEvaluateConversationQuality({
  deploymentName: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  openAiClient: new OpenAIClient(
    OPENAI_ENDPOINT,
    new AzureKeyCredential(OPENAI_API_KEY)
  ),
});

export default async function configConstructor() {
  return {
    // ... other configuration options
    commands: {
      evaluate: {
        conversationQuality: {
          evaluator: evaluateQualityFunc,
        },
      },
      // ... other commands
    },
  };
}
```

### `ReportEvalFunc`

The [`ReportEvalFunc`](../reference/evaluation/modules.md#reportevalfunc) is a function that generates a report from the evaluation data.

Pass a `ReportEvalFunc` to the `commands.report` property in the `EvalConfig`.

The `mongodb-chatbot-evaluation` package includes the following `ReportEvalFunc` implementation functions:

- [`reportStatsForBinaryEvalRun()`](../reference/evaluation/modules.md#reportstatsforbinaryevalrun): Generates a report for a binary evaluation run, one that has results of either `0` or `1`.
- [`reportAverageScore()`](../reference/evaluation/modules.md#reportaveragescore): Generates a report for the average score of a set of evaluation data.

Example of using `reportStatsForBinaryEvalRun()`:

```ts
// eval.config.ts

import { reportStatsForBinaryEvalRun } from "mongodb-chatbot-evaluation";

export default async function configConstructor() {
  return {
    // ... other configuration options
    commands: {
      // ... other commands
      report: {
        binaryEvalRun: {
          reporter: reportStatsForBinaryEvalRun,
        },
      },
    },
  };
}
```
