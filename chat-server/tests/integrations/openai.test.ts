import {
  OpenAiEmbeddingsClient,
  OpenAiChatClient,
} from "../../src/integrations/openai";
import "dotenv/config";
import { stripIndent } from "common-tags";

jest.setTimeout(10000);

describe("OpenAi", () => {
  describe("Embeddings", () => {
    const {
      OPENAI_ENDPOINT,
      OPENAI_API_KEY,
      OPENAI_EMBEDDING_DEPLOYMENT,
      OPENAI_EMBEDDING_MODEL_VERSION,
    } = process.env;
    const openAiClient = new OpenAiEmbeddingsClient(
      OPENAI_ENDPOINT!,
      OPENAI_EMBEDDING_DEPLOYMENT!,
      OPENAI_API_KEY!,
      OPENAI_EMBEDDING_MODEL_VERSION!
    );
    describe("OpenAiEmbeddingsClient.create()", () => {
      const userIp = "abc123";

      test("Should return an array of numbers of length 1536", async () => {
        const { data: embeddingResponse, status } = await openAiClient.create({
          input: "Hello world",
          user: userIp,
        });
        expect(status).toBe(200);
        expect(embeddingResponse.data[0].embedding).toHaveLength(1536);
      });
      test("Should return an error if the input too large", async () => {
        const input = "Hello world! ".repeat(8192);
        await expect(
          openAiClient.create({
            input,
            user: userIp,
          })
        ).rejects.toThrow("Request failed with status code 400");
      });
    });
  });

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
