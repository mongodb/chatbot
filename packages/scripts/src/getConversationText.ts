import { assertEnvVars } from "mongodb-rag-core";
import { MongoClient, BSON } from "mongodb-rag-core/mongodb";
import { Conversation } from "mongodb-chatbot-server";

import "dotenv/config";

const { MONGODB_DATABASE_NAME, MONGODB_CONNECTION_URI } = assertEnvVars({
  MONGODB_DATABASE_NAME: "",
  MONGODB_CONNECTION_URI: "",
});

const conversationIdString = process.argv[2];
if (!conversationIdString) {
  throw new Error(
    "Missing conversation id. Usage: getConversationText <conversationId> (or via package.json: npm run getConversationText -- <conversationId>)"
  );
}

const conversationId = new BSON.ObjectId(conversationIdString);

async function main() {
  const client = await MongoClient.connect(MONGODB_CONNECTION_URI);
  try {
    const db = client.db(MONGODB_DATABASE_NAME);
    const conversation = await db
      .collection<Conversation>("conversations")
      .findOne({ _id: conversationId });

    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    const conversationTranscript = conversation.messages
      .filter((message) => ["user", "assistant"].includes(message.role))
      .map((message) => `*${message.role.toUpperCase()}*: ${message.content}`)
      .join("\n\n");
    console.log(conversationTranscript);
  } finally {
    await client.close();
  }
}

main();
