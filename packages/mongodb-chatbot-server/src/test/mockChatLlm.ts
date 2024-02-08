import { ChatLlm } from "../services";

export const mockChatLlm: ChatLlm = {
  async answerQuestionAwaited() {
    return {
      role: "assistant",
      content: "foo",
    };
  },
  answerQuestionStream: async () =>
    (async function* () {
      let count = 0;
      while (count < 5) {
        yield {
          id: count.toString(), // Unique ID for each item
          created: new Date(),
          choices: [
            {
              index: 0,
              finishReason: "[STOP]",
              delta: {
                role: "assistant",
                content: `Example content ${count}\n`, // Example content
                toolCalls: [],
              },
            },
          ],
          promptFilterResults: [],
        };
        count++;
      }
    })(),

  async callTool() {
    return {
      functionMessage: {
        name: "test_func",
        role: "function",
        content: "bar",
      },
    };
  },
};
