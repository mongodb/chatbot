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

export const makeVerifiedAnswerGenerateUserPrompt = ({
  findVerifiedAnswer,
  onNoVerifiedAnswerFound,
}: MakeVerifiedAnswerGenerateUserPromptParams): GenerateUserPromptFunc => {
  return async (args) => {
    const { userMessageText } = args;
    const { answer, queryEmbedding } = await findVerifiedAnswer({
      query: userMessageText,
    });

    if (answer !== undefined) {
      const { answer: content, references, ...additionalInfo } = answer;
      return {
        userMessage: {
          embedding: queryEmbedding,
          content: userMessageText,
          role: "user",
        },
        staticResponse: {
          ...additionalInfo,
          references,
          content,
          role: "assistant",
        },
      } satisfies GenerateUserPromptFuncReturnValue;
    }
    return await onNoVerifiedAnswerFound(args);
  };
};
