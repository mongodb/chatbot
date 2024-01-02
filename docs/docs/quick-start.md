# Quick Start

:::info[👷‍♂️ Work in Progress 👷‍♂️]

The Quick Start is currently very bare bones. We're working on improving it.

:::

This quick start guide walks you through the steps to get started building
a RAG application with the MongoDB Chatbot Framework.

## Prerequisites

- [Node.js](https://nodejs.org/en/) v18 or later

## Steps

1. Set up the [RAG MongoDB Atlas database](./mongodb.md).
2. Ingest content into the database using the [Ingest CLI](./ingest/configure.md).
3. Configure and run the [Chatbot Server](./server/configure.md).
   - Note: You can query the server using curl or Postman if you want.
4. Add the [Chatbot UI](./ui.md) to a React app. Query the server from your frontend.
