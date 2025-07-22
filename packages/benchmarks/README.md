# Benchmarking Suite

This project contains benchmarks on how well models perform on MongoDB-related tasks.

## Build the Config

Be sure to build `mongodb-rag-core`, `mongodb-chatbot-server`, and `mongodb-chatbot-eval` first.

```sh
npm i
npm run build
```

# Run the Benchmarks

Choose which models to run the benchmarks for by updating `MODELS` in `src/benchmarkModels.ts`. 

To run the benchmarks, use the CLI:

```sh
# Get started
npm run benchmark -- --help

# List available benchmarks
npm run benchmark -- list

# List available models
npm run benchmark -- models list

# Run a benchmark
npm run benchmark -- run --type nl_prompt_response --model gpt-4.1-nano --dataset top_questions
```

## Run Legacy Benchmarks

Going forward, all actively maintained benchmarks will be supported by the CLI. There are also some legacy benchmarks that will not be supported by the CLI. All of these are in the `src/textToDriver/bin` directory. They include:

- NL-to-Node.js Driver Benchmark (`src/textToDriver/bin/nodeJsDriverBenchmark.ts`), produced Fall 2024
- Many-flavored NL-to-Mongosh Benchmark (`src/textToDriver/bin/mongoshBenchmarks/`), produced Spring 2025. 
  - We will still actively support a subset of these benchmarks via the CLI.

To run these benchmarks, execute the file directly, such as via:

```sh
npx tsx src/textToDriver/bin/nodeJsDriverBenchmark.ts
```

