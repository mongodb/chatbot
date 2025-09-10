import { LanguageModelV2Middleware } from 'mongodb-rag-core/aiSdk';
import { classifySkill } from './classifySkill';

export const promotionMiddleware: LanguageModelV2Middleware = {
  wrapStream: async ({ doStream, params }) => {
    let userMessageText = "";
    params.prompt.forEach((part) => {
      if (part.role === "user" && part.content[0].type === "text") {
        userMessageText = part.content[0].text;
      }
    });
    if (!userMessageText) {
      console.error()
    }
    const skillPromotionPromise = classifySkill(userMessageText);

    // Start generation immediately
    const result = await doStream();

    return { ...result, skillPromotionPromise};
  },
};
