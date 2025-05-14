import axios from "axios";
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
import fs from "fs";
import { logPath } from "../logPath.js";
import { logger } from "mongodb-rag-core";

// Suppress all logs from mongodb-rag-core
logger.level = "silent";

console.log = () => {
  return;
};
console.info = () => {
  return;
};
console.warn = () => {
  return;
};
console.error = () => {
  return;
};

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
const makeGetPage =
  (serverBaseUrl = "http://localhost:3000") =>
  async (args: GetPageArgs) => {
    if (!args.url) throw new Error("Must provide the URL of the page to get.");

    const { url } = args;

    const endpointObj = new URL(`${serverBaseUrl}/content/page`);
    endpointObj.searchParams.append("url", url);

    const { data: page } = await axios.get<{
      url: string;
      title: string;
      body: string;
    }>(endpointObj.toString());
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
  searchQuery: string;
}
const makeSearchContent =
  (serverBaseUrl = "http://localhost:3000") =>
  async (args: SearchContentArgs) => {
    if (!args.searchQuery) throw new Error("Must provide a search query.");

    const { searchQuery } = args;
    try {
      // const content: { text: string; url: string }[] = [];
      // Write to a log file instead of console.error to avoid interfering with JSON-RPC
      fs.appendFileSync(logPath, `Query: ${searchQuery}\n`);

      // Create URL object for better parameter handling
      const url = new URL(`${serverBaseUrl}/content/search`);
      url.searchParams.append("q", searchQuery);

      // Log the URL we're fetching
      fs.appendFileSync(logPath, `Fetching URL: ${url.toString()}\n`);

      let returnedContent: { url: string; text: string }[] = [];

      try {
        const res = await axios(url.toString());

        // Log the response status
        fs.appendFileSync(
          logPath,
          `Response status: ${res.status} ${res.statusText}\n`
        );

        if (res.status !== 200) {
          throw new Error(
            `Status not 200. It's ${res.status} ${res.statusText}`
          );
        }

        // Try to get the response text first for debugging
        returnedContent = await res.data;
        fs.appendFileSync(logPath, `Response text: ${returnedContent}\n`);
      } catch (error) {
        const fetchError = error as Error;
        fs.appendFileSync(logPath, `Fetch error: ${fetchError.message}\n`);
        throw fetchError;
      }

      fs.appendFileSync(logPath, JSON.stringify(returnedContent));

      const formattedResults =
        returnedContent.length > 0
          ? `Found ${returnedContent.length} results:\n\n${returnedContent
              .map(
                (item) => `<result>
<url>${item.url}</url>
<text>
${item.text}
</text>
</result>`
              )
              .join("\n\n")}`
          : `No results found for query: ${searchQuery}`;

      return {
        content: [
          {
            type: "text",
            text: formattedResults,
          },
        ],
      } satisfies CallToolResult;
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error searching content: ${error}`,
          },
        ],
      } satisfies CallToolResult;
    }
  };

// Tool definitions + handlers
export const makeTools = (serverBaseUrl = "http://localhost:3000") => {
  return {
    "list-guides": {
      definition: {
        name: "list-guides",
        description: `List available MongoDB documentation guides.
    
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
            url: {
              type: "string",
              description:
                "URL of the page to get. This should be a URL to a MongoDB documentation page.",
            },
          },
          required: ["url"],
        },
      },
      handler: makeGetPage(serverBaseUrl),
    },
    "search-content": {
      definition: {
        name: "search-content",
        description: "Search the MongoDB documentation for a specific topic.",
        inputSchema: {
          type: "object",
          properties: {
            searchQuery: {
              type: "string",
              description:
                "Search query to use to search the MongoDB documentation",
            },
          },
          required: ["searchQuery"],
        },
      },
      handler: makeSearchContent(serverBaseUrl),
    },
  } satisfies Record<string, { definition: Tool; handler: (args: any) => any }>;
};

// Register the tools with the server
export const registerTools = (
  server: Server,
  serverBaseUrl = "http://localhost:3000"
): void => {
  const tools = makeTools(serverBaseUrl);
  // This handler responds to the ListTools request
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    // Log to file instead of console.error
    fs.appendFileSync(logPath, "ListTools request received, returning tools\n");
    return {
      tools: Object.values(tools).map((tool) => tool.definition),
    } satisfies ListToolsResult;
  });

  // This handler responds to the CallTool request
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: params } = request.params ?? {};
    // Log to file instead of console.error
    fs.appendFileSync(logPath, `CallTool request received for tool: ${name}\n`);
    fs.appendFileSync(logPath, `Params: ${JSON.stringify(params)}\n`);

    if (!name) throw new Error("Tool name is required");

    if (name === "list-guides") {
      fs.appendFileSync(logPath, "Executing list-guides tool\n");
      return tools["list-guides"].handler();
    } else if (name === "use-guide") {
      fs.appendFileSync(
        logPath,
        `Executing use-guide tool with params: ${JSON.stringify(params)}\n`
      );
      const docsGuide = params?.docsGuide;
      assert(
        typeof docsGuide === "string" &&
          docsGuides.includes(docsGuide as UseGuidesArgs["docsGuide"]),
        `Docs guide must be one of the following: ${docsGuides.join(", ")}`
      );
      return await tools["use-guide"].handler({
        docsGuide: docsGuide as UseGuidesArgs["docsGuide"],
      });
    } else if (name === "get-page") {
      fs.appendFileSync(
        logPath,
        `Executing get-page tool with params: ${JSON.stringify(params)}\n`
      );
      const url = params?.url;
      assert(typeof url === "string", "URL is required for get-page tool");
      return tools["get-page"].handler({ url });
    } else if (name === "search-content") {
      // Log to file instead of console.error to avoid interfering with JSON-RPC
      fs.appendFileSync(logPath, "searching...\n");
      fs.appendFileSync(
        logPath,
        `Executing search-content tool with params: ${JSON.stringify(params)}\n`
      );
      const searchQuery = params?.searchQuery;
      fs.appendFileSync(logPath, `Query: ${searchQuery}\n`);
      assert(
        typeof searchQuery === "string",
        "Query is required for search-content tool"
      );
      const searchContent = makeSearchContent(serverBaseUrl);
      const results = (await searchContent({
        searchQuery,
      })) satisfies CallToolResult;
      fs.appendFileSync(logPath, `Results: ${JSON.stringify(results)}\n`);
      return results;
    } else {
      throw new Error(`Tool not found: ${name}`);
    }
  });
};
