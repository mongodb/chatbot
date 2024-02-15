export interface TestCase {
  name: string;
  data: Record<string, unknown>;
}

export interface ConversationTestCase extends TestCase {
  name: "conversation";
  data: ConversationTestCaseData;
}

export interface ConversationTestCaseData extends Record<string, unknown> {
  name: string;
  expectation: string;
  messages: ConversationTestCaseMessage[];
  tags?: string[];
  skip?: boolean;
}

export interface ConversationTestCaseMessage {
  role: "user" | "assistant";
  content: string;
}
