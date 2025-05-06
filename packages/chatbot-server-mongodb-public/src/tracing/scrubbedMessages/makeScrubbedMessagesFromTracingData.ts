import { extractTracingData } from "../extractTracingData";
import { ScrubbedMessage } from "./ScrubbedMessage";

export async function makeScrubbedMessagesFromTracingData(
  tracingData: ReturnType<typeof extractTracingData>
): Promise<ScrubbedMessage[]> {
  // TODO:
  return [];
}
