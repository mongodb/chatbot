import {
  ConversationEvalCase,
  ConversationEvalCaseSchema,
} from "mongodb-rag-core/eval";
import { initDataset } from "mongodb-rag-core/braintrust";
import { z } from "zod";

export interface GetConversationEvalCasesFromBraintrustParams {
  projectName: string;
  datasetName: string;
}

// Schema of dataset stored in Braintrust.
const ConversationDatasetEntrySchema = z.object({
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

type ConversationDatasetEntryData = z.infer<
  typeof ConversationDatasetEntrySchema
>;

export async function getConversationEvalCasesFromBraintrust({
  projectName,
  datasetName,
}: GetConversationEvalCasesFromBraintrustParams): Promise<
  ConversationEvalCase[]
> {
  const dataset = await initDataset({
    project: projectName,
    dataset: datasetName,
  });
  const ConversationEvalCases = (await dataset.fetchedData())
    .map((d) => ConversationDatasetEntrySchema.parse(d))
    .map((evalData: ConversationDatasetEntryData) => {
      return {
        ...evalData.input,
        ...evalData.expected,
        name: evalData.input.name ?? evalData.input.messages[0].content,
        tags: evalData.metadata.tags,
      } satisfies ConversationEvalCase;
    });
  return ConversationEvalCases;
}
