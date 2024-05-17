import { z } from "zod";

export const zIsoDateString = z.string().refine(
  (value) => {
    try {
      return new Date(value).toISOString() === value;
    } catch {
      return false;
    }
  },
  { message: "Invalid ISO date" }
);

const BaseMessage = z.object({
  id: z.string().describe("A unique identifier for the message."),
  role: z.string(),
  content: z.string().describe("The content of the message."),
  createdAt: zIsoDateString,
});

export type UserMessage = z.infer<typeof UserMessage>;
export const UserMessage = BaseMessage.extend({
  role: z.literal("user"),
});

export type AssistantMessageMetadata = z.infer<typeof AssistantMessageMetadata>;
export const AssistantMessageMetadata = z
  .object({
    verifiedAnswer: z
      .object({
        _id: z.string(),
        created: zIsoDateString,
        updated: zIsoDateString,
      })
      .optional()
      .describe(
        `This field is defined if the message was a predefined "verified answer". Contains metadata about the verified answer.`
      ),
  })
  .passthrough();

/**
  A formatted reference for an assistant message.

  For example, a Reference might be a docs page, dev center article, or
  a MongoDB University module.
 */
export type Reference = z.infer<typeof Reference>;
export const Reference = z.object({
  url: z.string(),
  title: z.string(),
});

export type References = z.infer<typeof References>;
export const References = z.array(Reference);

export type AssistantMessage = z.infer<typeof AssistantMessage>;
export const AssistantMessage = BaseMessage.extend({
  role: z.literal("assistant"),
  rating: z
    .boolean()
    .optional()
    .describe(
      "Set to `true` if the user liked the response, `false` if the user didn't like the response. No value if user didn't rate the response."
    ),
  references: References.describe("Links to resources related to the message."),
  suggestedPrompts: z.array(z.string()).optional(),
  metadata: AssistantMessageMetadata.optional(),
});

export type Message = z.infer<typeof Message>;
export const Message = z.discriminatedUnion("role", [UserMessage, AssistantMessage]);

export type Role = Message["role"];

export type Conversation = z.infer<typeof Conversation>;
export const Conversation = z.object({
  _id: z.string().describe("A unique identifier for the conversation."),
  createdAt: zIsoDateString,
  messages: z.array(Message).describe("The messages in the conversation."),
});

// Streaming

export type DeltaStreamEvent = z.infer<typeof DeltaStreamEvent>;
export const DeltaStreamEvent = z.object({
  type: z.literal("delta"),
  data: z.string(),
});

export type ReferencesStreamEvent = z.infer<typeof ReferencesStreamEvent>;
export const ReferencesStreamEvent = z.object({
  type: z.literal("references"),
  data: References,
});

export type MetadataStreamEvent = z.infer<typeof MetadataStreamEvent>;
export const MetadataStreamEvent = z.object({
  type: z.literal("metadata"),
  data: AssistantMessageMetadata,
});

export type FinishedStreamEvent = z.infer<typeof FinishedStreamEvent>;
export const FinishedStreamEvent = z.object({
  type: z.literal("finished"),
  data: z.string(),
});

export type ConversationStreamEvent = z.infer<typeof ConversationStreamEvent>;
export const ConversationStreamEvent = z.discriminatedUnion("type", [
  DeltaStreamEvent,
  ReferencesStreamEvent,
  MetadataStreamEvent,
  FinishedStreamEvent,
]);
