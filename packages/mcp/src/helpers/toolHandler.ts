import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readMarkdownFile } from "./resourceHandler.js";
import { type Server } from "@modelcontextprotocol/sdk/server/index.js";
import { guidesResources } from "./resourceHandler.js";

// Available documentation guides
const docsGuides = guidesResources.map((guide) => guide.id);

// Define argument types
type UseGuidesArgs = {
  docsGuide: (typeof docsGuides)[number];
};

// Tool definitions
export const tools = {
  "list-guides": {
    name: "list-guides",
    description:
      "List available documentation guides for a specific MongoDB topic",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  "use-guides": {
    name: "use-guides",
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

  const uri = `docs://${docsGuide}`;
  const markdownContents = await readMarkdownFile(uri);

  return {
    content: [
      {
        type: "text",
        text: markdownContents,
      },
    ],
  };
};

// Tool handlers
export const toolHandlers = {
  "list-guides": listGuides,
  "use-guides": useGuides,
};

// Register the tools with the server
export const registerTools = (server: Server): void => {
  // This handler responds to the ListTools request
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    console.error("ListTools request received, returning tools");
    return {
      tools: Object.values(tools),
    };
  });

  // This handler responds to the CallTool request
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: params } = request.params ?? {};
    console.error(`CallTool request received for tool: ${name}`);

    if (!name) throw new Error("Tool name is required");

    if (name === "list-guides") {
      console.error("Executing list-guides tool");
      return toolHandlers["list-guides"]();
    } else if (name === "use-guides") {
      console.error(
        `Executing use-guides tool with params: ${JSON.stringify(params)}`
      );
      return toolHandlers["use-guides"](params as UseGuidesArgs);
    } else {
      throw new Error(`Tool not found: ${name}`);
    }
  });
};
