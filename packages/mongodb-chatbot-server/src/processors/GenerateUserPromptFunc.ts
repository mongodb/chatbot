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
  conversation?: Conversation;

  /**
    String Id for request
   */
  reqId: string;

  /**
    Custom data for the message request.
   */
  customData?: ConversationCustomData;
};

export interface GenerateUserPromptFuncReturnValue {
  /**
    User message used to send to LLM and store in the database.
    If `rejectQuery: true`, then the server gives a static response
    before sending the query to an LLM.
   */
  rejectQuery?: boolean;

  userMessage: UserMessage;

  /**
    References returned with the LLM response
   */
  references?: References;
}
/**
  Generate the user prompt sent to the {@link ChatLlm}.
  This function is a flexible construct that you can use to customize
  the chatbot behavior. For example, you can use this function to
  perform retrieval augmented generation (RAG) or chain of thought prompting.
  Include whatever logic in here to construct the user message
  that the LLM responds to.

  If you are doing RAG, this can include the content from vector search.
 */
export type GenerateUserPromptFunc = (
  params: GenerateUserPromptFuncParams
) => Promise<GenerateUserPromptFuncReturnValue>;
