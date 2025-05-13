import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { type Server } from "@modelcontextprotocol/sdk/server/index.js";
import path from "path";
import fs from "fs";
import { staticDirPath } from "./staticDirPath.js";

const resourcesDir = path.join(staticDirPath, "resources");

export const guidesResources = [
  {
    id: "atlas-clusters",
    name: "MongoDB Atlas Clusters",
    description: "Guide for general information about creating and managing Atlas Clusters, including common issues, configuration, security, and more.",
    mimeType: "text/markdown",
    uri: "docs://atlas-clusters",
    guide: fs.readFileSync(path.join(resourcesDir, "atlas-clusters.md"), "utf8"),
  },
  {
    id: "data-modeling",
    name: "MongoDB Data Modeling",
    description: "Guide for MongoDB data modeling best practices and patterns.",
    mimeType: "text/markdown",
    uri: "docs://data-modeling",
    guide: fs.readFileSync(path.join(resourcesDir, "data-modeling.md"), "utf8"),
  },
  {
    id: "atlas-cli",
    name: "Atlas CLI",
    description: "Guide for working with MongoDB Atlas from the command line using the Atlas CLI",
    mimeType: "text/markdown",
    uri: "docs://atlas-cli",
    guide: fs.readFileSync(path.join(resourcesDir, "atlas-cli.md"), "utf8"),
  },
  {
    id: "vector-search",
    name: "Atlas Vector Search",
    description: "Guide for MongoDB Atlas Vector Search",
    mimeType: "text/markdown",
    uri: "docs://vector-search",
    guide: fs.readFileSync(path.join(resourcesDir, "vector-search.md"), "utf8"),
  },
  {
    id: "ai-integrations",
    name: "AI Integrations",
    description: "Guide for generative AI integrations with Atlas Vector Search and popular AI frameworks and platforms.",
    mimeType: "text/markdown",
    uri: "docs://atlas-cli",
    guide: fs.readFileSync(path.join(resourcesDir, "ai-integrations.md"), "utf8"),
  },
  {
    id: "atlas-stream-processing",
    name: "Atlas Stream Processing",
    description: "Guide for MongoDB Atlas Stream Processing",
    mimeType: "text/markdown",
    uri: "docs://atlas-stream-processing",
    guide: fs.readFileSync(
      path.join(resourcesDir, "atlas-stream-processing.md"),
      "utf8"
    ),
  },
  {
    id: "kotlin-coroutine-driver",
    name: "Kotlin Coroutine Driver",
    description: "Guide for the MongoDB Kotlin Coroutine Driver",
    mimeType: "text/markdown",
    uri: "docs://kotlin-coroutine-driver",
    guide: fs.readFileSync(
      path.join(resourcesDir, "kotlin-coroutine-driver.md"),
      "utf8"
    ),
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
      const guide = guidesResources.find((guide) => guide.uri === uri)?.guide;
      if (!guide) {
        throw new Error(`Guide not found: ${uri}`);
      }
      return {
        contents: [
          {
            uri,
            mimeType: "text/markdown",
            text: guide,
          },
        ],
      };
    }

    throw new Error("Resource not found");
  });
};
