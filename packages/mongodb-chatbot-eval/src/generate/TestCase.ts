import { z } from "zod";

export interface BaseTestCase {
  name: string;
  data: Record<string, unknown>;
}

export const ConversationTestCaseDataSchema = z.object({
  name: z.string(),
  expectation: z.string(),
  messages: z
    .array(
      z.object({
        role: z.enum(["assistant", "user"]),
        content: z.string(),
      })
    )
    .min(1),
  tags: z.array(z.string()).optional(),
  skip: z.boolean().optional(),
});

export type ConversationTestCaseData = z.infer<
  typeof ConversationTestCaseDataSchema
>;

export interface ConversationTestCase extends BaseTestCase {
  data: ConversationTestCaseData;
  name: "conversation";
}

export type SomeTestCase = ConversationTestCase | BaseTestCase;

export function isConversationTestCase(
  testCase: SomeTestCase
): testCase is ConversationTestCase {
  return ConversationTestCaseDataSchema.safeParse(testCase).success;
}
