# Mercury Evaluation System Refactoring

## Overview

The evaluation system has been refactored to separate core evaluation logic from infrastructure concerns like database operations, file I/O, and batch processing. This makes the evaluation logic reusable across different scripts and contexts.

## Architecture

### Core Module: `evaluationCore.ts`

The core evaluation logic is now contained in `evaluationCore.ts`, which provides:

- **Pure evaluation functions** that take prompts and models and return results
- **Clean separation** of business logic from infrastructure
- **Type-safe interfaces** for all evaluation operations
- **Flexible configuration** system
- **Error handling** with structured error types

### LLM Evaluation: `evaluateLlms.ts`

To evaluate base models from a provider, configure the list of models you want to run in `models.ts` and then run `evaluateLlms.ts`.

<!-- #### Key Functions

```typescript
// Evaluate a single prompt-model pair
evaluatePromptWithModel(task: EvaluationTask, config: EvaluationConfig): Promise<EvaluationOutcome>

// Evaluate multiple prompt-model pairs with concurrency control
evaluatePromptModelPairs(tasks: EvaluationTask[], config: EvaluationConfig, options?: {...}): Promise<{results, errors}>

// Create evaluation configuration
createEvaluationConfig(settings: {...}): EvaluationConfig
```

#### Types

```typescript
interface EvaluationTask {
  prompt: MercuryPrompt;
  model: ModelConfig;
}

interface EvaluationConfig {
  inferenceClient: OpenAI;
  scoringClient: OpenAI;
  judgmentModel: ModelConfig;
  braintrust: { endpoint: string; apiKey: string; };
}
```

### Refactored Main Script: `evaluateLlms.ts`

The main evaluation script now focuses on:

- **Database operations** (fetching prompts, storing results)
- **Batch processing** and orchestration
- **File output** generation
- **Progress logging** and monitoring
- **Environment configuration**

## Usage Examples

### 1. Using the Core Module Directly

```typescript
import { evaluatePromptModelPairs, createEvaluationConfig } from './evaluationCore';
import { getModel } from './models';

const config = createEvaluationConfig({
  braintrustProxyEndpoint: process.env.BRAINTRUST_PROXY_ENDPOINT!,
  braintrustApiKey: process.env.BRAINTRUST_API_KEY!,
  judgmentModel: getModel("gpt-4.1"),
});

const tasks = [
  { prompt: myPrompt, model: getModel("gpt-4o") },
  { prompt: myPrompt, model: getModel("claude-35-sonnet") },
];

const { results, errors } = await evaluatePromptModelPairs(tasks, config);
```

### 2. Custom Evaluation Scripts

See `examples/customEvaluation.ts` for complete examples of:

- **A/B testing** different models
- **Quick single-prompt** evaluations
- **Comparative analysis** across models
- **Custom progress tracking**

### 3. Database-Driven Evaluation

The original `evaluateLlms.ts` script shows how to:

- Fetch prompts from MongoDB
- Determine which evaluations to run
- Process in batches
- Store results back to database
- Generate output files

## Benefits of the Refactoring

### ✅ Reusability

- Core logic can be used in multiple scripts
- No database dependency for the core functions
- Flexible configuration system

### ✅ Testability

- Pure functions are easier to test
- Mocked dependencies are isolated
- Unit tests for core logic separate from integration tests

### ✅ Maintainability

- Clear separation of concerns
- Type-safe interfaces
- Structured error handling
- Comprehensive documentation

### ✅ Flexibility

- Custom evaluation scenarios
- Different data sources
- Varied output formats
- Progress tracking options

## Files Created/Modified

### New Files

- `evaluationCore.ts` - Core evaluation logic
- `evaluationCore.test.ts` - Unit tests for core functions
- `evaluationCore.integration.test.ts` - Integration tests
- `examples/customEvaluation.ts` - Usage examples
- `README.md` - This documentation

### Modified Files

- `evaluateLlms.ts` - Refactored to use core module

## Testing

```bash
# Run unit tests for core logic
npm test -- --testPathPattern=evaluationCore.test.ts

# Run integration tests
npm test -- --testPathPattern=evaluationCore.integration.test.ts

# Run the main evaluation script
npx ts-node src/mercury/evaluateLlms.ts
```

## Migration Guide

### Before (Old Pattern)

```typescript
// All logic mixed together in main script
async function main() {
  // Database setup
  // Fetch prompts
  // Generate responses (mixed with batch logic)
  // Score responses (mixed with error handling)
  // Store results
  // Create outputs
}
```

### After (New Pattern)

```typescript
// Core logic separated and reusable
const tasks = await getEvaluationTasks(); // Infrastructure
const config = createEvaluationConfig(settings); // Core
const { results, errors } = await evaluatePromptModelPairs(tasks, config); // Core
await storeResults(results); // Infrastructure
createOutputFiles(results, errors); // Infrastructure
```

## Future Enhancements

The refactored architecture makes it easy to add:

- **Different scoring methods** (just swap the scorer function)
- **Alternative model providers** (configure different clients)
- **Custom progress tracking** (use the onProgress callback)
- **Different data sources** (create tasks from any source)
- **Caching mechanisms** (wrap the core functions)
- **Parallel processing** (already built-in with concurrency control)

This refactoring provides a solid foundation for building more evaluation tools while maintaining the existing functionality of the original script. -->
