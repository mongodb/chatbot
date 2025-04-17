import { NlPromptResponseEvalScorer } from "./NlQuestionAnswerEval";

// TODO: Factuality scorer
export const Factuality: NlPromptResponseEvalScorer = async function (args) {
  const score = null;
  return {
    name: `Factuality`,
    score,
  };
};
