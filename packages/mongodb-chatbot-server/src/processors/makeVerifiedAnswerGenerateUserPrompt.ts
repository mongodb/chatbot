import { VerifiedAnswer, FindVerifiedAnswerFunc } from "mongodb-rag-core";
import {
  GenerateUserPromptFunc,
  GenerateUserPromptFuncReturnValue,
} from "./GenerateUserPromptFunc";

export interface MakeVerifiedAnswerGenerateUserPromptParams {
  /**
    Find content based on the user's message and preprocessing.
   */
  findVerifiedAnswer: FindVerifiedAnswerFunc;

  /**
    Format or modify the verified answer before displaying it to the user.
   */
  onVerifiedAnswerFound?: (verifiedAnswer: VerifiedAnswer) => VerifiedAnswer;

  onNoVerifiedAnswerFound: GenerateUserPromptFunc;
}

/**
  Constructs a GenerateUserPromptFunc that searches for verified answers for the
  user query. If no verified answer can be found for the given query, the
  onNoVerifiedAnswerFound GenerateUserPromptFunc is called instead.
 */
export const makeVerifiedAnswerGenerateUserPrompt = ({
  findVerifiedAnswer,
  onVerifiedAnswerFound,
  onNoVerifiedAnswerFound,
}: MakeVerifiedAnswerGenerateUserPromptParams): GenerateUserPromptFunc => {
  return async (args) => {
    const { userMessageText } = args;
    const { answer: foundVerifiedAnswer, queryEmbedding } =
      await findVerifiedAnswer({
        query: userMessageText,
      });

    if (foundVerifiedAnswer === undefined) {
      return await onNoVerifiedAnswerFound(args);
    }

    const verifiedAnswer =
      onVerifiedAnswerFound?.(foundVerifiedAnswer) ?? foundVerifiedAnswer;
    return {
      userMessage: {
        embedding: queryEmbedding,
        content: userMessageText,
        role: "user",
      },
      references: verifiedAnswer.references,
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
  };
};
