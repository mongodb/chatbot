import { makeChatbotApiServer } from "./ChatbotApiServer";

const chatbotApi = makeChatbotApiServer({
  hello: "whatup",
});

describe("ChatbotApiServer", () => {
  it("exists", () => {
    expect(chatbotApi.hello).toBe("whatup");
  });
});
