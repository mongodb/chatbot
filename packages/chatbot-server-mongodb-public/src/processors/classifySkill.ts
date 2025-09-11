import { z } from "zod";
import { generateObject, LanguageModel } from "mongodb-rag-core/aiSdk";
import { getCurrentSkills, TopicsToSkills } from "./getCurrentSkills";
import { makeMarkdownNumberedList } from "mongodb-rag-core/dataSources";
import { Promotion, removeFrontMatter } from "mongodb-rag-core";

const SKILL_REFRESH_DELAY = 86400000; // millisec in one day
const INITIAL_BACKOFF_DELAY = 60000; // 1 minute
const MAX_BACKOFF_DELAY = 3600000; // 1 hour
const BACKOFF_MULTIPLIER = 2;

export type SkillClassiferFunction = (
  userMessageText: string
) => Promise<Promotion | null>;

export function makeClassifySkill(
  model: LanguageModel
): SkillClassiferFunction {
  let lastResetDatetime = new Date(2000, 0, 1).getMilliseconds();
  let lastFailureTime = 0;
  let currentBackoffDelay = INITIAL_BACKOFF_DELAY;
  let consecutiveFailures = 0;
  let topicToSkillMap: TopicsToSkills;
  return async (userMessageText) => {
    // Refresh the skill detail with exponential backoff
    const now = Date.now();
    const shouldRefresh = now > lastResetDatetime + SKILL_REFRESH_DELAY;
    const canRetryAfterBackoff = now > lastFailureTime + currentBackoffDelay;

    if (shouldRefresh && (consecutiveFailures === 0 || canRetryAfterBackoff)) {
      console.log("TopicToSkillMap is old - attempting to refresh it.");
      try {
        topicToSkillMap = await getCurrentSkills();
        // Reset backoff on successful refresh
        lastResetDatetime = now;
        consecutiveFailures = 0;
        currentBackoffDelay = INITIAL_BACKOFF_DELAY;
        lastFailureTime = 0;
      } catch (error) {
        console.error(
          `Skill refresh failed (attempt ${consecutiveFailures + 1}):`,
          error
        );
        consecutiveFailures++;
        lastFailureTime = now;
        currentBackoffDelay = Math.min(
          currentBackoffDelay * BACKOFF_MULTIPLIER,
          MAX_BACKOFF_DELAY
        );
        console.log(
          `Next retry attempt in ${currentBackoffDelay / 1000} seconds`
        );
      }
    }

    const instructions = [
      `Skills are organized into groups called Topics.`,
      `Identify which MongoDB Topic the message belongs to before selecting a Skill.`,
      `If there is no relevant Topic or no relevant Skill, return null for the "topic" and "skill" fields.`,
      `ONLY use Topics and Skills from the provided list, even if you think others  exist.`,
    ];

    const systemPromptMessage = `Your job is to select the most relevant MongoDB Skill course to suggest to users based on their message. Use the following instructions to guide you: 

  ${makeMarkdownNumberedList(instructions)}

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
}
