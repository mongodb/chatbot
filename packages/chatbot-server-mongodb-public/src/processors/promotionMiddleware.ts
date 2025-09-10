import { LanguageModelV2Middleware } from 'mongodb-rag-core/aiSdk';

const SKILL_REFRESH_DELAY = 86400000 // millisec per day
const lastResetDatetime = new Date(2000, 0, 1);

export const makePromotionMiddleware = ({ handleSkillPromotion}: { handleSkillPromotion: Function }): LanguageModelV2Middleware => {
  const promotionMiddleware: LanguageModelV2Middleware = {
    wrapStream: async ({ doStream }) => {
      // // Refresh the skill detail
      // if (Date.now() > lastResetDatetime + SKILL_REFRESH_DELAY) {
      //   try {
      //       const topicToSkillMap = getCurrentSkills();
      //       lastResetDatetime = Date.now();
      //   } catch (error) {
      //       console.error("Skill refresh failed.")
      //   } 
      // }

      // Start the Skills LLM call in the background (don't await it)
      console.log("Starting skill classification in background...");
      const skillPromotionMonitor = classifySkill("foo");

      // Start generation immediately
      console.log("Starting generation stream...");
      const result = await doStream();

      // // Fire-and-forget pattern for handling the Skill promotion result
      // // This will resolve later without blocking the stream
      // skillPromotionMonitor.then((skillResult) => {
      //   handleSkillPromotion(skillResult)
      // }).catch((error) => {
      //   console.error("Skill classification failed:", error);
      // });

      return { ...result, skillPromotionMonitor};
    }
  };
  return promotionMiddleware;
}




export const promotionMiddleware: LanguageModelV2Middleware = {
  wrapStream: async ({ doStream }) => {
    // Start the Skills LLM call in the background (don't await it)
    console.log("Starting skill classification in background...");
    const skillPromotionMonitor = classifySkill("foo");

    // Start generation immediately
    console.log("Starting generation stream...");
    const result = await doStream();

    // Fire-and-forget pattern for handling the Skill promotion result
    skillPromotionMonitor.then((skillResult) => {
      console.log("Skill classification completed:", skillResult);
      // You can handle the skill result here if needed
      // For example, log it, store it, or trigger some side effect
    }).catch((error) => {
      console.error("Skill classification failed:", error);
    });

    console.log("Returning stream result immediately...");
    return result;
  },
};

export const classifySkill = async (userMessageText: string): Promise<string> => {
  console.log("Classifying skill for message:", userMessageText);
  await new Promise((resolve) => setTimeout(resolve, 5000)); // delay
  console.log("Classification delay complete.");
  return "mockSkillTitle";
}