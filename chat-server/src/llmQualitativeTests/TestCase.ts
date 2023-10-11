export interface TestCase {
  name: string;
  expectation: string;
  messages: TestCaseMessage[];
  tags: string[];
}

export interface TestCaseMessage {
  role: "user" | "assistant";
  content: string;
}
