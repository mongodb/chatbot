/**
  @fileoverview This file contains the list of LLMs that are available through Radiant.
 */
// TODO: get more models
export const radiantModels: {
  label: string;
  radiantModelDeployment: string;
}[] = [
  {
    label: "gpt-4",
    radiantModelDeployment: "gpt-4-eai-experimentation",
  },
  {
    label: "gpt-4o",
    radiantModelDeployment: "gpt-4o-eai-experimentation",
  },
  {
    label: "mistral-large",
    radiantModelDeployment: "Mistral-large-eai",
  },
  {
    label: "gpt-35-turbo",
    radiantModelDeployment: "gpt-35-turbo-eai-experimentation",
  },
];
