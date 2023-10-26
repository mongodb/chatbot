import { logger } from "chat-core";
import { makePersistedHttpRequestFunctionDefinition } from "./makePersistedHttpRequestFunctionDefinition";
import { FindContentFunc } from "../routes/api-conversations/FindContentFunc";

export const makeFindApiSpecFunctionDefinition = (
  findContent: FindContentFunc
) => {
  return async ({
    query,
    ipAddress,
  }: {
    query: string;
    ipAddress?: string;
  }) => {
    const { content } = await findContent({
      query,
      ipAddress: ipAddress ?? "FOO",
    });
    const action = content[0];
    if (!action) {
      throw new Error("No action found");
    }
    logger.log("found action:", action);
    const functionDefinition =
      makePersistedHttpRequestFunctionDefinition(action);
    return [functionDefinition];
  };
};
