import { z } from "zod";
import { oneLine, stripIndent } from "common-tags";

export type MessageAnalysis = z.infer<typeof MessageAnalysis>;

export const MessageAnalysis = z.object({
  topics: z.array(z.string()).describe(
    stripIndent`
      ${oneLine`
        Extract the topic keywords of the user query. Keep topics as general as possible.
        Include the genre or type of material that the user might be expecting in response to the given query.
        Do not include anything that looks like personally-identifiable information.
      `}
      @example ["MongoDB Atlas", "Aggregation Framework", "how to", "troubleshooting"]
    `
  ),
  sentiment: z
    .string()
    .optional()
    .describe(
      stripIndent`
        In as few words as possible, characterize the sentiment of the given user query.
        @example "Informational/Technical"
      `
    ),
  relevance: z
    .number()
    .min(0)
    .max(1)
    .describe(
      `On a scale of 0-1, rate how appropriate it is to ask the given query of a chatbot whose expertise is in MongoDB.`
    ),
  pii: z
    .boolean()
    .describe(
      `If the given query contains anything resembling personally-identifiable information (PII), set this flag to true. Otherwise, set it to false.`
    ),
});
