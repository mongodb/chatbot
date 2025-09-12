import { z } from "zod";
import { generateObject, LanguageModel } from "mongodb-rag-core/aiSdk";
import { makeMarkdownNumberedList } from "mongodb-rag-core/dataSources";
import { Promotion, removeFrontMatter } from "mongodb-rag-core";
import { createSkillRefreshManager } from "./skillRefreshManager";

export type SkillClassiferFunction = (
  userMessageText: string
) => Promise<Promotion | null>;

export function makeClassifySkill(model: LanguageModel): {
  classifySkill: SkillClassiferFunction;
  cleanupSkillClassifier: () => void;
} {
  const refreshManager = createSkillRefreshManager();

  const baseInstructions = [
    `Skills are organized into groups called Topics.`,
    `Identify which MongoDB Topic the message belongs to before selecting a Skill.`,
    `If there is no relevant Topic or no relevant Skill, return null for the "topic" and "skill" fields.`,
    `ONLY use Topics and Skills from the provided list, even if you think others  exist.`,
  ];

  const classifySkill = async (userMessageText: string) => {
    const topicToSkillMap = refreshManager.getTopicsToSkillsMap();
    if (topicToSkillMap === undefined) {
      return null;
    }

    const systemPromptMessage = `Your job is to select the most relevant MongoDB Skill course to suggest to users based on their message. Use the following instructions to guide you: 

${makeMarkdownNumberedList(baseInstructions)}

The list of available Topics and Skills is below:

${JSON.stringify(topicToSkillMap)}`;

    console.log("Classifying skill promotion for text: " + userMessageText);
    const { object } = await generateObject({
      model,
      messages: [
        { role: "system", content: systemPromptMessage },
        { role: "user", content: removeFrontMatter(userMessageText) },
      ],
      schema: z.object({
        reasoning: z
          .string()
          .describe(
            "Your reasoning for the most relevant topic and skill chosen."
          ),
        topic: z.string().describe("The topic the message belongs to."),
        skill: z.string().describe("The skill to suggest to the user"),
      }),
    });

    // Return the skill information
    if (!object.topic || !object.skill) {
      console.log("No skill identified.");
      return null;
    }
    console.log("Selected skill promotion: ", JSON.stringify(object));
    // Promotion reference links should also be formatted with the tck="mongodb_ai_chatbot" query parameter for tracking.
    const skillDetail = topicToSkillMap?.[object.topic].find(
      (arrItem) => arrItem.name === object.skill
    );
    const rawUrl = skillDetail?.url ?? "";
    const url = rawUrl
      ? `${rawUrl}${rawUrl.includes("?") ? "&" : "?"}tck=mongodb_ai_chatbot`
      : "";

    return object.skill
      ? {
          type: "skill",
          topic: object.topic,
          title: object.skill,
          url,
          description: `Want to learn more? Take the [${object.skill}](${url}) skill!`,
        }
      : null;
  };

  return {
    classifySkill,
    cleanupSkillClassifier: refreshManager.cleanup,
  };
}
