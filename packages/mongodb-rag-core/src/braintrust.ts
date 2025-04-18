import { DatasetRecord, initDataset, initLogger } from "braintrust";

export * from "braintrust";

/**
  Braintrust logger. Intialized with the env vars:

  ```ts
  {
    projectName: process.env.BRAINTRUST_CHATBOT_TRACING_PROJECT_NAME,
    apiKey: process.env.BRAINTRUST_API_KEY,
  }
  ```
 */
export const braintrustLogger = initLogger({
  projectName: process.env.BRAINTRUST_CHATBOT_TRACING_PROJECT_NAME,
  apiKey: process.env.BRAINTRUST_TRACING_API_KEY,
});

export async function uploadDatasetToBraintrust({
  apiKey,
  datasetName,
  projectName,
  description,
  dataset,
  metadata,
}: {
  apiKey: string;
  datasetName: string;
  projectName: string;
  description: string;
  dataset: Partial<DatasetRecord>[];
  metadata?: Record<string, unknown>;
}) {
  const btDataset = initDataset({
    apiKey,
    dataset: datasetName,
    description,
    project: projectName,
    metadata,
  });
  dataset.forEach((d) => btDataset.insert(d));
  const res = await btDataset.summarize();
  return res;
}
