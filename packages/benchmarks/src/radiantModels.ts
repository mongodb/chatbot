/**
  @fileoverview This file contains the list of LLMs that are available through Radiant.
 */
export const radiantModels: {
  label: string;
  radiantModelDeployment: string;
}[] = [
  {
    label: "gpt-35-turbo",
    radiantModelDeployment: "gpt-35-turbo-eai-experimentation",
  },
  {
    label: "gpt-4",
    radiantModelDeployment: "gpt-4-eai-experimentation",
  },
  {
    label: "gpt-4o",
    radiantModelDeployment: "gpt-4o-eai-experimentation",
  },
  {
    label: "claude-3-sonnet",
    radiantModelDeployment: "anthropic.claude-3-sonnet-20240229-v1:0",
  },
  {
    label: "claude-3-haiku",
    radiantModelDeployment: "anthropic.claude-3-haiku-20240307-v1:0",
  },
  {
    label: "claude-35-sonnet",
    radiantModelDeployment: "anthropic.claude-3-5-sonnet-20240620-v1:0",
  },
  {
    label: "llama-3-70b",
    radiantModelDeployment: "meta.llama3-70b-instruct-v1:0",
  },
  {
    label: "gemini-1.5-pro-preview",
    radiantModelDeployment: "gemini-1.5-pro-preview-0409",
  },
  {
    label: "gemini-1.0-pro",
    radiantModelDeployment: "gemini-1.0-pro-001",
  },
  {
    label: "gemini-1.0-pro-vision",
    radiantModelDeployment: "gemini-1.0-pro-vision-001",
  },
];
