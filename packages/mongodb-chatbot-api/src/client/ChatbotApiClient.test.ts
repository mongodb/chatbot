import { makeChatbotApiClient } from "./ChatbotApiClient";

const chatbotApi = makeChatbotApiClient({
  conversations: {
    serverUrl: "localhost:3000",
  },
});

describe("ChatbotApiClient", () => {
  it("supports the Conversations API", () => {
    expect(chatbotApi.conversations).not.toBeNull();
  });
});
