import {
  updateFrontMatter,
  logger,
  ConversationCustomData,
} from "mongodb-rag-core";
import { originCodes } from "mongodb-chatbot-server";
import { z } from "zod";
import { logRequest } from "../utils";

const RawCustomDataSchema = z.object({
  origin: z.string().describe("Origin of the request"),
  originCode: z
    .enum(originCodes)
    .default("OTHER")
    .describe("Code representing the origin of the request"),
});

export function formatUserMessageForGeneration(
  userMessageText: string,
  reqId: string,
  customData: ConversationCustomData
): string {
  const result = RawCustomDataSchema.safeParse(customData);
  if (!result.success) {
    logRequest({
      reqId,
      message: `Zod parse error in formatUserMessageForGeneration: ${result.error.message}`,
      type: "error",
    });
    return userMessageText;
  }

  const frontMatter: Record<string, string> = {};
  const parsedCustomData = result.data;
  try {
    const url = new URL(parsedCustomData.origin);
    if (
      url.hostname === "mongodb.com" ||
      url.hostname.endsWith(".mongodb.com")
    ) {
      frontMatter.pageUrl = parsedCustomData.origin;
    }
  } catch (e) {
    logger.warn(
      `Origin ${parsedCustomData.origin} malformed. Not using as URL in front matter.`
    );
  }

  if (parsedCustomData.originCode === "VSCODE") {
    frontMatter.client = "MongoDB VS Code plugin";
  } else if (parsedCustomData.originCode === "GEMINI_CODE_ASSIST") {
    frontMatter.client = "Gemini Code Assist";
  }

  if (Object.keys(frontMatter).length === 0) {
    return userMessageText;
  }
  return updateFrontMatter(userMessageText, frontMatter);
}
