import { models } from "mongodb-rag-core/models";

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
