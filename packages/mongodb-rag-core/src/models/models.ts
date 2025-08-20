export type ModelDeveloper =
  | "OpenAI"
  | "Anthropic"
  | "Meta"
  | "Google"
  | "Mistral"
  | "Amazon"
  | "DeepSeek"
  | "Alibaba Cloud";

export type ModelProvider = "braintrust";

export interface ModelConfig {
  /**
    Human-friendly name of model. Used for reporting/analysis.
   */
  label: string;

  /**
    Name of model deployment. Used to call model.
   */
  deployment: string;

  /**
    Where model is hosted. Used to call model.
   */
  provider: ModelProvider;

  /**
    Developer of the model. Used for reporting/analysis.
   */
  developer: ModelDeveloper;

  /**
    Max number of requests to model to execute concurrently.
    Useful to set here because of rate limits on some models.
   */
  maxConcurrency?: number;

  /**
    Amount of miliseconds to wait before calling the execution task.
    Useful to set for models with low rate limits to slow down execution.
   */
  sleepBeforeMs?: number;

  /**
    Arbitrary metadata about the model. Used for reporting/analysis.
   */
  metadata?: Record<string, unknown>;

  /**
    Whether the model is officially authorized by MongoDB.
   */
  authorized?: boolean;

  /**
    Parent model of the model. Used for reporting/analysis.
   */
  parent?: string;

  /**
    Generation of the model. Used for reporting/analysis.
   */
  generation?: string;

  /**
    If this is a 'reasoning model' that generates tokens before final response.
   */
  reasoning?: boolean;
}

/**
  List of available LLMs, both officially sanctioned by MongoDB
  and not-officially authorized for internal use.

  General rules of thumb on authorization:

  1. The hyperscalers are authorized (AWS, GCP, Azure)
  2. Assume all other model providers are unauthorized unless you explicitly know otherwise.

  Available models can be found at https://www.braintrust.dev/docs/guides/proxy#list-of-supported-models-and-providers
  Select Azure, Vertex, Amazon Bedrock, Anthropic. Choose Amazon Bedrock over Anthropic when possible.

 */
const allModels = [
  {
    label: "gpt-4o",
    deployment: "gpt-4o",
    developer: "OpenAI",
    maxConcurrency: 10,
    provider: "braintrust",
    metadata: {
      modelVersion: "2024-08-06",
      rateLimitTpm: 110000,
    },
    authorized: true,
    generation: "gpt-4o",
  },
  {
    label: "gpt-4o-mini",
    deployment: "gpt-4o-mini",
    developer: "OpenAI",
    maxConcurrency: 30,
    provider: "braintrust",
    metadata: {
      modelVersion: "2024-07-18",
      rateLimitTpm: 4070000,
    },
    authorized: true,
    generation: "gpt-4o",
  },
  {
    label: "o3-mini",
    deployment: "o3-mini",
    developer: "OpenAI",
    provider: "braintrust",
    authorized: true,
    maxConcurrency: 10,
    parent: "o1-mini",
    generation: "o3",
    reasoning: true,
  },
  {
    label: "o3",
    deployment: "o3",
    developer: "OpenAI",
    provider: "braintrust",
    authorized: true,
    maxConcurrency: 15,
    parent: "o1",
    generation: "o3",
    reasoning: true,
  },
  {
    label: "o4-mini",
    deployment: "o4-mini",
    developer: "OpenAI",
    provider: "braintrust",
    authorized: true,
    maxConcurrency: 15,
    parent: "o3-mini",
    generation: "o4",
    reasoning: true,
  },
  {
    label: "gpt-4.1",
    deployment: "gpt-4.1",
    developer: "OpenAI",
    provider: "braintrust",
    authorized: true,
    maxConcurrency: 20,
    parent: "gpt-4o",
    generation: "gpt-4.1",
  },
  {
    label: "gpt-4.1-mini",
    deployment: "gpt-4.1-mini",
    developer: "OpenAI",
    provider: "braintrust",
    authorized: true,
    maxConcurrency: 25,
    parent: "gpt-4o-mini",
    generation: "gpt-4.1",
  },
  {
    label: "gpt-4.1-nano",
    deployment: "gpt-4.1-nano",
    developer: "OpenAI",
    provider: "braintrust",
    authorized: true,
    maxConcurrency: 25,
    generation: "gpt-4.1",
  },
  {
    label: "gpt-5",
    deployment: "gpt-5",
    developer: "OpenAI",
    provider: "braintrust",
    authorized: true,
    maxConcurrency: 20,
    parent: "gpt-4.1",
    generation: "gpt-5",
  },
  {
    label: "gpt-5-mini",
    deployment: "gpt-5-mini",
    developer: "OpenAI",
    provider: "braintrust",
    authorized: true,
    maxConcurrency: 25,
    parent: "gpt-4.1-mini",
    generation: "gpt-5",
  },
  {
    label: "gpt-5-nano",
    deployment: "gpt-5-nano",
    developer: "OpenAI",
    provider: "braintrust",
    authorized: true,
    maxConcurrency: 25,
    parent: "gpt-4.1-nano",
    generation: "gpt-5",
  },
  {
    label: "claude-3-sonnet",
    deployment: "us.anthropic.claude-3-sonnet-20240229-v1:0",
    developer: "Anthropic",
    maxConcurrency: 1,
    provider: "braintrust",
    authorized: true,
    generation: "claude-3",
  },
  {
    label: "claude-3-haiku",
    deployment: "us.anthropic.claude-3-haiku-20240307-v1:0",
    developer: "Anthropic",
    maxConcurrency: 3,
    provider: "braintrust",
    authorized: true,
    generation: "claude-3",
  },
  {
    label: "claude-35-sonnet",
    deployment: "us.anthropic.claude-3-5-sonnet-20240620-v1:0",
    developer: "Anthropic",
    maxConcurrency: 10,
    provider: "braintrust",
    authorized: true,
    parent: "claude-3-sonnet",
    generation: "claude-3",
  },
  {
    label: "claude-35-sonnet-v2",
    deployment: "us.anthropic.claude-3-5-sonnet-20241022-v2:0",
    developer: "Anthropic",
    maxConcurrency: 10,
    provider: "braintrust",
    authorized: true,
    parent: "claude-35-sonnet",
    generation: "claude-3",
  },
  {
    label: "claude-37-sonnet",
    deployment: "us.anthropic.claude-3-7-sonnet-20250219-v1:0",
    developer: "Anthropic",
    maxConcurrency: 10,
    provider: "braintrust",
    authorized: true,
    parent: "claude-35-sonnet-v2",
    generation: "claude-3",
  },
  {
    label: "claude-35-haiku",
    deployment: "us.anthropic.claude-3-5-haiku-20241022-v1:0",
    developer: "Anthropic",
    maxConcurrency: 10,
    provider: "braintrust",
    authorized: true,
    parent: "claude-3-haiku",
    generation: "claude-3",
  },
  {
    label: "claude-sonnet-4",
    deployment: "us.anthropic.claude-sonnet-4-20250514-v1:0",
    provider: "braintrust",
    developer: "Anthropic",
    maxConcurrency: 5,
    authorized: true,
    generation: "claude-4",
    parent: "claude-37-sonnet",
  },
  {
    label: "claude-opus-4",
    deployment: "us.anthropic.claude-opus-4-20250514-v1:0",
    provider: "braintrust",
    developer: "Anthropic",
    maxConcurrency: 5,
    authorized: true,
    generation: "claude-4",
  },
  {
    label: "anthropic/claude-opus-4.1",
    deployment: "claude-opus-4-1-20250805",
    provider: "braintrust",
    developer: "Anthropic",
    maxConcurrency: 5,
    authorized: true,
    parent: "claude-opus-4",
    generation: "claude-4",
  },
  {
    label: "anthropic/claude-sonnet-4",
    deployment: "claude-sonnet-4-20250514",
    provider: "braintrust",
    developer: "Anthropic",
    maxConcurrency: 5,
    authorized: true,
    parent: "claude-37-sonnet",
    generation: "claude-4",
  },
  {
    label: "anthropic/claude-opus-4",
    deployment: "claude-opus-4-20250514",
    provider: "braintrust",
    developer: "Anthropic",
    maxConcurrency: 5,
    authorized: true,
    generation: "claude-4",
  },
  {
    label: "llama-3-70b",
    deployment: "meta.llama3-70b-instruct-v1:0",
    developer: "Meta",
    maxConcurrency: 3,
    provider: "braintrust",
    authorized: true,
    generation: "llama-3",
  },
  {
    label: "mistral-large-2",
    deployment: "mistral.mistral-large-2402-v1:0",
    developer: "Mistral",
    maxConcurrency: 1,
    provider: "braintrust",
    authorized: true,
  },
  {
    label: "llama-3.1-70b",
    deployment: "us.meta.llama3-1-70b-instruct-v1:0",
    developer: "Meta",
    maxConcurrency: 5,
    provider: "braintrust",
    authorized: true,
    parent: "llama-3-70b",
    generation: "llama-3",
  },
  {
    label: "llama-3.2-90b",
    deployment: "us.meta.llama3-2-90b-instruct-v1:0",
    developer: "Meta",
    maxConcurrency: 5,
    provider: "braintrust",
    authorized: true,
    parent: "llama-3.1-70b",
    generation: "llama-3",
  },
  {
    label: "llama-3.3-70b",
    deployment: "us.meta.llama3-3-70b-instruct-v1:0",
    developer: "Meta",
    maxConcurrency: 5,
    provider: "braintrust",
    authorized: true,
    parent: "llama-3.2-90b",
    generation: "llama-3",
  },
  {
    label: "nova-lite-v1:0",
    deployment: "amazon.nova-lite-v1:0",
    developer: "Amazon",
    provider: "braintrust",
    maxConcurrency: 5,
    authorized: true,
    generation: "nova-1",
  },
  {
    label: "nova-micro-v1:0",
    deployment: "amazon.nova-micro-v1:0",
    developer: "Amazon",
    provider: "braintrust",
    maxConcurrency: 20,
    authorized: true,
    generation: "nova-1",
  },
  {
    label: "nova-pro-v1:0",
    deployment: "amazon.nova-pro-v1:0",
    developer: "Amazon",
    provider: "braintrust",
    authorized: true,
    maxConcurrency: 30,
    generation: "nova-1",
  },
  {
    label: "gemini-2-flash",
    deployment: "publishers/google/models/gemini-2.0-flash-001",
    developer: "Google",
    maxConcurrency: 10,
    provider: "braintrust",
    authorized: true,
    parent: "gemini-1.5-flash-002",
    generation: "gemini-2",
  },

  {
    label: "gemini-2.0-flash-lite-001",
    deployment: "publishers/google/models/gemini-2.0-flash-lite-001",
    developer: "Google",
    maxConcurrency: 10,
    provider: "braintrust",
    authorized: true,
    generation: "gemini-2",
  },

  {
    label: "gemini-2.5-pro",
    deployment: "publishers/google/models/gemini-2.5-pro",
    developer: "Google",
    maxConcurrency: 5,
    provider: "braintrust",
    authorized: true,
    parent: "gemini-1.5-pro-002",
    generation: "gemini-2",
    reasoning: true,
  },
  {
    label: "gemini-2.5-flash",
    deployment: "publishers/google/models/gemini-2.5-flash",
    developer: "Google",
    maxConcurrency: 5,
    provider: "braintrust",
    authorized: true,
    parent: "gemini-2-flash",
    generation: "gemini-2",
    reasoning: true,
  },
  {
    label: "gemini-2.5-flash-lite",
    deployment: "publishers/google/models/gemini-2.5-flash-lite",
    developer: "Google",
    maxConcurrency: 5,
    provider: "braintrust",
    authorized: true,
    parent: "gemini-2.0-flash-lite-001",
    generation: "gemini-2",
    reasoning: true,
  },
] as const satisfies ModelConfig[];

export const models = allModels.filter((m) => m.authorized);

/**
  These models aren't officially authorized to be used.
  NEVER use on sensitive information.
 */
export const __unauthorizedModels__ = allModels.filter((m) => !m.authorized);
