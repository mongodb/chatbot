import {
 ListResourcesRequestSchema,
 ReadResourceRequestSchema,
 ListResourceTemplatesRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { type Server } from "@modelcontextprotocol/sdk/server/index.js";
import { readFile } from "fs/promises";
import path from "path";

// Map of resource URIs to file paths - can be modified to add more resources
const resourceFilePaths: Record<string, string> = {
  "docs://vectorSearch": "../datasets/atlasVectorSearchSummary.md",
};

// Function to read the markdown file
const readMarkdownFile = async (uri: string): Promise<string> => {
  try {
    // Look up the file path based on the URI
    const relativePath = resourceFilePaths[uri];
    if (!relativePath) {
      throw new Error(`No file path mapping found for URI: ${uri}`);
    }
    
    const filePath = path.resolve(process.cwd(), relativePath);
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
     resources: [
       {
         uri: "docs://vectorSearch",
         name: "Atlas Vector Search Docs",
         description: "Condensed version of MongoDB's Atlas Vector Search documentation",
         mimeType: "text/markdown",
       },
     ],
   };
 });
 // Read resource contents
 server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;

  if (uri === "docs://vectorSearch") {
    const markdownContents = await readMarkdownFile(uri);
    return {
      contents: [
        {
          uri,
          mimeType: "text/markdown",
          text: markdownContents
        }
      ]
    };
  }

  throw new Error("Resource not found");
 });
};