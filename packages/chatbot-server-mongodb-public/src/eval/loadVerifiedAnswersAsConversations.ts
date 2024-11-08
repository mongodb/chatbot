import {
  parseVerifiedAnswerYaml,
  VerifiedAnswerSpec,
} from "mongodb-chatbot-verified-answers";
import fs from "fs";
import { Conversation } from "mongodb-rag-core";
import { ObjectId } from "mongodb-rag-core/mongodb";

export function loadVerifiedAnswersAsConversations(
  verifiedAnswersYamlPath: string
): Conversation[] {
  const yamlStr = fs.readFileSync(verifiedAnswersYamlPath, "utf8");
  const verifiedAnswerSpecs = parseVerifiedAnswerYaml(yamlStr);

  return verifiedAnswerSpecs.flatMap(getConversationFromVerifiedAnswerSpec);
}

function getConversationFromVerifiedAnswerSpec(
  verifiedAnswerSpec: VerifiedAnswerSpec
) {
  const conversations: Conversation[] = [];
  for (const question of verifiedAnswerSpec.questions) {
    const conversation: Conversation = {
      createdAt: new Date(),
      _id: new ObjectId(),
      messages: [
        {
          createdAt: new Date(),
          id: new ObjectId(),
          role: "user",
          content: question,
        },
        {
          createdAt: new Date(),
          id: new ObjectId(),
          role: "assistant",
          content: verifiedAnswerSpec.answer,
          references: verifiedAnswerSpec.references,
        },
      ],
    };

    conversations.push(conversation);
  }
  return conversations;
}
