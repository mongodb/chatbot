# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is the MongoDB Knowledge Service/Chatbot monorepo, managed with Lerna in independent mode. The project provides AI-powered chatbot functionality for MongoDB documentation and services.

**Key Architecture:**
- Monorepo with TypeScript packages managed by Lerna
- RAG (Retrieval-Augmented Generation) system for document search
- React UI components with Express.js backend
- MongoDB Atlas for vector storage and search
- OpenAI/LLM integration for chat responses

## Essential Commands

### Development
```bash
# Initial setup
npm install
npm run bootstrap

# Start development servers (server + UI with hot reload)
npm run dev

# Individual development servers
npm run dev:server    # chatbot-server-mongodb-public only
npm run dev:ui        # mongodb-chatbot-ui only
```

### Building
```bash
# Build all packages
npm run build

# Build specific packages
npm run build -- --scope='{mongodb-rag-core,chatbot-server-mongodb-public}'

# Build mongodb-rag-core first (required dependency for most packages)
cd packages/mongodb-rag-core && npm run build
```

### Testing & Quality
```bash
# Run all tests
npm run test

# Lint all packages
npm run lint
npm run lint:fix

# Individual package testing
cd packages/<package-name> && npm test
```

### Scripts & Utilities
```bash
# Analysis scripts
npm run scripts:analyzeMessages
npm run scripts:findFaq
npm run scripts:getConversationText

# Database management
npm run scripts:removeTestDatabases

# Server management
npm run server:start
```

## Package Structure

### Core Libraries
- **mongodb-rag-core**: Shared utilities, types, and functions. Must be built first.
- **mongodb-rag-ingest**: CLI for ingesting documents into vector store
- **mongodb-chatbot-server**: Generic Express.js chatbot server
- **mongodb-chatbot-ui**: React UI components (built with Leafygreen/Vite)

### Implementations
- **ingest-mongodb-public**: MongoDB-specific ingestion service
- **chatbot-server-mongodb-public**: MongoDB-specific server implementation

### Tools & Scripts
- **mongodb-artifact-generator**: CLI for generating docs and code examples
- **scripts**: Miscellaneous utility scripts
- **benchmarks**: Performance evaluation and testing
- **datasets**: Data management for training/evaluation

## Development Workflow

1. **Environment Setup**: Each package requires `.env` file (see `.env.example`)
2. **Build Dependencies**: Always build `mongodb-rag-core` first
3. **Network Access**: MongoDB corporate network/VPN required for many services
4. **Testing**: Run tests locally before committing
5. **Branches**: Use Jira ticket names (e.g., `DOCSP-1234`) or descriptive names

## Key Implementation Details

- **Dependency Chain**: Most packages depend on `mongodb-rag-core`
- **Vector Search**: Uses MongoDB Atlas Vector Search for document retrieval
- **LLM Integration**: OpenAI API integration with custom prompts and tools
- **Evaluation**: Braintrust integration for benchmarking and evaluation
- **CI/CD**: Drone pipeline with Kubernetes/Kanopy deployment

## Testing Strategy

- Unit tests with Jest in individual packages
- Integration tests for chatbot functionality
- Performance testing with k6 framework

## Evaluation Strategy
- Use `braintrust` library imported from `mongodb-rag-core/braintrust`
- Evalutions using files named `*.eval.ts`
- Evaluation pipelines for conversation quality

## Common Issues

- Build `mongodb-rag-core` after any changes to it
- Ensure VPN connection for MongoDB services
- Check `.env` files match `.env.example` requirements
- Run `npm run bootstrap` after dependency changes