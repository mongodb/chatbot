import {
  DatasetRecord,
  initDataset,
  initLogger,
  Logger,
  NoopSpan,
  withCurrent,
} from "braintrust";
import { z } from "zod";
import { LanguageModelMiddleware } from "./aiSdk";

export * from "braintrust";

export const makeBraintrustLogger = (
  params: Parameters<typeof initLogger>[0],
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
    datasetRowSchema.parse(d),
  );
  return datasetRows;
}

export function wrapNoTrace<T extends (...args: any[]) => any>(
  fn: T,
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async function (...args: Parameters<T>): Promise<ReturnType<T>> {
    return withCurrent(new NoopSpan(), async () => {
      return fn(...args);
    });
  };
}

/**
  Remove the $schema key from all nested objects in the input schema of the tools.
  This is a workaround to support Gemini through the Braintrust proxy.
  Gemini does not support the $schema key in the input schema of the tools.
 */
export const SupportGeminiThroughBraintrustProxy: LanguageModelMiddleware = {
  async transformParams(options) {
    if (options.model.modelId.includes("gemini")) {
      options.params.tools = options.params.tools?.map((tool) => {
        if (tool.type === "function") {
          return {
            ...tool,
            inputSchema: remove$schema(tool.inputSchema),
          };
        }
        return tool;
      });
    }
    return options.params;
  },
};

/** Recursively removes the $schema key from all nested objects */
function remove$schema(obj: any): any {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => remove$schema(item));
  }

  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    // Skip the $schema key
    if (key === "$schema") {
      continue;
    }

    // Recursively process nested objects and arrays
    result[key] = remove$schema(value);
  }

  return result;
}
