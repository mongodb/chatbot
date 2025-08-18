import { wrapLanguageModel } from "ai";
export * from "ai";
export * from "@ai-sdk/azure";
export * from "@ai-sdk/openai";
export { mockId, mockValues, MockLanguageModelV2 } from "ai/test";
// Note: This should probably be exported from ai,
// but it's not yet available,
// so need to do a bit of hackery to access it.
export type LanguageModelMiddleware = Exclude<
  Parameters<typeof wrapLanguageModel>[0]["middleware"],
  any[]
>;
