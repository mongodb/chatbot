# Pipelines

You can use pipelines to run a series of commands together.
This is useful for automating evaluation tasks.

You can also use pipelines to run multiple commands in sequence in a CI environment.
For example, you might want to run a pipeline of commands every day.

## Run Pipelines

You can run pipelines with the [`runPipeline()`](../reference/evaluation/modules.md#runpipeline) function.

`runPipeline()` takes the following arguments:

- `configConstructor`: A [`ConfigConstructor`](../reference/evaluation/modules.md#configconstructor) function that returns a configuration object.
- `pipeline`: A [`Pipeline`](../reference/evaluation/modules.md#pipeline) function that defines the pipeline based on actions in the configuration.

Example `runPipeline()` function call with its `ConfigConstructor` and `Pipeline`:

```ts
// somePipeLine.ts
import {
  runPipeline,
  ConfigConstructor,
  EvalConfig,
  makeMongoDbCommandMetadataStore,
  makeMongoDbGeneratedDataStore,
  makeGenerateConversationData,
  makeEvaluateConversationQuality,
  makeMongoDbEvaluationStore,
  makeMongoDbReportStore,
  mongodbResponseQualityExamples,
  reportStatsForBinaryEvalRun,
  makeEvaluateConversationFaithfulness,
} from "mongodb-chatbot-evaluation";

const configConstructor: ConfigConstructor = async () => {
  // ... set up the configuration

  return {
    metadataStore: makeMongoDbCommandMetadataStore(storeDbOptions),
    generatedDataStore: makeMongoDbGeneratedDataStore(storeDbOptions),
    evaluationStore: makeMongoDbEvaluationStore(storeDbOptions),
    reportStore: makeMongoDbReportStore(storeDbOptions),

    commands: {
      generate: {
        conversations: {
          type: "conversation",
          testCases: allTestCases,
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
        conversationFaithfulness: {
          evaluator: makeEvaluateConversationFaithfulness({
            llamaIndexLlm: llamaIndexEvaluationLlm,
          }),
        },
      },
      report: {
        conversationQualityRun: {
          reporter: reportStatsForBinaryEvalRun,
        },
        conversationFaithfulnessRun: {
          reporter: reportStatsForBinaryEvalRun,
        },
      },
    },
  } satisfies EvalConfig;
};

runPipeline({
  configConstructor,
  pipeline: async (generate, evaluate, report) => {
    // Generate data for evaluation
    const { _id: genRunId } = await generate("conversations");

    // Evaluate and report on the generated data
    const { _id: qualityEvalRunId } = await evaluate(
      "conversationQuality",
      genRunId
    );
    await report("conversationQualityRun", qualityEvalRunId);

    // Another evaluation and report on the generated data
    const { _id: faithfulnessEvalRunId } = await evaluate(
      "conversationFaithfulness",
      genRunId
    );
    await report("conversationFaithfulnessRun", faithfulnessEvalRunId);
  },
});
```

## Examples

- [MongoDB AI chatbot evaluation pipelines](https://github.com/mongodb/chatbot/tree/main/packages/chatbot-eval-mongodb-public/src/pipelines)
