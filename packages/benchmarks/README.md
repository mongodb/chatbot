# Benchmarking Suite

This project contains benchmarks on how well models perform on MongoDB-related tasks.

## Building the Config

Be sure to build `mongodb-rag-core`, `mongodb-chatbot-server`, and `mongodb-chatbot-eval` first.

```sh
npm i
npm run build
```

# Running the Benchmarks

Choose which models to run the benchmarks for by updating `MODELS` in `src/benchmarkModels.ts`. 

To run the benchmarks:

* Discovery: `npx tsx src/discovery/mongoDbDiscoveryBenchmark.ts`
* Top Questions Prompt Completion: `npx tsx src/nlPromptResponse/bin/topQuestions/topQuestionPromptCompletionBenchmark.ts`
* Multiple Choice Quiz Questions: `npx tsx src/quizQuestions/mongodbUniversityAllQuestionBenchmark.ts`
* Natural Language to Mongosh: Under src/textToDriver/bin/mongoshBenchmarks, run all of the following:
    * agentic.ts 
    * promptCompletionAllVersions.ts 
    * toolCallAllVersions.ts 
