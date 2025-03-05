import { ObjectId } from "mongodb-rag-core/mongodb";
import { z } from "zod";
import { GenerationNode, WithParentNode } from "./GenerationNode";
import {
  makeGenerateChildrenWithOpenAi,
  makeGenerateNChoiceChildrenWithOpenAi,
} from "./generateChildren";
import { LlmOptions } from "./databaseNlQueries/LlmOptions";

// Mock OpenAI client
const mockOpenAIClient = {
  chat: {
    completions: {
      create: jest.fn(),
    },
  },
} as any;

// Define test types
interface ParentData {
  name: string;
  description: string;
}
type ParentNode = GenerationNode<ParentData>;

const ChildDataSchema = z.object({
  value: z.number(),
});

type ChildData = z.infer<typeof ChildDataSchema>;
type ChildNode = WithParentNode<GenerationNode<ChildData>, ParentNode>;

// Create a parent node for testing
function createParentNode(): ParentNode {
  return {
    _id: new ObjectId(),
    parent: null,
    data: {
      name: "TestParent",
      description: "A test parent node",
    },
    updated: new Date(),
  };
}

// TODO: implement
function createLlmOptions(): LlmOptions {
  return {
    openAiClient: mockOpenAIClient,
    model: "gpt-4",
    temperature: 0,
    max_tokens: 1000,
  };
}

describe("makeGenerateChildrenWithOpenAi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should generate child nodes from parent node", async () => {
    // Mock the response from OpenAI
    mockOpenAIClient.chat.completions.create.mockResolvedValueOnce({
      choices: [
        {
          message: {
            function_call: {
              arguments: JSON.stringify([
                {
                  value: 42,
                },
                {
                  value: 100,
                },
              ] satisfies ChildData[]),
            },
          },
        },
      ],
    });

    // Create the generator function
    const generateChildren = makeGenerateChildrenWithOpenAi<
      ParentNode,
      ChildNode
    >({
      makePromptMessages: async (parent) => [
        { role: "system", content: "You are a test assistant" },
        {
          role: "user",
          content: `Generate children for parent: ${parent.data.name}`,
        },
      ],
      response: {
        schema: ChildDataSchema,
        name: "generate_children",
        description: "Generate child nodes",
      },
    });

    // Generate children
    const parent = createParentNode();
    const llmOptions = createLlmOptions();
    const children = await generateChildren(parent, llmOptions);

    // Assertions
    expect(mockOpenAIClient.chat.completions.create).toHaveBeenCalledTimes(1);
    expect(children).toHaveLength(2);
    expect(children[0].data.value).toBe(42);
    expect(children[0].parent).toBe(parent);
    expect(children[1].data.value).toBe(100);
    expect(children[1].parent).toBe(parent);
  });

  it("should apply filter to generated nodes", async () => {
    // Mock the response from OpenAI
    mockOpenAIClient.chat.completions.create.mockResolvedValueOnce({
      choices: [
        {
          message: {
            function_call: {
              arguments: JSON.stringify([
                {
                  id: "child1",
                  parentName: "TestParent",
                  value: 42,
                },
                {
                  id: "child2",
                  parentName: "TestParent",
                  value: 100,
                },
              ]),
            },
          },
        },
      ],
    });

    // Create the generator function with a filter
    const generateChildren = makeGenerateChildrenWithOpenAi<
      ParentNode,
      ChildNode
    >({
      makePromptMessages: async (parent) => [
        { role: "system", content: "You are a test assistant" },
        {
          role: "user",
          content: `Generate children for parent: ${parent.data.name}`,
        },
      ],
      response: {
        schema: ChildDataSchema,
        name: "generate_children",
        description: "Generate child nodes",
      },
      // Filter out nodes with value > 50
      filterNodes: {
        filter: async (node) => node.value <= 50,
      },
    });

    // Generate children
    const parent = createParentNode();
    const llmOptions = createLlmOptions();
    const children = await generateChildren(parent, llmOptions);

    // Assertions
    expect(children).toHaveLength(1);
    expect(children[0].data.value).toBe(42);
  });

  it("should handle empty response", async () => {
    // Mock an empty response
    mockOpenAIClient.chat.completions.create.mockResolvedValueOnce({
      choices: [
        {
          message: {
            function_call: {
              arguments: JSON.stringify([]),
            },
          },
        },
      ],
    });

    const generateChildren = makeGenerateChildrenWithOpenAi<
      ParentNode,
      ChildNode
    >({
      makePromptMessages: async () => [
        { role: "system", content: "You are a test assistant" },
      ],
      response: {
        schema: ChildDataSchema,
        name: "generate_children",
        description: "Generate child nodes",
      },
    });

    const parent = createParentNode();
    const llmOptions = createLlmOptions();
    const children = await generateChildren(parent, llmOptions);

    expect(children).toHaveLength(0);
  });

  it("should handle API errors", async () => {
    // Mock an API error
    mockOpenAIClient.chat.completions.create.mockRejectedValueOnce(
      new Error("API Error")
    );

    const generateChildren = makeGenerateChildrenWithOpenAi<
      ParentNode,
      ChildNode
    >({
      makePromptMessages: async () => [
        { role: "system", content: "You are a test assistant" },
      ],
      response: {
        schema: ChildDataSchema,
        name: "generate_children",
        description: "Generate child nodes",
      },
    });

    const parent = createParentNode();
    const llmOptions = createLlmOptions();

    await expect(generateChildren(parent, llmOptions)).rejects.toThrow(
      "API Error"
    );
  });
});

describe("makeGenerateNChoiceChildrenWithOpenAi", () => {
  it("should generate multiple completions", async () => {
    // Mock multiple completions
    mockOpenAIClient.chat.completions.create.mockResolvedValueOnce({
      choices: [
        {
          message: {
            function_call: {
              arguments: JSON.stringify({
                value: 10,
              } satisfies ChildData),
            },
          },
        },
        {
          message: {
            function_call: {
              arguments: JSON.stringify({
                value: 20,
              } satisfies ChildData),
            },
          },
        },
      ],
    });

    const generateChildren = makeGenerateNChoiceChildrenWithOpenAi<
      ParentNode,
      ChildNode
    >({
      makePromptMessages: async (parent) => [
        { role: "system", content: "You are a test assistant" },
        {
          role: "user",
          content: `Generate choices for parent: ${parent.data.name}`,
        },
      ],
      response: {
        schema: ChildDataSchema,
        name: "generate_choice",
        description: "Generate a choice",
      },
      numCompletions: 2,
    });

    const parent = createParentNode();
    const llmOptions = createLlmOptions();
    const children = await generateChildren(parent, llmOptions);

    expect(mockOpenAIClient.chat.completions.create).toHaveBeenCalledTimes(1);
    expect(children).toHaveLength(2);
  });

  it("should apply filter to generated choices", async () => {
    mockOpenAIClient.chat.completions.create.mockResolvedValueOnce({
      choices: [
        {
          message: {
            function_call: {
              arguments: JSON.stringify({
                value: 10,
              } satisfies ChildData),
            },
          },
        },
        {
          message: {
            function_call: {
              arguments: JSON.stringify({
                value: 30,
              } satisfies ChildData),
            },
          },
        },
      ],
    });

    const generateChildren = makeGenerateNChoiceChildrenWithOpenAi<
      ParentNode,
      ChildNode
    >({
      makePromptMessages: async () => [
        { role: "system", content: "You are a test assistant" },
      ],
      response: {
        schema: ChildDataSchema,
        name: "generate_choice",
        description: "Generate a choice",
      },
      // Filter out nodes with value > 20
      filterNodes: {
        filter: async (node) => node.value <= 20,
      },
    });

    const parent = createParentNode();
    const llmOptions = createLlmOptions();
    const children = await generateChildren(parent, llmOptions);

    expect(children).toHaveLength(1);
    expect(children[0].data.value).toBe(10);
  });
});
