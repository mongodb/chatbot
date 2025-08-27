import { models } from "mongodb-rag-core/models";

const labels = models.map((m) => m.label);
type SomeLabel = (typeof models)[number]["label"];

export function getModels<Label extends (typeof models)[number]["label"]>(
  labels: Label[]
) {
  return labels.map((label) => {
    const model = models.find((m) => m.label === label);
    if (!model) {
      throw new Error(`Model ${label} not found`);
    }
    return model;
  });
}

export function getModel<Label extends (typeof models)[number]["label"]>(
  label: Label
) {
  return getModels([label])[0];
}

export function getModelDeployment(label: string) {
  if (labels.includes(label as SomeLabel)) {
    return getModel(label as SomeLabel).deployment;
  } else {
    throw new Error(`Cannot get deployment for ${label} - model not found`);
  }
}

export const mercuryModelConfigs = getModels([
  // OpenAI
  "gpt-5",
  "gpt-5-mini",
  "gpt-5-nano",
  "gpt-4o",
  "gpt-4o-mini",
  "o3",
  "o3-mini",
  "o4-mini",
  "gpt-4.1",
  "gpt-4.1-mini",
  "gpt-4.1-nano",
  // Anthropic
  "claude-opus-4",
  "claude-sonnet-4",
  "claude-37-sonnet",
  "claude-35-sonnet-v2",
  "claude-35-sonnet",
  "claude-35-haiku",
  // Meta
  "llama-3.1-70b",
  "llama-3.2-90b",
  "llama-3.3-70b",
  // Google
  "gemini-2.0-flash-lite-001",
  "gemini-2-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  // Amazon
  "nova-micro-v1:0",
  "nova-lite-v1:0",
  "nova-pro-v1:0",
  // Mistral
  "mistral-large-2",
]);

export const mercuryStarredModelLabels = [
  "gpt-5",
  "claude-sonnet-4",
  "llama-3.3-70b",
  "gemini-2.5-pro",
];
export const mercuryStarredModelConfigs = mercuryModelConfigs.filter((m) =>
  mercuryStarredModelLabels.includes(m.label)
);
