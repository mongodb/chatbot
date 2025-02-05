# Persist Conversation Data

The MongoDB Chatbot Server persists and retrieves conversation data data using the
[`ConversationsService`](../reference/core/interfaces/Conversations.ConversationsService.md) interface.

## Store Data in MongoDB

By default, the MongoDB Chatbot Server uses MongoDB to persist conversation data.

Use the [`makeMongoDbConversationsService()`](../reference/core/modules/index.md#makemongodbconversationsservice) function to create a `ConversationsService`
that stores data in MongoDB.

When you create a `ConversationService` with MongoDB, pass a MongoDB database.
All conversations are stored in the database's `conversations` collection.

Add the `ConversationsService` to the [`ConversationsRouterParams.conversations`](../reference/server/interfaces/ConversationsRouterParams.md#conversations) property.

```ts
import { MongoClient } from "mongodb-rag-core/mongodb";
import {
  makeMongoDbConversationsService,
  SystemPrompt,
} from "mongodb-chatbot-server";

const systemPrompt: SystemPrompt = {
  role: "system",
  content: `<some system prompt>`,
};
const mongodb = new MongoClient(MONGODB_CONNECTION_URI);
const conversations = makeMongoDbConversationsService(
  mongodb.db(MONGODB_DATABASE_NAME),
);

const appConfig: AppConfig = {
  // ...other config
  conversationsRouterParams: {
    conversations,
    // ...other config
  },
};
```

Every conversation is stored in a MongoDB collection with the name `conversations`
in a document with the schema [`Conversation`](../reference/core/interfaces/Conversations.Conversation.md).

:::note[Alternate Databases]

You could use a different database to store conversation data,
as long as you use the `ConversationsService` interface.

:::
