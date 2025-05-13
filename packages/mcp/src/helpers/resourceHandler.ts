import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { type Server } from "@modelcontextprotocol/sdk/server/index.js";
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const resourcesDir = path.join(__dirname, "../resources");

export const guidesResources = [
  {
    id: "vector-search",
    name: "Atlas Vector Search",
    description: "Guide for MongoDB Atlas Vector Search",
    mimeType: "text/markdown",
    uri: "docs://vector-search",
  },
  {
    id: "atlas-cli",
    name: "Atlas CLI",
    description: "Guide for the MongoDB Atlas CLI",
    mimeType: "text/markdown",
    uri: "docs://atlas-cli",
  },
  {
    id: "kotlin-coroutine",
    name: "Kotlin Coroutine Driver",
    description: "Guide for the MongoDB Kotlin Coroutine Driver",
    mimeType: "text/markdown",
    uri: "docs://kotlin-coroutine",
  },
  {
    id: "data-modeling",
    name: "Data Modeling",
    description: "Guide for MongoDB Data Modeling",
    mimeType: "text/markdown",
    uri: "docs://data-modeling",
  },
] as const;

const guideUris = new Set<string>(guidesResources.map((guide) => guide.uri));

// Map of resource URIs to file paths with absolute paths
export const resourceFilePaths: Record<string, string> = guidesResources.reduce(
  (acc, guide) => {
    acc[guide.uri] = path.join(resourcesDir, `${guide.id}.md`);
    return acc;
  },
  {} as Record<string, string>
);

// Function to read the markdown file
export const readMarkdownFile = async (uri: string): Promise<string> => {
  try {
    // Look up the file path based on the URI (now absolute path)
    const filePath = resourceFilePaths[uri];
    if (!filePath) {
      throw new Error(`No file path mapping found for URI: ${uri}`);
    }

    return await readFile(filePath, "utf-8");
  } catch (error) {
    console.error("Error reading markdown file:", error);
    throw new Error("Failed to read markdown file");
  }
};

export const registerResources = (server: Server): void => {
  // List available resources when clients request them
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
      resources: guidesResources,
    };
  });
  // Read resource contents
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const uri = request.params.uri;

    if (guideUris.has(uri)) {
      const markdownContents = await readMarkdownFile(uri);
      return {
        contents: [
          {
            uri,
            mimeType: "text/markdown",
            text: markdownContents,
          },
        ],
      };
    }

    throw new Error("Resource not found");
  });
};
