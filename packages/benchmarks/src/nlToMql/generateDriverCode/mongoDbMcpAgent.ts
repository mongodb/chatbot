import {
  generateText,
  LanguageModel,
  ModelMessage,
  stepCountIs,
  StopCondition,
  streamText
  experimental_createMCPClient,
} from "mongodb-rag-core/aiSdk";
import { wrapTraced } from "mongodb-rag-core/braintrust";

export interface MakeMongoDbMcpAgentParams {
  model: LanguageModel;
  systemPrompt: string;
  stopConditions?: StopCondition[];
}

export interface MongoDbMcpAgentParams {
  databaseName: string;
  messages: ModelMessage[];
  maxSteps?: number;
}

export function makeMongoDbMcpAgent({
  model,
  systemPrompt,
  stopConditions,
}: MakeMongoDbMcpAgentParams) {
  return wrapTraced(async function mongoDbMcpAgent({
    messages,
    maxSteps = 10,
  }: MongoDbMcpAgentParams) {
    const response = await streamText({
      model,
      system: systemPrompt,
      messages,
      stopWhen: [...(stopConditions ?? []), stepCountIs(maxSteps)],
    });

    const sources = await response.sources;
  });
}
