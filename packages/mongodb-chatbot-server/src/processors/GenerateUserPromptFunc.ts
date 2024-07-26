import { References } from "mongodb-rag-core";
import {
  Conversation,
  ConversationCustomData,
  UserMessage,
  AssistantMessage,
} from "mongodb-rag-core/ConversationsService";

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
    If defined, this message should be sent as a response instead of generating
    a response to the user query with the LLM.
   */
  staticResponse?: AssistantMessage;

  /**
    If true, no response should be generated with an LLM. Instead, return the
    `staticResponse` if set or otherwise respond with a standard static
    rejection response.
   */
  rejectQuery?: boolean;

  /**
    The (preprocessed) user message to insert into the conversation.
   */
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
