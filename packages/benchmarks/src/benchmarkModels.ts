import { models } from "mongodb-rag-core/models";
import { strict as assert } from "assert";

export const MODELS = (
  [
    "gpt-4o",
    "gpt-4o-mini",
    "claude-3-haiku",
    "claude-35-haiku",
    "claude-35-sonnet",
    "claude-35-sonnet-v2",
    "claude-37-sonnet",
    "o3-mini",
    "o3",
    "o4-mini",
    "gpt-4.1",
    "gpt-4.1-mini",
    "gpt-4.1-nano",
    "llama-3.1-70b",
    "llama-3.2-90b",
    "llama-3.3-70b",
    "gemini-1.5-flash-002",
    "gemini-2-flash",
    "gemini-2.0-flash-lite",
    "gemini-1.0-pro-002",
    "gemini-1.5-pro-002",
    "gemini-2.5-flash",
    "nova-micro-v1:0",
    "nova-lite-v1:0",
    "nova-pro-v1:0",
    "mistral-large-2",
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
