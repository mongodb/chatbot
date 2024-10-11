export type ModelDeveloper =
  | "OpenAI"
  | "Anthropic"
  | "Meta"
  | "Google"
  | "Mistral";

/**
  List of LLMs that are available through Radiant.
 */
export const radiantModels: {
  /**
    Human-friendly name of model. Used for reporting/analysis.
   */
  label: string;

  /**
    Name of deployment in Radiant. Used to call model.
   */
  radiantModelDeployment: string;

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
}[] = [
  // {
  //   label: "gpt-35-turbo",
  //   radiantModelDeployment: "gpt-35-turbo-16k",
  //   developer: "OpenAI",
  //   maxConcurrency: 1,
  // },
  // {
  //   label: "gpt-4",
  //   radiantModelDeployment: "gpt-4-eai-experimentation",
  //   developer: "OpenAI",
  //   maxConcurrency: 1,
  // },
  // {
  //   label: "gpt-4o",
  //   radiantModelDeployment: "gpt-4o-eai-experimentation",
  //   developer: "OpenAI",
  //   maxConcurrency: 1,
  // },
  {
    label: "gpt-4o-mini",
    radiantModelDeployment: "gpt-4o-mini",
    developer: "OpenAI",
    maxConcurrency: 1,
  },
  // {
  //   label: "claude-3-sonnet",
  //   radiantModelDeployment: "anthropic.claude-3-sonnet-20240229-v1:0",
  //   developer: "Anthropic",
  //   maxConcurrency: 1,
  // },
  {
    label: "claude-3-haiku",
    radiantModelDeployment: "anthropic.claude-3-haiku-20240307-v1:0",
    developer: "Anthropic",
    maxConcurrency: 1,
    sleepBeforeMs: 500,
  },
  // {
  //   label: "claude-35-sonnet",
  //   radiantModelDeployment: "anthropic.claude-3-5-sonnet-20240620-v1:0",
  //   developer: "Anthropic",
  //   maxConcurrency: 1,
  // },
  // {
  //   label: "llama-3-70b",
  //   radiantModelDeployment: "meta.llama3-70b-instruct-v1:0",
  //   developer: "Meta",
  //   maxConcurrency: 1,
  // },
  // {
  //   label: "gemini-1.5-pro-preview",
  //   radiantModelDeployment: "gemini-1.5-pro-preview-0409",
  //   developer: "Google",
  //   maxConcurrency: 1,
  // },
  // {
  //   label: "gemini-1.0-pro",
  //   radiantModelDeployment: "gemini-1.0-pro-001",
  //   developer: "Google",
  //   maxConcurrency: 1,
  // },
  // {
  //   label: "gemini-1.0-pro-vision",
  //   radiantModelDeployment: "gemini-1.0-pro-vision-001",
  //   developer: "Google",
  //   maxConcurrency: 1,
  // },
  // {
  //   label: "mistral-large-2",
  //   radiantModelDeployment: "mistral.mistral-large-2402-v1:0",
  //   developer: "Mistral",
  //   maxConcurrency: 1,
  // },
];
