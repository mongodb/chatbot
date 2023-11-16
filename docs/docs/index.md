# MongoDB RAG Framework

Build full stack retrieval augmented generation (RAG) applications using MongoDB
and [Atlas Vector Search](https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-overview/).

This framework is used to build the MongoDB Docs Chatbot, a RAG chatbot that answers questions about the MongoDB documentation. You can try it out on [mongodb.com/docs](https://www.mongodb.com/docs/).

## How It Works

The MongoDB RAG Framework has the following core components:

- [Ingest CLI](./ingest.md): Configurable CLI application that you can use to ingest content into a MongoDB collection for use with Atlas Vector Search.
- [Chat Server](./server.md): Express.js server routes that you can use to build a chatbot application.
- [Chat UI](./ui.md): React.js UI components that you can use to build a chatbot application.

## Architecture

Here's a reference architecture for how the MongoDB RAG system works for the MongoDB Docs Chatbot.

Data ingestion:

![Data Ingestion Architecture](/img/ingest-diagram.webp)

Chat Server:

![Chat Server Architecture](/img/server-diagram.webp)

## How We Built It

- To learn more about how we built the chatbot, check out the MongoDB Developer Center blog post [Taking RAG to Production with the MongoDB Documentation AI Chatbot](https://www.mongodb.com/developer/products/atlas/taking-rag-to-production-documentation-ai-chatbot/).
