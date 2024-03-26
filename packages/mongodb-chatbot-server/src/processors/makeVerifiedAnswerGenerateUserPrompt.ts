import { FindVerifiedAnswerFunc } from "./FindVerifiedAnswerFunc";
import {
  GenerateUserPromptFunc,
  GenerateUserPromptFuncReturnValue,
} from "./GenerateUserPromptFunc";

export interface MakeVerifiedAnswerGenerateUserPromptParams {
  /**
    Find content based on the user's message and preprocessing.
   */
  findVerifiedAnswer: FindVerifiedAnswerFunc;

  onNoVerifiedAnswerFound: GenerateUserPromptFunc;
}

/**
  Constructs a GenerateUserPromptFunc that searches for verified answers for the
  user query. If no verified answer can be found for the given query, the
  onNoVerifiedAnswerFound GenerateUserPromptFunc is called instead.
 */
export const makeVerifiedAnswerGenerateUserPrompt = ({
  findVerifiedAnswer,
  onNoVerifiedAnswerFound,
}: MakeVerifiedAnswerGenerateUserPromptParams): GenerateUserPromptFunc => {
  return async (args) => {
    const { userMessageText } = args;
    const { answer: verifiedAnswer, queryEmbedding } = await findVerifiedAnswer(
      {
        query: userMessageText,
      }
    );

    if (verifiedAnswer !== undefined) {
      return {
        userMessage: {
          embedding: queryEmbedding,
          content: userMessageText,
          role: "user",
        },
        staticResponse: {
          metadata: {
            verifiedAnswer: {
              _id: verifiedAnswer._id,
              created: verifiedAnswer.created,
              updated: verifiedAnswer.updated,
            },
          },
          references: verifiedAnswer.references,
          content: verifiedAnswer.answer,
          role: "assistant",
        },
      } satisfies GenerateUserPromptFuncReturnValue;
    }
    return await onNoVerifiedAnswerFound(args);
  };
};
