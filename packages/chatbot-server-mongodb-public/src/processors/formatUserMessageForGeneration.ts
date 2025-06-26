/**
  Adds front matter to the user message text.
 */
import { ConversationCustomData, logger } from "mongodb-rag-core";

export function formatUserMessageForGeneration(
  userMessageText: string,
  customData?: ConversationCustomData
) {
  const frontMatters: Record<string, string> = {};
  const { origin, originCode } = customData ?? {};
  if (typeof origin !== "string" || !origin) {
    return userMessageText;
  }
  try {
    const url = new URL(origin);
    if (
      url.hostname === "mongodb.com" ||
      url.hostname.endsWith(".mongodb.com")
    ) {
      frontMatters.pageUrl = origin;
    }
  } catch (e) {
    logger.warn(`Origin ${origin} malformed. Not using in front matter.`);
  }

  if (originCode === "VSCODE") {
    frontMatters.client = "MongoDB VS Code plugin";
  } else if (originCode === "GEMINI_CODE_ASSIST") {
    frontMatters.client = "Gemini Code Assist";
  }
  return addFrontMatter(frontMatters, userMessageText);
}

function addFrontMatter(
  frontMatters: Record<string, string>,
  userMessageText: string
) {
  if (Object.keys(frontMatters).length === 0) {
    return userMessageText;
  }
  return `---
${Object.entries(frontMatters)
  .map(([key, value]) => `${key}: ${value}`)
  .join("\n")}
---
${userMessageText}`;
}
