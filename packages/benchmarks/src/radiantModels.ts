export type ModelDeveloper = "OpenAI" | "Anthropic" | "Meta" | "Google";

/**
  @fileoverview This file contains the list of LLMs that are available through Radiant.
 */
export const radiantModels: {
  label: string;
  radiantModelDeployment: string;
  developer: ModelDeveloper;
}[] = [
  {
    label: "gpt-35-turbo",
    radiantModelDeployment: "gpt-35-turbo-eai-experimentation",
    developer: "OpenAI",
  },
  {
    label: "gpt-4",
    radiantModelDeployment: "gpt-4-eai-experimentation",
    developer: "OpenAI",
  },
  {
    label: "gpt-4o",
    radiantModelDeployment: "gpt-4o-eai-experimentation",
    developer: "OpenAI",
  },
  {
    label: "claude-3-sonnet",
    radiantModelDeployment: "anthropic.claude-3-sonnet-20240229-v1:0",
    developer: "Anthropic",
  },
  {
    label: "claude-3-haiku",
    radiantModelDeployment: "anthropic.claude-3-haiku-20240307-v1:0",
    developer: "Anthropic",
  },
  {
    label: "claude-35-sonnet",
    radiantModelDeployment: "anthropic.claude-3-5-sonnet-20240620-v1:0",
    developer: "Anthropic",
  },
  {
    label: "llama-3-70b",
    radiantModelDeployment: "meta.llama3-70b-instruct-v1:0",
    developer: "Meta",
  },
  {
    label: "gemini-1.5-pro-preview",
    radiantModelDeployment: "gemini-1.5-pro-preview-0409",
    developer: "Google",
  },
  {
    label: "gemini-1.0-pro",
    radiantModelDeployment: "gemini-1.0-pro-001",
    developer: "Google",
  },
  {
    label: "gemini-1.0-pro-vision",
    radiantModelDeployment: "gemini-1.0-pro-vision-001",
    developer: "Google",
  },
];
