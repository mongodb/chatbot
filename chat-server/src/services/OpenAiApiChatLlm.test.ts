import { AzureKeyCredential, OpenAIClient } from "@azure/openai";
import { makeOpenAiApiChatLlm } from "./OpenAiApiChatLlm";
import { CORE_ENV_VARS, assertEnvVars } from "chat-core";
import express from "express";
import { OpenAiChatMessage } from "./ChatLlm";
import { PersistedHttpRequestFunctionDefinition } from "./PersistedFunctionDefinition";
import cloneDeep from "lodash.clonedeep";
const { OPENAI_ENDPOINT, OPENAI_API_KEY, OPENAI_CHAT_COMPLETION_DEPLOYMENT } =
  assertEnvVars(CORE_ENV_VARS);

function makeMockServer() {
  const app = express();
  app.get("/api/projects", () => {
    return { organization: "test org" };
  });
  return {
    start: () => app.listen(3000),
  };
}

const mockOpenAiFunction = {
  httpVerb: "GET",
  path: "http://localhost:3000/api/projects",
  definition: {
    name: "getProjects",
    description: "Get all projects in the organization",
    parameters: {
      type: "object",
      properties: {
        body: {
          type: "object",
          properties: {
            organization: {
              type: "string",
              description: "organizationName",
            },
          },
          required: ["organization"],
        },
      },
    },
  },
} satisfies PersistedHttpRequestFunctionDefinition;

describe("makeOpenAiApiChatLlm()", () => {
  const openAiClient = new OpenAIClient(
    OPENAI_ENDPOINT,
    new AzureKeyCredential(OPENAI_API_KEY),
    { apiVersion: "2023-07-01-preview" }
  );
  const systemPromptPersonality =
    "You are a friendly chatbot that can answer questions about the MongoDB Atlas API spec.";
  const findApiSpecFunctionDefinition = async ({
    query,
  }: {
    query: string;
  }) => {
    return [mockOpenAiFunction];
  };
  const openAiApiChatLlm = makeOpenAiApiChatLlm({
    openAiClient,
    deploymentName: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
    systemPromptPersonality,
    findApiSpecFunctionDefinition,
  });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let server;
  beforeAll(() => {
    server = makeMockServer().start();
  });
  afterAll(async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await server.close();
  });

  it("should find relevant OpenAPI spec action when it's not present in the currently available set and add it to the conversation", async () => {
    const conversation = await openAiApiChatLlm.answerAwaited({
      query: "get all my projects",
      staticHttpRequestArgs: {},
      messages: [
        {
          role: "system",
          content: openAiApiChatLlm.baseSystemPrompt,
        },
      ],
    });
    const lastMessageInConversation =
      conversation.newMessages[conversation.newMessages.length - 1];

    expect(lastMessageInConversation.content).toContain("getProjects");
    expect(lastMessageInConversation.role).toBe("function");
    expect(lastMessageInConversation.functions).toHaveLength(2);
    expect(
      lastMessageInConversation.functions &&
        lastMessageInConversation.functions[1].definition?.name
    ).toBe("getProjects");
  });
  const previousConversation = [
    {
      role: "system",
      content:
        "You are a friendly chatbot that can answer questions about the MongoDB Atlas API spec.\n  Use the find_api_spec_action function to find an action in the API spec when the user asks you to perform an action.\n  If none of the available functions match the user's query, use this function.\n  Before performing an action, ask the user for any missing required parameters.\n  Before performing a POST, DELETE, PUT, or PATCH function, ask the user to confirm that they want to perform the action.\n  ",
    },
    { role: "user", content: "get all my projects" },
    {
      role: "assistant",
      functionCall: {
        name: "find_api_spec_action",
        arguments: '{ query: "get all projects" }',
      },
      content: "",
    },
    {
      role: "function",
      name: "find_api_spec_action",
      content:
        "Found the following function(s) to use:\n- getProjects\n\nThey have been added to your set of available functions. Execute the function if you have sufficient data. If you need more data, ask the user for it.",
      functions: [
        {
          definition: {
            name: "find_api_spec_action",
            description: "Find an action in the API spec",
            parameters: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "repeat the user's query",
                },
              },
              required: ["query"],
            },
          },
        },
        mockOpenAiFunction,
      ],
    },
  ] satisfies OpenAiChatMessage[];
  it("should use dynamic action that has been added to the conversation", async () => {
    const conversation = await openAiApiChatLlm.answerAwaited({
      staticHttpRequestArgs: {},
      messages: previousConversation,
    });
    expect(conversation.newMessages).toHaveLength(6);
    const lastMessageInConversation =
      conversation.newMessages[conversation.newMessages.length - 1];
    expect(lastMessageInConversation.role).toBe("function");
    expect(lastMessageInConversation.name).toBe("getProjects");
    expect(lastMessageInConversation.functions).toHaveLength(2);
    // SKUNK_TODO: update this expectation when we have executeHttpApiRequest implemented
    expect(lastMessageInConversation.content).toContain(
      "Hey here's a response from the API!"
    );
  });
  it("should update the system prompt when adding a new spec action", async () => {
    const conversation = await openAiApiChatLlm.answerAwaited({
      staticHttpRequestArgs: {},
      messages: previousConversation,
    });
    expect(previousConversation[0].content).not.toContain("getProjects");
    expect(conversation.newMessages[0].content).toContain("getProjects");
  });
  // Cannot do until have executeHttpApiRequest implemented
  it.skip("should perform API action if it has all the required information", () => {
    // TODO
  });
  it("should remove available API actions if there are already the max number of dyanmic functions", async () => {
    // Note: default max is 3
    const dynamicFuncs: PersistedHttpRequestFunctionDefinition[] = [];
    for (let i = 0; i < 4; i++) {
      const newDynamicFunc = { ...mockOpenAiFunction };
      newDynamicFunc.definition = {
        ...newDynamicFunc.definition,
        name: `func${i}`,
      };
      dynamicFuncs.push(newDynamicFunc);
    }
    const previousConversationCopy: OpenAiChatMessage[] =
      cloneDeep(previousConversation);
    previousConversationCopy[previousConversationCopy.length - 1].functions =
      dynamicFuncs;
    const { newMessages } = await openAiApiChatLlm.answerAwaited({
      messages: previousConversationCopy,
    });

    expect(newMessages[newMessages.length - 1].functions).toHaveLength(4);
  });
});
