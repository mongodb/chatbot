import { Db } from "mongodb-rag-core/mongodb";
import { ScrubbedMessageStore } from "./ScrubbedMessageStore";
import { ScrubbedMessage } from "./ScrubbedMessage";

export const DEFAULT_SCRUBBED_MESSAGES_COLLECTION_NAME = "scrubbed_messages";

export function makeMongoDbScrubbedMessageStore<
  SmAnalysis extends Record<string, unknown> | undefined = undefined
>({
  db,
  collectionName = DEFAULT_SCRUBBED_MESSAGES_COLLECTION_NAME,
}: {
  db: Db;
  collectionName?: string;
}): ScrubbedMessageStore<SmAnalysis> {
  const collection = db.collection<ScrubbedMessage<SmAnalysis>>(collectionName);
  return {
    insertScrubbedMessage: async ({ message }) => {
      await collection.insertOne(message);
    },
    insertScrubbedMessages: async ({ messages }) => {
      await collection.insertMany(messages);
    },
    updateScrubbedMessage: async ({ id, message }) => {
      await collection.updateOne({ _id: id }, { $set: message });
    },
    findScrubbedMessageById: async ({ id }) => {
      return await collection.findOne({ _id: id });
    },
    findScrubbedMessagesByConversationId: async ({ conversationId }) => {
      return await collection.find({ conversationId }).toArray();
    },
  };
}
