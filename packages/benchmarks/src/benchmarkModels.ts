import { models } from "mongodb-rag-core/models";
import { strict as assert } from "assert";

export const MODELS = (
  [
    // "gpt-4o",
    // "gpt-4o-mini",
    // "claude-3-haiku",
    // "claude-35-haiku",
    // "claude-35-sonnet",
    // "claude-35-sonnet-v2",
    // "claude-37-sonnet",
    // "o3-mini",
    // "o3",
    // "o4-mini",
    // "gpt-4.1",
    // "gpt-4.1-mini",
    // "gpt-4.1-nano",
    // "llama-3.1-70b",
    // "llama-3.2-90b",
    // "llama-3.3-70b",
    // "gemini-2-flash",
    // "gemini-2.0-flash-lite-001",
    "gemini-2.5-flash-preview-04-17",
    "gemini-2.5-flash-preview-05-20",
    "gemini-2.5-pro-exp-03-25",
    "gemini-2.5-pro-preview-03-25",
    "gemini-2.5-pro-preview-05-06",
    "gemini-2.5-pro-preview-06-05",
    // "nova-micro-v1:0",
    // "nova-lite-v1:0",
    // "nova-pro-v1:0",
    // "mistral-large-2",
  ] satisfies (typeof models)[number]["label"][]
).map((label) => {
  const model = models.find((m) => m.label === label);
  assert(model, `Model ${label} not found`);
  return model;
});

// Define a type that extracts only the models with specific labels
export type ModelWithLabel<T extends (typeof models)[number]["label"]> =
  Extract<(typeof models)[number], { label: T }>;

// Generic function that returns models with specific labels with proper typing
export function getModelsFromLabels<
  T extends (typeof models)[number]["label"][]
>(labels: [...T]) {
  const configs = MODELS.filter((m): m is ModelWithLabel<T[number]> =>
    labels.includes(m.label)
  );

  return configs;
}
