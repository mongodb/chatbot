import {
  GetPromptRequestSchema,
  GetPromptResult,
  ListPromptsRequestSchema,
  ListPromptsResult,
} from "@modelcontextprotocol/sdk/types.js";
import { type Server } from "@modelcontextprotocol/sdk/server/index.js";
import path from "path";
import fs from "fs";
import { staticDirPath } from "./staticDirPath.js";

const promptsDir = path.join(staticDirPath, "prompts");

function makePromptMessages(promptPath: string): GetPromptResult["messages"] {
  return [
    {
      role: "assistant",
      content: {
        type: "text",
        text: fs.readFileSync(promptPath, "utf8"),
      },
    },
  ];
}

const prompts = {
  "data-modeling": {
    name: "data-modeling",
    description: "Best practices for MongoDB data modeling",
    messages: makePromptMessages(path.join(promptsDir, "data-modeling.md")),
  },
  indexing: {
    name: "indexing",
    description: "Best practices for MongoDB indexing",
    messages: makePromptMessages(path.join(promptsDir, "indexing.md")),
  },
  querying: {
    name: "querying",
    description:
      "Best practices for querying a MongoDB database. Finding data, aggregation, etc.",
    messages: makePromptMessages(path.join(promptsDir, "querying.md")),
  },
  security: {
    name: "security",
    description:
      "Best practices for MongoDB security, focusing on MongoDB Atlas",
    messages: makePromptMessages(path.join(promptsDir, "security.md")),
  },
} satisfies Record<string, GetPromptResult>;
const promptNames = new Set<string>(Object.keys(prompts));

export const registerPrompts = (server: Server): void => {
  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return {
      prompts: Object.values(prompts).map(({ name, description }) => ({
        name,
        description,
      })),
    } satisfies ListPromptsResult;
  });
  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name } = request.params;

    if (!promptNames.has(name)) {
      throw new Error(`Prompt not found: ${name}`);
    }

    return prompts[name as keyof typeof prompts];
  });
};
