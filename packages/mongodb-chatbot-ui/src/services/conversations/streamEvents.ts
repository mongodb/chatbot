import { z } from "zod";
import { References } from "mongodb-rag-core";

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
  data: References,
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
