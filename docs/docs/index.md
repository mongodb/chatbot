---
title: Home
description: Build full-stack intelligent chatbot applications using MongoDB and Atlas Vector Search.
---

# MongoDB Chatbot Framework

:::warning[👷‍♂️ Work In Progress 👷‍♂️]

The MongoDB Chatbot Framework is under active development
and may undergo breaking changes.

We aim to keep the documentation up to date with the latest version.

:::

Build full-stack intelligent chatbot applications using MongoDB
and [Atlas Vector Search](https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-overview/).

The MongoDB Chatbot Framework is a set of libraries that you can use to build a
production-ready chatbot application. The framework provides first-class support
for retrieval augmented generation (RAG), and is extensible to support other
patterns for building intelligent chatbots.

The framework can take your chatbot application from prototype to production.

You can quickly get an AI chatbot enhanced with your data up and running using
the framework's built-in data ingest process, chatbot server, and web UI. As you
refine your application and scale to more users, you can modify the chatbot's
behavior to meet your needs.

The framework is flexible and customizable. It supports multiple AI models and
complex prompting strategies.

## How It Works

The MongoDB Chatbot Framework has the following core components:

- [MongoDB Atlas](./mongodb.md): Database for the application that stores content and conversation.
  Indexes content using Atlas Vector Search.
- [Ingest CLI](./ingest/configure.md): Configurable CLI application that you can use to ingest content into a MongoDB collection for use with Atlas Vector Search.
- [Chatbot Server](./server/configure.md): Express.js server routes that you can use to build a chatbot application.
- [Chatbot UI](./ui.md): React.js UI components that you can use to build a chatbot application.

## Quick Start

To get started using the MongoDB Chatbot Framework, refer to the [Quick Start](./quick-start.md) guide.

## Design Principles

The MongoDB Chatbot Framework is designed around the following principles:

- Composability: You can use components of the chatbot framework independently of each other.
  For example, we have some users who are using only our ingestion CLI to ingest content into MongoDB Atlas, but use other tools to build their chatbot and UI.
- Pluggability: You can plug in your own implementations of components.
  For example, you can plug in your own implementations of the `DataSource` interface
  to ingest content from different data sources.
- Inversion of Control: The framework makes decisions about boilerplate aspects
  of intelligent chatbot systems so that you can focus on building logic unique to your application.

## MongoDB Docs Chatbot

This framework is used to build the MongoDB Docs Chatbot, a RAG chatbot that answers questions about the MongoDB documentation. You can try it out on [mongodb.com/docs](https://www.mongodb.com/docs/).

Here's a reference architecture for how the MongoDB Chatbot Framework system works for the MongoDB Docs Chatbot.

Data ingestion:

![Data Ingestion Architecture](/img/ingest-diagram.webp)

Chat Server:

![Chat Server Architecture](/img/server-diagram.webp)

### How We Built It

- To learn more about how we built the chatbot, check out the MongoDB Developer Center blog post [Taking RAG to Production with the MongoDB Documentation AI Chatbot](https://www.mongodb.com/developer/products/atlas/taking-rag-to-production-documentation-ai-chatbot/).
