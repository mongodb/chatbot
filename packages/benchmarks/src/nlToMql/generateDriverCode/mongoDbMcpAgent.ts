import {
  generateText,
  LanguageModel,
  ModelMessage,
  stepCountIs,
  StopCondition,
  experimental_createMCPClient,
  Experimental_StdioMCPTransport,
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
    const response = await generateText({
      model,
      system: systemPrompt,
      messages,
      stopWhen: [...(stopConditions ?? []), stepCountIs(maxSteps)],
    });
    return response.text;
  });
}
