# MongoDB MCP Server

This package implements a Model Context Protocol (MCP) server for MongoDB, allowing LLMs to interact with MongoDB databases and resources.

## What is MCP?

The Model Context Protocol (MCP) is an open protocol that standardizes how applications provide context to Large Language Models (LLMs). It's often described as a "USB-C port for AI applications" - providing a standardized way to connect AI models to different data sources and tools.

## Features

- Standardized interface for LLMs to access MongoDB data
- Tool-based architecture for executing MongoDB operations
- Secure access to MongoDB resources
- **Advanced prompts for MongoDB query generation**

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 8

### Installation

```bash
npm install
```

### Building

```bash
npm run build
```

### Running

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

## Usage

This MCP server can be used with any MCP-compatible client, such as Claude Desktop, IDEs with MCP support, or custom applications using the MCP client libraries.

## MongoDB Prompts

The server includes specialized prompts to help LLMs generate MongoDB queries, aggregations, and more:

### Query Generation

Generate MongoDB queries from natural language descriptions:

```javascript
// Example usage
const queryPrompt = promptService.executeMongoDBQueryPrompt(
  'Find all users over 30 years old who live in New York',
  'users',
  userSchema
);
```

### Aggregation Pipeline Generation

Generate MongoDB aggregation pipelines from natural language descriptions:

```javascript
// Example usage
const aggregationPrompt = promptService.executeMongoDBAggrPrompt(
  'Group users by country and calculate the average age for each group',
  'users',
  userSchema
);
```

### Update Operation Generation

Generate MongoDB update operations from natural language descriptions:

```javascript
// Example usage
const updatePrompt = promptService.executeMongoDBUpdatePrompt(
  'Update the status to "inactive" for all users who haven\'t logged in for 30 days',
  'users',
  userSchema
);
```

### Schema Design

Generate MongoDB schema designs based on requirements:

```javascript
// Example usage
const schemaDesignPrompt = promptService.executeMongoDBSchemaDesignPrompt(
  'Design a schema for a blog application with posts, comments, and users'
);
```

### Index Recommendations

Generate MongoDB index recommendations based on query patterns:

```javascript
// Example usage
const indexRecommendationPrompt = promptService.executeMongoDBIndexRecommendationPrompt(
  'Users are frequently queried by email and username, and sometimes filtered by age',
  'users',
  userSchema
);
```

## License

ISC
