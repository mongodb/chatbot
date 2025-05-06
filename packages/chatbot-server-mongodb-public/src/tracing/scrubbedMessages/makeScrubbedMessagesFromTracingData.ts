import { extractTracingData } from "../extractTracingData";
import { ScrubbedMessage } from "./ScrubbedMessage";
import { LanguageModel } from "ai";

export async function makeScrubbedMessagesFromTracingData(
  tracingData: ReturnType<typeof extractTracingData>,
  analyzerModel?: LanguageModel
): Promise<ScrubbedMessage[]> {
  // TODO:
  return [];
}
