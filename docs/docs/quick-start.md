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
1. Set up the project source code
1. Ingest the content that the chatbot uses to answer questions
1. Spin up a server and frontend to query the chatbot
1. Look at next steps that you can take to customize the chatbot

## Steps

### 1. Set up the MongoDB Atlas Database

Log into [MongoDB Atlas](https://cloud.mongodb.com/) and create a new project. Create a new cluster in the project.
You can use the free tier cluster (M0). You **cannot** use a serverless cluster.

Once the cluster is created, copy the connection string to use in your project.
You can find the connection string in the Atlas UI as follows:

1. Press the **Connect** button.
1. Press the **Drivers** button.
1. Copy the connection string and store it in a safe place.
   You will need it soon. If you haven't created a user yet, you can create one now.
   - If you need help creating a user, refer to [Configure Database Users](https://www.mongodb.com/docs/atlas/security-add-mongodb-users/) in the MongoDB Atlas documentation.

Next, create the database `mongodb-chatbot-framework-chatbot` with a collection
`embedded_content`. You can leave the collection empty for now.
In the Atlas UI, go to your cluster's overview page, and perform the following:

1. Go to the **Collections** tab.
1. Press the **Create Database** button.
1. In the modal window, add the database name `mongodb-chatbot-framework-chatbot`
   and collection name `embedded_content`. Then press **Create**.

Once the database and collection are created, create an Atlas Vector Search index
on the `embedded_content` collection. This collection will store vector embeddings of ingested content. In the Atlas UI, do the following:

1. Go to the **Atlas Search** tab.
1. Press the **Create Search Index** button.
1. Select the **Atlas Vector Search JSON Index** option, then press the **Next** button.
1. In the **Database and Collection** section, select the
   `mongodb-chatbot-framework-chatbot` database and `embedded_content` collection.
1. In the **Index Name** field, leave the default `vector_index`.
1. In the index definition field, paste the following index definition:

   ```js
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

1. Press the **Next** button, then on the next page press the **Create Search Index** button.
1. Wait for the index to be created. This should happen in under a minute.
   When the index is successfully created, you should see that the status is **Active**.

Now the Atlas cluster and Vector Search index are ready to use in your app.

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
with your Atlas connection URI and OpenAI API Key, respectively.

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
{"level":"info","message":"Logger created"}
{"level":"info","message":"Last successful run date: Thu Jan 04 2024 12:23:27 GMT-0500 (Eastern Standard Time)"}
{"level":"info","message":"Loaded sources:\n- mongodb-rag-framework"}
{"level":"info","message":"Fetching pages for mongodb-rag-framework"}
{"level":"info","message":"Created /var/folders/v3/128h981j6vx4ncq_68qcg2cm0000gp/T/mongodb-rag-frameworkV3BE8d for https://github.com/mongodb/chatbot/"}
# ...
{"level":"info","message":"Updating last successful run date"}
```

To learn more about how you can configure the MongoDB Ingest CLI,
refer to the [Configure the Ingest CLI](./ingest/configure.md) guide.

### 4. Query the Chatbot

In this step, you will spin up a server and frontend to query the chatbot.
You'll be able to ask questions about the MongoDB Chatbot Framework
using the data you ingested in the previous step.

Start the chatbot server and UI with:

```shell
npm run dev
```

Open http://localhost:5173/ in your browser to see the UI.
You can ask the chatbot questions and see the responses.

Have fun!

You can also query the server directly with curl. To create a new conversation:

```shell
curl -X POST http://localhost:3000/api/v1/conversations/
```

This creates a new conversation with an `_id` field. You can append messages to the conversation with: 

```shell
curl --location 'http://localhost:3000/api/v1/conversations/{conversationId}/messages?stream=false' \
--header 'Origin: http://localhost:5173' \
--header 'Content-Type: application/json' \
--data '{
    "message": "What is MongoDB?"
}'
```

To learn more about how you can configure the MongoDB Chatbot Server,
refer to the [Configure the Chatbot Server](./server/configure.md) guide.

To learn more about how you can configure the MongoDB Chatbot UI,
refer to the [Chatbot UI](./ui.md) guide.

### 5. Explore and Modify the Code

Now that you've set up the quick start project, you can explore and modify the code
to customize the chatbot to your needs.

Some things you can do to customize the chatbot:

- Modify data ingestion in the `ingest` project.
  - You can add your own data sources to ingest content from.
    To learn more about how you can add new data sources, refer to the [Add a Data Source](./ingest/data-sources.md) guide.
- Modify the chatbot server in the `server` project.
  - Update the system prompt and user message. To learn more, refer to the [Prompt Engineering](./server/llm.md#prompt-engineering) guide.
  - Pre-process user messages before they are sent to the chatbot.
    To learn more, refer to the [Pre-Process User Queries](./server/rag/preprocess.md) guide.
  - Add custom logic to the chatbot server. To learn more,
    refer to the [Customize Server Logic](./server/custom-logic.md) guide.
- Modify the chatbot UI in the `ui` project.
  - You can build your frontend on top of this project, or add the React components
    to your own React app. To learn more, refer to the [Chatbot UI](./ui.md) guide.
  - Even if you're adding the components to your own project,
    you might want to keep the `ui` project as is to manually test changes
    you make to the Chatbot Server.
