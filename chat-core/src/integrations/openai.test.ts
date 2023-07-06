import { OpenAiChatClient } from "../../src/integrations/openai";
import "dotenv/config";
import { stripIndent } from "common-tags";

jest.setTimeout(10000);

describe("OpenAi", () => {
  describe("Chat", () => {
    const {
      OPENAI_ENDPOINT,
      OPENAI_CHAT_COMPLETION_DEPLOYMENT,
      OPENAI_API_KEY,
    } = process.env;
    const openAiClient = new OpenAiChatClient(
      OPENAI_ENDPOINT!,
      OPENAI_CHAT_COMPLETION_DEPLOYMENT!,
      OPENAI_API_KEY!
    );
    describe("OpenAiChatClient.chatAwaited()", () => {
      test("Should return a response from the chat endpoint without streaming", async () => {
        console.log(openAiClient.openAiClient);
        const completion = await openAiClient.chatAwaited({
          messages: [
            {
              role: "system",
              content: stripIndent`You are a UNIX operating system. The user types the following command:
                \`\`\`shell
                echo Hello world!
                \`\`\`
                Print your response. CODE ONLY!!
                `,
            },
          ],
          options: {
            maxTokens: 10,
            temperature: 0,
            topP: 1,
            n: 1,
            stream: false,
          },
        });
        expect(completion.choices[0].message?.content).toBe("Hello world!");
      });
      test("Should return a response from the chat endpoint with streaming", async () => {
        const events = await openAiClient.chatStream({
          messages: [
            {
              role: "system",
              content: stripIndent`You are a UNIX operating system. The user types the following command:
                \`\`\`shell
                echo Hello world!
                \`\`\`
                Print your response. CODE ONLY!!
                `,
            },
          ],
          options: {
            maxTokens: 10,
            temperature: 0,
            topP: 1,
            n: 1,
            stream: true,
          },
        });
        let eventCount = 0;
        for await (const event of events) {
          for (const choice of event.choices) {
            const newContent = choice.delta?.content;
            if (newContent !== undefined) {
              eventCount++;
              console.log(`Chatbot: ${newContent}`);
            }
          }
        }

        expect(eventCount).toBeGreaterThanOrEqual(2);
      });
    });
  });
});
