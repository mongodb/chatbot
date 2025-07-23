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

To run the benchmarks, use the CLI:

```sh
# Get started
npm run benchmark:cli -- --help

# Run a benchmark
npm run benchmark:cli -- run --type nl_prompt_response --model gpt-4.1-nano --dataset top_questions
```
