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
