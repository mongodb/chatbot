import {
  parseVerifiedAnswerYaml,
  VerifiedAnswerSpec,
} from "mongodb-chatbot-verified-answers";
import { ConversationEvalCase } from "./getConversationEvalCasesFromYaml";

export function loadVerifiedAnswersAsConversations(
  verifiedAnswersYaml: string
): ConversationEvalCase[] {
  const verifiedAnswerSpecs = parseVerifiedAnswerYaml(verifiedAnswersYaml);

  return verifiedAnswerSpecs.flatMap(getConversationFromVerifiedAnswerSpec);
}

function getConversationFromVerifiedAnswerSpec(
  verifiedAnswerSpec: VerifiedAnswerSpec
) {
  const conversations: ConversationEvalCase[] = [];
  for (const question of verifiedAnswerSpec.questions) {
    const conversationEvalCase: ConversationEvalCase = {
      name: `Verified Answer: ${question}`,
      tags: ["verified_answer"],
      messages: [
        {
          role: "user",
          content: question,
        },
        {
          role: "assistant",
          content: verifiedAnswerSpec.answer,
        },
      ],
      expectedLinks: verifiedAnswerSpec.references.map((r) => r.url),
    };

    conversations.push(conversationEvalCase);
  }
  return conversations;
}
