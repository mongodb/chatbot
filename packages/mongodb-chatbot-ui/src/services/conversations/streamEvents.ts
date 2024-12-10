import { z } from "zod";
// import { ReferencesSchema } from "mongodb-rag-core";

const ReferenceSchema = z.object({
  url: z.string(),
  title: z.string(),
  metadata: z
    .object({
      sourceName: z.string().optional().describe("The name of the source."),
      sourceType: z.string().optional(),
      tags: z.array(z.string()).optional(),
    })
    .passthrough() // We accept additional unknown metadata fields
    .optional(),
});

const ReferencesSchema = z.array(ReferenceSchema);

export type UnknownStreamEvent = z.infer<typeof UnknownStreamEventSchema>;
export const UnknownStreamEventSchema = z.object({
  type: z.string(),
  data: z.unknown(),
});

export type DeltaStreamEvent = z.infer<typeof DeltaStreamEventSchema>;
export const DeltaStreamEventSchema = UnknownStreamEventSchema.extend({
  type: z.literal("delta"),
  data: z.string(),
});

export type ProcessingStreamEvent = z.infer<typeof ProcessingStreamEventSchema>;
export const ProcessingStreamEventSchema = UnknownStreamEventSchema.extend({
  type: z.literal("processing"),
  data: z.string(),
});

export type ReferencesStreamEvent = z.infer<typeof ReferencesStreamEventSchema>;
export const ReferencesStreamEventSchema = UnknownStreamEventSchema.extend({
  type: z.literal("references"),
  data: ReferencesSchema,
});

export type MetadataStreamEvent = z.infer<typeof MetadataStreamEventSchema>;
export const MetadataStreamEventSchema = UnknownStreamEventSchema.extend({
  type: z.literal("metadata"),
  data: z.record(z.unknown()),
});

export type FinishedStreamEvent = z.infer<typeof FinishedStreamEventSchema>;
export const FinishedStreamEventSchema = UnknownStreamEventSchema.extend({
  type: z.literal("finished"),
  data: z.string(),
});

export type SomeStreamEvent = z.infer<typeof SomeStreamEventSchema>;
export const SomeStreamEventSchema = z.union([
  DeltaStreamEventSchema,
  MetadataStreamEventSchema,
  ProcessingStreamEventSchema,
  ReferencesStreamEventSchema,
  FinishedStreamEventSchema,
]);
export function isSomeStreamEvent(data: unknown): data is SomeStreamEvent {
  return SomeStreamEventSchema.safeParse(data).success;
}

export type SomeStreamEventType = z.infer<typeof SomeStreamEventTypeSchema>;
export const SomeStreamEventTypeSchema = SomeStreamEventSchema.transform(
  (schema) => schema.type
);
export function isSomeStreamEventType(
  data: string
): data is SomeStreamEventType {
  return SomeStreamEventTypeSchema.safeParse(data).success;
}
