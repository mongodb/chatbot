import { ObjectId } from "mongodb-rag-core/mongodb";
import { ScrubbedMessage } from "./ScrubbedMessage";

export interface ScrubbedMessageStore<
  SmAnalysis extends Record<string, unknown> | undefined = undefined
> {
  insertScrubbedMessage(args: {
    message: ScrubbedMessage<SmAnalysis>;
  }): Promise<void>;
  insertScrubbedMessages(args: {
    messages: ScrubbedMessage<SmAnalysis>[];
  }): Promise<void>;
  updateScrubbedMessage(args: {
    id: ObjectId;
    message: Partial<Omit<ScrubbedMessage<SmAnalysis>, "_id">>;
  }): Promise<void>;
  findScrubbedMessageById(args: {
    id: ObjectId;
  }): Promise<ScrubbedMessage<SmAnalysis> | null>;
  findScrubbedMessagesByConversationId(args: {
    conversationId: ObjectId;
  }): Promise<ScrubbedMessage<SmAnalysis>[]>;
}
