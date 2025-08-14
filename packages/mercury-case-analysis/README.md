# mercury-case-analysis

Server-side library for analyzing technical Q&A cases (prompt + expected response).

Outputs include:
- Relevance metrics comparing the original prompt to prompts generated from the expected response
- Quality ratings for the prompt/response pair
- Optional suggested rewrites

## Install

```bash
npm install mercury-case-analysis
```

Requires Node 18+.

## Quick start

```ts
import { makeAnalyzeCases } from "mercury-case-analysis";
import { createOpenAI, wrapLanguageModel } from "mongodb-rag-core/aiSdk";
import { BraintrustMiddleware } from "mongodb-rag-core/braintrust";

const {
  BRAINTRUST_API_KEY,
  BRAINTRUST_PROXY_ENDPOINT,
  OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT,
  MERCURY_GENERATOR_MODEL_NAME,
  MERCURY_JUDGEMENT_MODEL_NAME,
} = process.env as Record<string, string>;

const embeddingModels = [
  createOpenAI({
    apiKey: BRAINTRUST_API_KEY,
    baseURL: BRAINTRUST_PROXY_ENDPOINT,
  }).textEmbeddingModel(OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT),
];

const generatorModel = wrapLanguageModel({
  model: createOpenAI({
    apiKey: BRAINTRUST_API_KEY,
    baseURL: BRAINTRUST_PROXY_ENDPOINT,
  }).chat(MERCURY_GENERATOR_MODEL_NAME),
  middleware: [BraintrustMiddleware({ debug: true })],
});

const judgementModel = wrapLanguageModel({
  model: createOpenAI({
    apiKey: BRAINTRUST_API_KEY,
    baseURL: BRAINTRUST_PROXY_ENDPOINT,
  }).chat(MERCURY_JUDGEMENT_MODEL_NAME),
  middleware: [BraintrustMiddleware({ debug: true })],
});

const analyzeCases = makeAnalyzeCases({
  embeddingModels,
  generatorModel,
  judgementModel,
});

const results = await analyzeCases({
  cases: [
    {
      prompt: "How do I paginate MongoDB results?",
      response: "Use seek-based pagination with a stable indexed sort key (e.g., _id).",
    },
  ],
});

console.log(results[0].relevance);
console.log(results[0].quality);
```

## API

- `makeAnalyzeCases({ embeddingModels, generatorModel, judgementModel, ratingStyleGuide? })`
- `promptResponseRatingSchema`, `relevanceSchema` (Zod schemas)
- `suggestRewrite({ generatorModel, prompt, response, guidance })`

Server-only. For a full example in this repo, see `packages/scripts/src/main/assessCasesMain.ts`.
