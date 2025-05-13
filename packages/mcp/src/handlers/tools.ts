import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  Tool,
  CallToolResult,
  ListToolsResult,
} from "@modelcontextprotocol/sdk/types.js";
import { type Server } from "@modelcontextprotocol/sdk/server/index.js";
import { guidesResources } from "./resources.js";

// Available documentation guides
const docsGuides = guidesResources.map((guide) => guide.id);

// Define argument types
type UseGuidesArgs = {
  docsGuide: (typeof docsGuides)[number];
};

const listGuides = () => {
  return {
    content: [
      {
        type: "text",
        text: `Available documentation guides:
${guidesResources
  .map(
    (guide, i) =>
      `${i + 1}. ${guide.id}: ${guide.name}. ${guide.description ?? ""}`
  )
  .join("\n")}`,
      },
    ],
  };
};

const useGuides = async (args: UseGuidesArgs) => {
  if (!args.docsGuide)
    throw new Error("Must provide the documentation guide to use.");

  const { docsGuide } = args;
  if (!docsGuides.includes(docsGuide)) {
    throw new Error(
      `Docs guide must be one of the following: ${docsGuides.join(", ")}`
    );
  }
  const guide = guidesResources.find((guide) => guide.id === docsGuide)?.guide;
  if (!guide) {
    throw new Error(`Guide not found: ${docsGuide}`);
  }

  return {
    content: [
      {
        type: "text",
        text: guide,
      },
    ],
  } satisfies CallToolResult;
};

// Tool definitions + handlers
export const tools = {
  "list-guides": {
    definition: {
      name: "list-guides",
      description:
        "List available documentation guides for a specific MongoDB topic.",
      inputSchema: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    handler: listGuides,
  },
  "use-guide": {
    definition: {
      name: "use-guide",
      description:
        "Complete a specific task using the provided MongoDB documentation guides",
      inputSchema: {
        type: "object",
        properties: {
          docsGuide: {
            type: "string",
            enum: docsGuides,
            description:
              "Documentation guide to use to answer a question or complete a task",
          },
        },
        required: ["docsGuide"],
      },
    },
    handler: useGuides,
  },
} satisfies Record<string, { definition: Tool; handler: (args: any) => any }>;

// Register the tools with the server
export const registerTools = (server: Server): void => {
  // This handler responds to the ListTools request
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    console.log("ListTools request received, returning tools");
    return {
      tools: Object.values(tools).map((tool) => tool.definition),
    } satisfies ListToolsResult;
  });

  // This handler responds to the CallTool request
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: params } = request.params ?? {};
    console.log(`CallTool request received for tool: ${name}`);

    if (!name) throw new Error("Tool name is required");

    if (name === "list-guides") {
      console.log("Executing list-guides tool");
      return tools["list-guides"].handler();
    } else if (name === "use-guide") {
      console.log(
        `Executing use-guide tool with params: ${JSON.stringify(params)}`
      );
      return tools["use-guide"].handler(params as UseGuidesArgs);
    } else {
      throw new Error(`Tool not found: ${name}`);
    }
  });
};
