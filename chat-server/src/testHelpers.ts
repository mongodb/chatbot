import {
  MongoDB,
  makeOpenAiEmbedFunc,
  FindNearestNeighborsOptions,
  makeDatabaseConnection,
} from "chat-core";

import { makeOpenAiLlm } from "./services/llm";
import { makeDataStreamer } from "./services/dataStreamer";
import { makeConversationsService } from "./services/conversations";
import { makeApp } from "./app";
import { config as conf } from "./config";

export async function makeConversationsRoutesDefaults() {
  // ip address for local host
  const ipAddress = "127.0.0.1";

  // set up embeddings service
  const embed = makeOpenAiEmbedFunc(conf.embed);

  // set up llm service
  const llm = makeOpenAiLlm(conf.llm);
  const dataStreamer = makeDataStreamer();

  const store = await makeDatabaseConnection(conf.embeddedContentStore);

  const findNearestNeighborsOptions: Partial<FindNearestNeighborsOptions> =
    conf.findNearestNeighborsOptions;

  const testDbName = `conversations-test-${Date.now()}`;
  const mongodb = new MongoDB(conf.mongodb.connectionUri, testDbName);
  const searchBoosters = conf.conversations!.searchBoosters;
  const userQueryPreprocessor = conf.conversations!.userQueryPreprocessor;

  const conversations = makeConversationsService(
    mongodb.db,
    conf.llm.systemPrompt
  );
  const appConfig = {
    conversations,
    dataStreamer,
    embed,
    findNearestNeighborsOptions,
    llm,
    store,
    searchBoosters,
    userQueryPreprocessor,
  };
  const app = await makeApp(appConfig);

  return {
    ipAddress,
    embed,
    llm,
    dataStreamer,
    findNearestNeighborsOptions,
    mongodb,
    store,
    conversations,
    appConfig,
    app,
    searchBoosters,
    userQueryPreprocessor,
  };
}
