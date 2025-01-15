import { Conversation } from "mongodb-rag-core";
import { braintrustLogger } from "mongodb-rag-core/braintrust";

export type UpdateTraceFuncParams = {
  traceId: string;
  logger: typeof braintrustLogger;
  conversation: Conversation;
};

export type UpdateTraceFunc = (params: UpdateTraceFuncParams) => Promise<void>;
