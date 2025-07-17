import { updateFrontMatter, ConversationCustomData } from "mongodb-rag-core";
import { originCodes } from "mongodb-chatbot-server";
import { z } from "zod";
import { logRequest } from "../utils";

const RawCustomDataSchema = z
  .object({
    origin: z.string().optional().describe("Origin of the request"),
    originCode: z
      .enum(originCodes)
      .optional()
      .describe("Code representing the origin of the request"),
  })
  .optional();

type FormatUserMessageForGenerationParams = {
  userMessageText: string;
  reqId: string;
  customData: ConversationCustomData;
};

export function formatUserMessageForGeneration({
  userMessageText,
  reqId,
  customData,
}: FormatUserMessageForGenerationParams): string {
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
  if (!parsedCustomData || Object.keys(parsedCustomData).length === 0) {
    logRequest({
      reqId,
      message: "Found no customData to add to front matter.",
      type: "error",
    });
    return userMessageText;
  }

  if (parsedCustomData.origin) {
    try {
      const url = new URL(parsedCustomData.origin);
      if (
        url.hostname === "mongodb.com" ||
        url.hostname.endsWith(".mongodb.com")
      ) {
        frontMatter.pageUrl = parsedCustomData.origin;
      }
    } catch (e) {
      logRequest({
        reqId,
        message: `Origin ${parsedCustomData.origin} malformed. Not using as URL in front matter.`,
        type: "error",
      });
    }
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
