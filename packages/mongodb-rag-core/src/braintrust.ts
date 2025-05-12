import { DatasetRecord, initDataset, initLogger, Logger } from "braintrust";

export * from "braintrust";

export const makeBraintrustLogger = (
  params: Parameters<typeof initLogger>[0]
) => initLogger(params) as Logger<true>;

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
