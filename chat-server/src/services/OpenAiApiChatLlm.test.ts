import { AzureKeyCredential, OpenAIClient } from "@azure/openai";
import { makeOpenAiApiChatLlm } from "./OpenAiApiChatLlm";
import {
  CORE_ENV_VARS,
  assertEnvVars,
  makeMongoDbEmbeddedContentStore,
  makeOpenAiEmbedder,
} from "chat-core";
import express from "express";
import { OpenAiChatMessage } from "./ChatLlm";
import { PersistedHttpRequestFunctionDefinition } from "./PersistedFunctionDefinition";
import cloneDeep from "lodash.clonedeep";
import { HttpApiCredentials } from "./HttpRequestArgs";
import { makeFindApiSpecFunctionDefinition } from "./findPersistedFunctionDefinitionsInAtlas";
import { makeDefaultFindContentFunc } from "../routes/api-conversations/FindContentFunc";
const {
  OPENAI_ENDPOINT,
  OPENAI_API_KEY,
  OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  MONGODB_CONNECTION_URI,
  MONGODB_DATABASE_NAME,
  VECTOR_SEARCH_INDEX_NAME,
  OPENAI_EMBEDDING_DEPLOYMENT,
} = assertEnvVars(CORE_ENV_VARS);

jest.setTimeout(100000);
function makeMockServer() {
  const app = express();
  app.get("/api/projects", (_req, res) => {
    return res.status(200).send({ organization: "test org" });
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

const mockApiCredentials = {
  type: "basic",
  username: "test",
  password: "test",
} satisfies HttpApiCredentials;

const openAiClient = new OpenAIClient(
  OPENAI_ENDPOINT,
  new AzureKeyCredential(OPENAI_API_KEY),
  { apiVersion: "2023-07-01-preview" }
);
const systemPromptPersonality =
  "You are a friendly chatbot that can answer questions about the MongoDB Atlas API spec.";
describe("makeOpenAiApiChatLlm()", () => {
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
      apiCredentials: {
        type: "basic",
        username: "test",
        password: "test",
      },
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
      apiCredentials: mockApiCredentials,
    });
    expect(conversation.newMessages).toHaveLength(6);
    const lastMessageInConversation =
      conversation.newMessages[conversation.newMessages.length - 1];
    expect(lastMessageInConversation.role).toBe("function");
    expect(lastMessageInConversation.name).toBe("getProjects");
    expect(lastMessageInConversation.functions).toHaveLength(2);
    expect(lastMessageInConversation.content).toContain(
      '{"status":200,"data":{"organization":"test org"}}'
    );
  });
  it("should respond to user after API action", async () => {
    const conversationWithApiFunctionCalled = [
      ...previousConversation,
      {
        role: "assistant",
        functionCall: {
          name: "getProjects",
          arguments: '{\n  "body": {\n    "organization": "test org"\n  }\n}',
        },
        content: "",
      },
      {
        role: "function",
        name: "getProjects",
        content: '{"projects":["foo","bar", "baz"]}',
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
          {
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
          },
        ],
      },
    ] satisfies OpenAiChatMessage[];
    const { newMessages } = await openAiApiChatLlm.answerAwaited({
      messages: conversationWithApiFunctionCalled,
      apiCredentials: mockApiCredentials,
    });
    const lastMessageInConversation = newMessages[newMessages.length - 1];
    expect(newMessages).toHaveLength(7);
    expect(lastMessageInConversation.role).toBe("assistant");
    expect(lastMessageInConversation.content).toContain("foo");
    expect(lastMessageInConversation.content).toContain("bar");
    expect(lastMessageInConversation.content).toContain("baz");
  });
  it("should update the system prompt when adding a new spec action", async () => {
    const conversation = await openAiApiChatLlm.answerAwaited({
      staticHttpRequestArgs: {},
      messages: previousConversation,
      apiCredentials: {
        type: "basic",
        username: "test",
        password: "test",
      },
    });
    expect(previousConversation[0].content).not.toContain("getProjects");
    expect(conversation.newMessages[0].content).toContain("getProjects");
  });
  it("should include static HTTP request args in the system prompt", async () => {
    const conversation = await openAiApiChatLlm.answerAwaited({
      staticHttpRequestArgs: {
        pathParameters: {
          organizationId: "TestOrgId",
        },
        queryParameters: {
          limit: 10,
        },
      },
      messages: previousConversation,
      apiCredentials: {
        type: "basic",
        username: "test",
        password: "test",
      },
    });
    expect(previousConversation[0].content).not.toContain("getProjects");
    expect(conversation.newMessages[0].content).toContain("organizationId");
    expect(conversation.newMessages[0].content).toContain("TestOrgId");
    expect(conversation.newMessages[0].content).toContain("limit: 10");
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
      apiCredentials: mockApiCredentials,
    });
    expect(newMessages[newMessages.length - 1].functions).toHaveLength(4);
  });
});

describe("makeOpenAiApiChatLlm() - integration with database content", () => {
  const embeddedContentStore = makeMongoDbEmbeddedContentStore({
    connectionUri: MONGODB_CONNECTION_URI,
    databaseName: MONGODB_DATABASE_NAME,
  });

  const embedder = makeOpenAiEmbedder({
    openAiClient,
    deployment: OPENAI_EMBEDDING_DEPLOYMENT,
    backoffOptions: {
      numOfAttempts: 3,
      maxDelay: 5000,
    },
  });

  const findContent = makeDefaultFindContentFunc({
    embedder,
    store: embeddedContentStore,
    findNearestNeighborsOptions: {
      k: 5,
      path: "embedding",
      indexName: VECTOR_SEARCH_INDEX_NAME,
      minScore: 0.7,
    },
  });
  const findApiSpecFunctionDefinition =
    makeFindApiSpecFunctionDefinition(findContent);
  const openAiApiChatLlm = makeOpenAiApiChatLlm({
    openAiClient,
    deploymentName: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
    systemPromptPersonality,
    findApiSpecFunctionDefinition,
  });
  afterAll(async () => {
    await embeddedContentStore.close();
  });
  it("should find relevant OpenAPI spec action from MongoDB when it's not present in the currently available set and add it to the conversation", async () => {
    const conversation = await openAiApiChatLlm.answerAwaited({
      query: "get all all the projects in my organization",
      staticHttpRequestArgs: {
        headers: {
          Accept: "application/vnd.atlas.2023-02-01+json",
        },
      },
      messages: [
        {
          role: "system",
          content: openAiApiChatLlm.baseSystemPrompt,
        },
      ],
      apiCredentials: {
        type: "basic",
        username: "test",
        password: "test",
      },
    });
    const lastMessageInConversation =
      conversation.newMessages[conversation.newMessages.length - 1];

    expect(lastMessageInConversation.content).toContain("listProjects");
    expect(lastMessageInConversation.role).toBe("function");
    expect(lastMessageInConversation.functions).toHaveLength(2);
    expect(
      lastMessageInConversation.functions &&
        lastMessageInConversation.functions[1].definition?.name
    ).toBe("listProjects");
  });
  const previousConversation = [
    {
      role: "system",
      content:
        "You are a friendly chatbot that can answer questions about the MongoDB Atlas API spec.\n  Use the find_api_spec_action function to find an action in the API spec when the user asks you to perform an action.\n  If none of the available functions match the user's query, use this function.\n  Before performing an action, ask the user for any missing required parameters.\n  Before performing a POST, DELETE, PUT, or PATCH function, ask the user to confirm that they want to perform the action.\n  \nThe following information is available for you to use for calling functions:",
    },
    {
      role: "user",
      content: "get all all the projects in my organization",
    },
    {
      role: "assistant",
      functionCall: {
        name: "find_api_spec_action",
        arguments: '{\n  "query": "get all projects"\n}',
      },
      content: "",
    },
    {
      role: "function",
      name: "find_api_spec_action",
      content:
        "Found the following function(s) to use:\n- listProjects\n\nThey have been added to your set of available functions. Execute the function if you have sufficient data. If you need more data, ask the user for it.",
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
        {
          definition: {
            name: "listProjects",
            description:
              "Execute request to GET https://cloud.mongodb.com/api/atlas/v2/groups\n  \nSummary: Return All Projects\nDescription: Returns details about all projects. Projects group clusters into logical collections that support an application environment, workload, or both. Each project can have its own users, teams, security, and alert settings. To use this resource, the requesting API Key must have the Read Write role.\n\n",
            parameters: {
              type: "object",
              properties: {
                queryParameters: {
                  type: "object",
                  description: "Query Parameters",
                  properties: {
                    envelope: {
                      type: "string",
                    },
                    includeCount: {
                      type: "string",
                    },
                    itemsPerPage: {
                      type: "string",
                    },
                    pageNum: {
                      type: "string",
                    },
                    pretty: {
                      type: "string",
                    },
                  },
                  required: [],
                },
                pathParameters: {
                  type: "object",
                  description: "Path Parameters",
                  properties: {},
                  required: [],
                },
              },
            },
          },
          httpVerb: "GET",
          path: "https://cloud.mongodb.com/api/atlas/v2/groups",
        },
      ],
    },
  ] satisfies OpenAiChatMessage[];
  const staticHttpRequestArgs = {
    headers: {
      Accept: "application/vnd.atlas.2023-02-01+json",
    },
  };
  it("should use dynamic action that has been added to the conversation", async () => {
    const conversation = await openAiApiChatLlm.answerAwaited({
      staticHttpRequestArgs,
      messages: previousConversation,
      apiCredentials: {
        type: "digest",
        username: process.env.ATLAS_TEST_PUBLIC_API_KEY as string,
        password: process.env.ATLAS_TEST_PRIVATE_API_KEY as string,
      },
    });
    expect(conversation.newMessages).toHaveLength(6);
    const lastMessageInConversation =
      conversation.newMessages[conversation.newMessages.length - 1];
    expect(lastMessageInConversation.role).toBe("function");
    expect(lastMessageInConversation.name).toBe("listProjects");
    expect(lastMessageInConversation.functions).toHaveLength(2);
    expect(lastMessageInConversation.content).toContain('"status":200');
  });
  const previousConversationWithApiFunctionCalled = [
    ...previousConversation,
    {
      role: "function",
      name: "listProjects",
      content:
        '{"status":200,"data":{"links":[{"href":"https://cloud.mongodb.com/api/atlas/v2/groups?pageNum=1&itemsPerPage=100","rel":"self"}],"results":[{"clusterCount":5,"created":"2023-06-16T13:19:01Z","id":"648c61425116351907dba2db","links":[{"href":"https://cloud.mongodb.com/api/atlas/v2/groups/648c61425116351907dba2db","rel":"self"}],"name":"doc-chatbot","orgId":"648c60fc9022724b8998aca6"}],"totalCount":1}}',
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
        {
          definition: {
            name: "listProjects",
            description:
              "Execute request to GET https://cloud.mongodb.com/api/atlas/v2/groups\n  \nSummary: Return All Projects\nDescription: Returns details about all projects. Projects group clusters into logical collections that support an application environment, workload, or both. Each project can have its own users, teams, security, and alert settings. To use this resource, the requesting API Key must have the Read Write role.\n\n",
            parameters: {
              type: "object",
              properties: {
                queryParameters: {
                  type: "object",
                  description: "Query Parameters",
                  properties: {
                    envelope: {
                      type: "string",
                    },
                    includeCount: {
                      type: "string",
                    },
                    itemsPerPage: {
                      type: "string",
                    },
                    pageNum: {
                      type: "string",
                    },
                    pretty: {
                      type: "string",
                    },
                  },
                  required: [],
                },
                pathParameters: {
                  type: "object",
                  description: "Path Parameters",
                  properties: {},
                  required: [],
                },
              },
            },
          },
          httpVerb: "GET",
          path: "https://cloud.mongodb.com/api/atlas/v2/groups",
        },
      ],
    },
  ] satisfies OpenAiChatMessage[];
  it("should respond to user after API action from MongoDB", async () => {
    const conversation = await openAiApiChatLlm.answerAwaited({
      staticHttpRequestArgs,
      messages: previousConversationWithApiFunctionCalled,
      apiCredentials: {
        type: "digest",
        username: process.env.ATLAS_TEST_PUBLIC_API_KEY as string,
        password: process.env.ATLAS_TEST_PRIVATE_API_KEY as string,
      },
    });
    expect(conversation.newMessages).toHaveLength(6);
    const lastMessageInConversation =
      conversation.newMessages[conversation.newMessages.length - 1];
    console.log(JSON.stringify(lastMessageInConversation, null, 2));
    expect(lastMessageInConversation.role).toBe("assistant");
  });
});
