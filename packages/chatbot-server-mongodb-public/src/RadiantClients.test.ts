import {
  assertEnvVars,
  makeLangchainChatLlm,
  OpenAiChatMessage,
} from "mongodb-chatbot-server";
import {
  makeRadiantEmbeddingClient,
  makeRadiantLlmClient,
} from "./RadiantClients";
import {
  BaseChatModel,
  BaseChatModelCallOptions,
} from "@langchain/core/language_models/chat_models";
import {
  BaseMessagePromptTemplateLike,
  ChatPromptTemplate,
} from "@langchain/core/prompts";
import "dotenv/config";
import e from "express";
const { RADIANT_API_KEY, RADIANT_BASE_URL, AUTH_COOKIE } = assertEnvVars({
  RADIANT_API_KEY: "",
  RADIANT_BASE_URL: "",
  AUTH_COOKIE: "",
});
describe("Radiant LLm Client", () => {
  // Skipping b/c cannot access the staging Radiant API
  // from the Drone CI.
  it("should call LLM with Radiant", async () => {
    const llm = makeRadiantLlmClient({
      radiantApiKey: RADIANT_API_KEY,
      radiantBaseUrl: RADIANT_BASE_URL,
      cookie: AUTH_COOKIE,
    });
    const userMsg = {
      role: "user",
      content: "hello, how are you?",
    } satisfies OpenAiChatMessage;
    const prompts = ChatPromptTemplate.fromMessages(
      [userMsg].map((m) => messageBaseMessagePromptTemplateLike(m))
    );
    const chain = prompts.pipe(llm);
    const res = await chain.invoke({});
    expect(res.content).toBeTruthy();
    // const chatLlm = makeLangchainChatLlm({
    //   chatModel: llm,
    // });
    // const ansAwaited = await chatLlm.answerQuestionAwaited({
    //   messages: [userMsg],
    // });
    // console.log(ansAwaited);
    // expect(ansAwaited.content).toBeTruthy();
    // const events = await chatLlm.answerQuestionStream({
    //   messages: [userMsg],
    // });
    // let count = 0;
    // let message = "";
    // for await (const event of events) {
    //   count++;
    //   for (const choice of event.choices) {
    //     const delta = choice.delta?.content;
    //     if (delta !== undefined) {
    //       message += delta;
    //     }
    //   }
    // }
    // console.log(message, count);
  });
});
describe("Radiant Embedding Client", () => {
  it("should call embedding model with Radiant", async () => {
    const embedder = makeRadiantEmbeddingClient({
      radiantApiKey: RADIANT_API_KEY,
      radiantBaseUrl: RADIANT_BASE_URL,
      cookie: AUTH_COOKIE,
    });
    const res = await embedder.embedQuery("Hello, world!");
    expect(res.length).toBeGreaterThan(0);
  });
});

function messageBaseMessagePromptTemplateLike(
  message: OpenAiChatMessage
): BaseMessagePromptTemplateLike {
  return [message.role, message.content ?? ""];
}
