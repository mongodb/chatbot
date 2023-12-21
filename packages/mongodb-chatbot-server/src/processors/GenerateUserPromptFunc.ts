import { References } from "mongodb-rag-core";
import {
  Conversation,
  ConversationCustomData,
  UserMessage,
} from "../services/ConversationsService";

export type GenerateUserPromptFuncParams = {
  /**
    Original user message
   */
  userMessageText: string;

  /**
    Conversation with preceding messages
   */
  conversation: Conversation;

  /**
    String Id for request
   */
  reqId: string;

  customData: ConversationCustomData;
};

export interface GenerateUserPromptFuncReturnValue {
  /**
    User message used to send to LLM and store in the database.
    If `rejectQuery: true`, then the server gives a static response
    before sending the query to an LLM.
   */
  userMessage: UserMessage;

  /**
    References returned with the LLM response
   */
  references?: References;
}
/**
  Generate the user prompt sent to the {@link ChatLlm}.
  This should include the content from vector search.
 */
export type GenerateUserPromptFunc = (
  params: GenerateUserPromptFuncParams
) => Promise<GenerateUserPromptFuncReturnValue>;
