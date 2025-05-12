import {
 ListResourcesRequestSchema,
 ReadResourceRequestSchema,
 ListResourceTemplatesRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { type Server } from "@modelcontextprotocol/sdk/server/index.js";
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const resourcesDir = path.join(__dirname, "../resources");

// Map of resource URIs to file paths with absolute paths
export const resourceFilePaths: Record<string, string> = {
  "docs://vector-search": path.join(resourcesDir, "vector-search.md"),
  "docs://atlas-cli": path.join(resourcesDir, "atlas-cli.md"),
  "docs://kotlin-coroutine": path.join(resourcesDir, "kotlin-coroutine-driver.md"),
};

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
     resources: [
       {
         uri: "docs://vector-search",
         name: "Atlas Vector Search Docs",
         description: "Documentation for MongoDB Atlas Vector Search",
         mimeType: "text/markdown",
       },
       {
        uri: "docs://atlas-cli",
        name: "Atlas CLI Docs",
        description: "Documentation for the MongoDB Atlas CLI",
        mimeType: "text/markdown",
       },
       {
        uri: "docs://kotlin-coroutine",
        name: "Kotlin Coroutine Driver Docs",
        description: "Documentation for the MongoDB Kotlin Coroutine Driver",
        mimeType: "text/markdown",
       }
     ],
   };
 });
 // Read resource contents
 server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;

  if (uri === "docs://vector-search" || uri === "docs://atlas-cli" || uri === "docs://kotlin-coroutine") {
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