import { updateFrontMatter, logger } from "mongodb-rag-core";
import { OriginCode } from "mongodb-chatbot-server";

export function formatUserMessageForGeneration(
  userMessageText: string,
  customData?: {
    origin?: string;
    originCode?: OriginCode;
    [key: string]: unknown;
  }
) {
  const frontMatter: Record<string, string> = {};
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
      frontMatter.pageUrl = origin;
    }
  } catch (e) {
    logger.warn(`Origin ${origin} malformed. Not using in front matter.`);
  }

  if (originCode === "VSCODE") {
    frontMatter.client = "MongoDB VS Code plugin";
  } else if (originCode === "GEMINI_CODE_ASSIST") {
    frontMatter.client = "Gemini Code Assist";
  }

  if (Object.keys(frontMatter).length === 0) {
    return userMessageText;
  }
  return updateFrontMatter(userMessageText, frontMatter);
}
