# MongoDB Education MCP Server

A Model Context Protocol (MCP) server implementation for MongoDB documentation.

## Overview

This package provides a Model Context Protocol server that offers tools for interacting with MongoDB documentation. It allows AI assistants to:

- List and access documentation guides
- Fetch specific documentation pages
- Search content across MongoDB documentation

## Features

- **Documentation Tools**: Access MongoDB resources via MCP tools
- **Integration with Model Context Protocol**: Compatible with AI assistants that support MCP
- **MongoDB RAG Support**: Uses MongoDB RAG Core for retrieval functionality

## Prerequisites

First, complete the steps in the [Contributor guide](https://github.com/mongodb/chatbot/blob/main/CONTRIBUTING.md#bootstrapping).

## Installation

In the `mcp` project root, run:

```bash
# Install dependencies
npm install

# Build the project
npm run build
```

To start the server, run the following command at 
the root of the chatbot project. This creates a development build:

```
npm run dev
```

# Connect to AI Clients.

Then, configure your AI client like Claude, Copilot, Cursor, etc. to use the server.

For example:

```
{
  "mcpServers": {
   "mongodb-education": {
      "command": "node",
        "args": [
         "<path-to-file>/chatbot/packages/mcp/build/index.js"
        ]
    }
  }
}
```

## Available Tools

The server provides the following MCP tools:

### `list-guides`

Lists all available MongoDB documentation guides.

### `use-guide`

Retrieves a specific documentation guide.

**Parameters:**
- `docsGuide`: The ID of the guide to retrieve (e.g., "atlas-get-started", "data-modeling")

### `get-page`

Fetches a specific MongoDB documentation page by URL.

**Parameters:**
- `url`: URL of the page to retrieve

### `search-content`

Searches for content in MongoDB documentation.

**Parameters:**
- `searchQuery`: Search query string

## Project Structure

```
├── src/                  # TypeScript source code
│   ├── index.ts          # Entry point
│   ├── logPath.ts        # Logging configuration
│   └── handlers/         # MCP request handlers
│       ├── prompts.ts    # Prompt handling
│       ├── resources.ts  # Resource definitions
│       ├── tools.ts      # Tool implementations
│       └── staticDirPath.ts
├── static/               # Static resources
│   ├── prompts/          # Prompt templates
│   └── resources/        # Documentation resources
├── build/                # Compiled JavaScript output
└── package.json          # Project metadata and dependencies
```

## Dependencies

- `@modelcontextprotocol/sdk`: MCP server implementation
- `mongodb-rag-core`: MongoDB RAG functionality
- `yargs-parser`: Command-line argument parsing
- `dotenv`: Environment variable management

## Development

After making changes to TypeScript files, rebuild the project:

```bash
npm run build
```