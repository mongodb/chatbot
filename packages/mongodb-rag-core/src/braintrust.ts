import {
  DatasetRecord,
  initDataset,
  initLogger,
  Logger,
  NoopSpan,
  withCurrent,
} from "braintrust";
import { z } from "zod";

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

export async function getDatasetFromBraintrust<SchemaReturnType>({
  datasetName,
  projectName,
  datasetRowSchema,
}: {
  datasetName: string;
  projectName: string;
  datasetRowSchema: z.ZodSchema;
}): Promise<SchemaReturnType[]> {
  const dataset = await initDataset({
    project: projectName,
    dataset: datasetName,
  });
  const datasetRows = (await dataset.fetchedData()).map((d) =>
    datasetRowSchema.parse(d)
  );
  return datasetRows;
}

export function wrapNoTrace<T extends (...args: any[]) => any>(
  fn: T
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async function (...args: Parameters<T>): Promise<ReturnType<T>> {
    return withCurrent(new NoopSpan(), async () => {
      return fn(...args);
    });
  };
}
