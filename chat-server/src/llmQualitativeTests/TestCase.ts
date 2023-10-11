export interface TestCase {
  name: string;
  expectation: string;
  messages: TestCaseMessage[];
  tags?: string[];
  skip?: boolean;
}

export interface TestCaseMessage {
  role: "user" | "assistant";
  content: string;
}
