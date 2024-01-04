# Quick Start

This quick start guide walks you through the steps to get started building
a retrieval augmented generation (RAG) application with the MongoDB Chatbot Framework.

## Prerequisites

- [Node.js](https://nodejs.org/en/) v18 or later on your development machine.
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account.
  - If you don't already have an account, you can create one for free.
- [OpenAI API key](https://platform.openai.com/docs/quickstart?context=node).
  - Get the API key from OpenAI, and keep it handy. You'll need it later.

## What You Will Build

In this guide, you will build a chatbot that answers questions about
the MongoDB Chatbot Framework using RAG.
You can extend what you set up in the quick start template
to build your own chatbot with the MongoDB Chatbot Framework.

To build the chatbot, you will:

1. Set up the MongoDB Atlas Database with Atlas Vector Search
1. Set up the project source code.
1. Create an `.env` file
1. Ingest the content that the chatbot uses to answer questions
1. Spin up a server and frontend to query the chatbot

## Steps

### 1. Set up the MongoDB Atlas Database

Log into MongoDB Atlas and create a new project. Create a new cluster in the project.
You can use the free tier cluster (M0). You **cannot** use a serverless cluster.

In the Atlas UI, create the database `mongodb-chatbot-framework-chatbot` with a collection `embedded_content`. You can leave the collection empty for now.
TODO: refine and add link

Create an Atlas Vector Search Index wih the default name `vector-index` on the `embedded_content` collection.
TODO: Expand with more details + link to Atlas docs

Use the following index definition for the `vector-index` index:

```json
{
  "fields": [
    {
      "numDimensions": 1536,
      "path": "embedding",
      "similarity": "cosine",
      "type": "vector"
    }
  ]
}
```

For more information on setting up MongoDB for the Chatbot Framework,
refer to the [MongoDB & Atlas Vector Search](./mongodb.md) guide.

### 2. Set up the Project

Clone the repository with the quick start source code:

```shell
git clone https://github.com/mongodb/chatbot.git
```

Enter the directory with the quick start source code:

```shell
cd examples/quick-start
```

All the remaining steps will be run from `examples/quick-start` directory.

This directory contains three packages, located in the `examples/quick-start/packages`:

- `ingest`: Contains implementation of the MongoDB Ingest CLI, which ingests the content that the chatbot uses to answer questions.
- `server`: Contains implementation of the MongoDB Chatbot Server, which serves the chatbot API.
- `ui`: Contains implementation of the MongoDB Chatbot UI, which provides a UI to query the chatbot server.

Install the dependencies for all the packages:

```shell
npm install
```

:::note

The quick start uses [npm workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces)
to manage the dependencies for all the packages.

:::

Create an `.env` file based on the .env.example file in the root of the project:

```shell
cp .env.example .env
```

In the `.env` file, fill in the values for `MONGODB_CONNECTION_URI` and `OPENAI_API_KEY`
with you Atlas connection URI and OpenAI API Key, respectively.

### 3. Ingest Content

In this step, you will ingest the content that the chatbot uses to answer questions
into the `embedded_content` collection indexed with Atlas Vector Search.

From the root of the project, run:

```shell
npm run ingest:all
```

If you've run the command successfully, you should an output resembling the following
in your terminal:

```shell
TODO: add output
```

To learn more about how you can configure the MongoDB Ingest CLI,
refer to the [Configure the Ingest CLI](./ingest/configure.md) guide.

### 4. Query the Chatbot

TODO: preface

Start the chatbot server and UI with:

```shell
npm run dev
```

Open http://localhost:5173/ in your browser to see the UI.
You can ask the chatbot questions and see the responses.

You can also query the server directly with curl:

```shell
curl -X POST http://localhost:3000/api/vi/conversations/
```

To learn more about how you can configure the MongoDB Chatbot Server,
refer to the [Configure the Chatbot Server](./server/configure.md) guide.

To learn more about how you can configure the MongoDB Chatbot UI,
refer to the [Chatbot UI](./ui.md) guide.

### 5. Explore and Modify the Code

TODO: add ...

- Mention entry points for each package that user can customize.

## Next Steps

TODO: add ...
