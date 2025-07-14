import {
  ConversationEvalCase,
  ConversationEvalCaseSchema,
} from "mongodb-rag-core/eval";
import { initDataset } from "mongodb-rag-core/braintrust";
import { z } from "zod";

export interface GetVoyageAiEvalCasesFromBraintrustParams {
  projectName: string;
  datasetName?: string;
}

// Schema of dataset stored in Braintrust.
const VoyageAiDatasetEntrySchema = z.object({
  input: ConversationEvalCaseSchema.pick({
    name: true,
    messages: true,
  }).partial({ name: true }),
  expected: ConversationEvalCaseSchema.pick({
    expectation: true,
    reject: true,
    expectedLinks: true,
    reference: true,
  }),
  metadata: z.object({
    tags: z.array(z.string()).optional(),
    author: z.string().optional(),
  }),
  created: z.string().optional(),
});

type VoyageAiDatasetEntryData = z.infer<typeof VoyageAiDatasetEntrySchema>;

export async function getVoyageAiEvalCasesFromBraintrust({
  projectName,
  datasetName = "voyage-ai",
}: GetVoyageAiEvalCasesFromBraintrustParams): Promise<ConversationEvalCase[]> {
  const dataset = await initDataset({
    project: projectName,
    dataset: datasetName,
  });
  const voyageAiEvalCases = (await dataset.fetchedData())
    .map((d) => VoyageAiDatasetEntrySchema.parse(d))
    .map((evalData: VoyageAiDatasetEntryData) => {
      return {
        ...evalData.input,
        ...evalData.expected,
        name: evalData.input.name ?? evalData.input.messages[0].content,
        tags: evalData.metadata.tags,
      } satisfies ConversationEvalCase;
    });
  return voyageAiEvalCases;
}
