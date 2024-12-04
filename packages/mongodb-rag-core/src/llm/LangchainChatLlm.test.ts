import "dotenv/config";
import { OpenAiChatMessage } from "./ChatLlm";
import { makeLangchainChatLlm } from "./LangchainChatLlm";
import { FakeListChatModel } from "@langchain/core/utils/testing";
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { assertEnvVars } from "../assertEnvVars";
import { CORE_OPENAI_CHAT_COMPLETION_ENV_VARS } from "../CoreEnvVars";
import { BedrockChat } from "@langchain/community/chat_models/bedrock";
import { response } from "express";

jest.setTimeout(30000);

const {
  OPENAI_ENDPOINT,
  OPENAI_API_KEY,
  OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  OPENAI_CHAT_COMPLETION_MODEL_VERSION,
} = assertEnvVars(CORE_OPENAI_CHAT_COMPLETION_ENV_VARS);

const fakeResponses = ["I'll callback later.", "You 'console' them!"];
const makeFakeChat = () =>
  new FakeListChatModel({
    responses: fakeResponses,
  });
const messages = [
  { role: "user", content: "Tell me a JavaScript pun" },
] satisfies OpenAiChatMessage[];

describe("LangchainChatLlm", () => {
  it("should generate response - awaited", async () => {
    const langchainChatLlm = makeLangchainChatLlm({
      chatModel: makeFakeChat(),
    });
    const { role, content } = await langchainChatLlm.answerQuestionAwaited({
      messages,
    });
    expect(role).toBe("assistant");
    expect(content).toBe(fakeResponses[0]);
  });
  it("should generate response - streamed", async () => {
    const langchainChatLlm = makeLangchainChatLlm({
      chatModel: makeFakeChat(),
    });
    const res = await langchainChatLlm.answerQuestionStream({
      messages,
    });
    let content = "";
    for await (const event of res) {
      content += event.choices[0].delta?.content;
    }
    expect(content).toBe(fakeResponses[0]);
  });
  it("should work with Azure OpenAI", async () => {
    const model = new ChatOpenAI({
      azureOpenAIApiKey: OPENAI_API_KEY,
      azureOpenAIApiDeploymentName: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
      azureOpenAIApiInstanceName: getAzureInstanceName(OPENAI_ENDPOINT),
      azureOpenAIApiVersion: OPENAI_CHAT_COMPLETION_MODEL_VERSION,
    });
    const azureLangchainChatLlm = makeLangchainChatLlm({
      chatModel: model,
    });
    const { role, content } = await azureLangchainChatLlm.answerQuestionAwaited(
      {
        messages,
      }
    );
    expect(role).toBe("assistant");
    expect(content).toBeTruthy();

    const res = await azureLangchainChatLlm.answerQuestionStream({
      messages,
    });
    let contentStream = "";
    for await (const event of res) {
      contentStream += event.choices[0].delta?.content;
    }
    expect(contentStream).toBeTruthy();
  });

  // Skipped because we do not have a MongoDB-org Anthropic subscription
  it.skip("should work with Anthropic", async () => {
    const model = new ChatAnthropic({
      temperature: 0.9,
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      maxTokens: 1024,
    });
    const azureLangchainChatLlm = makeLangchainChatLlm({
      chatModel: model,
    });
    const { role, content } = await azureLangchainChatLlm.answerQuestionAwaited(
      {
        messages,
      }
    );
    expect(role).toBe("assistant");
    expect(content).toBeTruthy();

    const res = await azureLangchainChatLlm.answerQuestionStream({
      messages,
    });
    let contentStream = "";
    for await (const event of res) {
      contentStream += event.choices[0].delta?.content;
    }
    expect(contentStream).toBeTruthy();
  });
});

function getAzureInstanceName(azureDeploymenUrl: string) {
  // Parse the URL using the URL API
  const url = new URL(azureDeploymenUrl);

  // Extract the hostname
  const hostname = url.hostname;

  // Assuming the format is always [subdomain].openai.azure.com, split by "." and take the first part
  const subdomain = hostname.split(".")[0];
  return subdomain;
}

describe("supports AWS bedrock", () => {
  it("should call bedrock chat model", async () => {
    const models = [
      {
        name: "Claude 3.5 Haiku",
        modelId: "us.anthropic.claude-3-5-haiku-20241022-v1:0",
      },
      {
        name: "Claude 3.5 Sonnet v2",
        modelId: "us.anthropic.claude-3-5-sonnet-20241022-v2:0",
      },
      {
        name: "Llama 3.1 70b",
        modelId: "us.meta.llama3-1-70b-instruct-v1:0",
      },
      {
        name: "Llama 3.2 11b",
        modelId: "us.meta.llama3-2-11b-instruct-v1:0",
      },
      {
        name: "Llama 3.2 1b",
        modelId: "us.meta.llama3-2-1b-instruct-v1:0",
      },
      // {
      //   name: "Llama 3.2 90b",
      //   modelId: "meta.llama3-2-90b-instruct-v1:0",
      // },
    ];
    const results = [];
    for (const { name, modelId } of models) {
      const llm = new BedrockChat({
        model: modelId,
        region: process.env.AWS_REGION!,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
          sessionToken: process.env.AWS_SESSION_TOKEN!,
        },
      });
      const aiMsg = await llm.invoke([
        ["human", "Solve the Riemann's hypothesis please."],
      ]);
      console.log(name, ":", aiMsg.content);
      results.push({ name, modelId, response: aiMsg.content });
    }
    console.log(results);
  });
});
