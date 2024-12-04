export type ModelDeveloper =
  | "OpenAI"
  | "Anthropic"
  | "Meta"
  | "Google"
  | "Mistral";

export type ModelProvider =
  | "radiant"
  | "braintrust"
  | "azure_openai"
  | "gcp_vertex_ai";

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
    Whether to include the system message as a user message in the model call.
    Needed for some models that don't support system messages.
    Recasts the system message as a user message with the following tags:
    ```jsx
    <System_Message>
    ${systemMessageContent}
    </System_Message>
    ```
   */
  systemMessageAsUserMessage?: boolean;

  /**
    Whether the model is officially authorized by MongoDB.
   */
  authorized?: boolean;
}

/**
  List of LLMs that are available through Radiant.
 */
export const models: ModelConfig[] = [
  {
    label: "gpt-4o",
    deployment: "gpt-4o",
    developer: "OpenAI",
    maxConcurrency: 1,
    provider: "azure_openai",
    metadata: {
      modelVersion: "2024-08-06",
      rateLimitTpm: 110000,
    },
    authorized: true,
  },
  {
    label: "gpt-4o-mini",
    deployment: "gpt-4o-mini",
    developer: "OpenAI",
    maxConcurrency: 5,
    provider: "azure_openai",
    metadata: {
      modelVersion: "2024-07-18",
      rateLimitTpm: 4070000,
    },
    authorized: true,
  },
  {
    label: "gpt-35-turbo-16k",
    deployment: "gpt-35-turbo-16k",
    developer: "OpenAI",
    maxConcurrency: 1,
    provider: "azure_openai",
    metadata: {
      rateLimitTpm: 70000,
      modelVersion: "0613",
    },
    sleepBeforeMs: 5000,
    authorized: true,
  },
  {
    label: "claude-3-sonnet",
    deployment: "anthropic.claude-3-sonnet-20240229-v1:0",
    developer: "Anthropic",
    maxConcurrency: 1,
    provider: "radiant",
    authorized: true,
  },
  {
    label: "claude-3-haiku",
    deployment: "anthropic.claude-3-haiku-20240307-v1:0",
    developer: "Anthropic",
    maxConcurrency: 3,
    provider: "radiant",
    authorized: true,
  },
  {
    label: "claude-35-sonnet",
    deployment: "anthropic.claude-3-5-sonnet-20240620-v1:0",
    developer: "Anthropic",
    maxConcurrency: 1,
    provider: "radiant",
    authorized: true,
  },
  {
    label: "llama-3-70b",
    deployment: "meta.llama3-70b-instruct-v1:0",
    developer: "Meta",
    maxConcurrency: 1,
    provider: "radiant",
    authorized: true,
  },
  {
    label: "mistral-large-2",
    deployment: "mistral.mistral-large-2402-v1:0",
    developer: "Mistral",
    maxConcurrency: 1,
    provider: "radiant",
    authorized: true,
  },
  {
    label: "llama-3.1-70b",
    deployment: "accounts/fireworks/models/llama-v3p1-70b-instruct",
    developer: "Meta",
    maxConcurrency: 1,
    provider: "braintrust",
    metadata: {
      modelHost: "Fireworks",
    },
    authorized: false,
  },
  {
    label: "llama-3.2-90b",
    deployment: "accounts/fireworks/models/llama-v3p2-90b-vision-instruct",
    developer: "Meta",
    maxConcurrency: 1,
    provider: "braintrust",
    metadata: {
      modelHost: "Fireworks",
    },
    authorized: false,
  },
  {
    label: "llama-3.1-405b",
    deployment: "accounts/fireworks/models/llama-v3p1-405b-instruct",
    developer: "Meta",
    maxConcurrency: 1,
    provider: "braintrust",
    metadata: {
      modelHost: "Fireworks",
    },
    authorized: false,
  },
  // {
  //   label: "gemini-1.5-flash-002",
  //   deployment: "google/gemini-1.5-flash-002",
  //   developer: "Google",
  //   maxConcurrency: 3,
  //   provider: "gcp_vertex_ai",
  //   systemMessageAsUserMessage: false,
  //   authorized: true,
  // },
  // {
  //   label: "gemini-1.5-pro-002",
  //   deployment: "google/gemini-1.5-pro-002",
  //   developer: "Google",
  //   provider: "gcp_vertex_ai",
  //   systemMessageAsUserMessage: false,
  //   authorized: true,
  // },
  {
    label: "gemini-1.0-pro-002",
    deployment: "google/gemini-1.0-pro-002",
    developer: "Google",
    provider: "gcp_vertex_ai",
    systemMessageAsUserMessage: false,
    authorized: true,
  },
] as const;
