import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  Tool,
  CallToolResult,
  ListToolsResult,
} from "@modelcontextprotocol/sdk/types.js";
import { type Server } from "@modelcontextprotocol/sdk/server/index.js";
import { guidesResources } from "./resources.js";
import { FindContentFunc, PageStore } from "mongodb-rag-core";
import { strict as assert } from "assert";

// Available documentation guides
const docsGuides = guidesResources.map((guide) => guide.id);

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

type UseGuidesArgs = {
  docsGuide: (typeof docsGuides)[number];
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

interface GetPageArgs {
  url: string;
}
const makeGetPage = (pageStore: PageStore) => async (args: GetPageArgs) => {
  if (!args.url) throw new Error("Must provide the URL of the page to get.");

  const { url } = args;

  const [page] = await pageStore.loadPages({
    query: {
      url,
    },
  });
  if (!page) {
    throw new Error(`Page not found: ${url}`);
  }

  return {
    content: [
      {
        type: "text",
        text: `url: ${page.url}
title: ${page.title}
---
${page.body}`,
      },
    ],
  } satisfies CallToolResult;
};

interface SearchContentArgs {
  query: string;
}
const makeSearchContent =
  (findContent: FindContentFunc) => async (args: SearchContentArgs) => {
    if (!args.query) throw new Error("Must provide a search query.");

    const { query } = args;

    const { content } = await findContent({
      query,
    });
    if (!content) {
      throw new Error(`Content not found: ${query}`);
    }

    const returnedContent = content.map(({ text, url }) => {
      return {
        url,
        text,
      };
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(returnedContent),
        },
      ],
    } satisfies CallToolResult;
  };

// Tool definitions + handlers
export const makeTools = ({
  pageStore,
  findContent,
}: {
  pageStore: PageStore;
  findContent: FindContentFunc;
}) => {
  return {
    "list-guides": {
      definition: {
        name: "list-guides",
        description:
          `List available MongoDB documentation guides.
    
           Use this tool when you receive a question or task related to MongoDB 
           or its products (e.g. MongoDB Atlas). This tool lists available documentation 
           guides for a specific MongoDB topic. Then, use the 'use-guides' tool to 
           retrieve up-to-date, accurate information.`,
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
    "get-page": {
      definition: {
        name: "get-page",
        description:
          "Get a specific page of documentation for a specific MongoDB topic.",
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
      handler: makeGetPage(pageStore),
    },
    "search-content": {
      definition: {
        name: "search-content",
        description: "Search the MongoDB documentation for a specific topic.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description:
                "Search query to use to search the MongoDB documentation",
            },
          },
          required: ["query"],
        },
      },
      handler: makeSearchContent(findContent),
    },
  } satisfies Record<string, { definition: Tool; handler: (args: any) => any }>;
};

// Register the tools with the server
export const registerTools = (
  server: Server,
  pageStore: PageStore,
  findContent: FindContentFunc
): void => {
  const tools = makeTools({ pageStore, findContent });
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
      const docsGuide = params?.docsGuide;
      assert(
        typeof docsGuide === "string" &&
          docsGuides.includes(docsGuide as UseGuidesArgs["docsGuide"]),
        `Docs guide must be one of the following: ${docsGuides.join(", ")}`
      );
      return tools["use-guide"].handler({
        docsGuide: docsGuide as UseGuidesArgs["docsGuide"],
      });
    } else if (name === "get-page") {
      console.log(
        `Executing get-page tool with params: ${JSON.stringify(params)}`
      );
      const url = params?.url;
      assert(typeof url === "string", "URL is required for get-page tool");
      return tools["get-page"].handler({ url });
    } else if (name === "search-content") {
      console.log(
        `Executing search-content tool with params: ${JSON.stringify(params)}`
      );
      const query = params?.query;
      assert(
        typeof query === "string",
        "Query is required for search-content tool"
      );
      return tools["search-content"].handler({ query });
    } else {
      throw new Error(`Tool not found: ${name}`);
    }
  });
};
