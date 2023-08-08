import "dotenv/config";
import { makeApp } from "./app";
import {
  logger,
  MongoDB,
  makeDatabaseConnection,
  makeOpenAiEmbedFunc,
} from "chat-core";
import { ConversationsService } from "./services/conversations";
import { makeDataStreamer } from "./services/dataStreamer";
import { makeOpenAiLlm } from "./services/llm";
import { config } from "./config";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  // Create instances of services
  const mongodb = new MongoDB(
    config.mongodb.connectionUri,
    config.mongodb.databaseName,
    config.mongodb.vectorSearchIndexName
  );

  const conversations = new ConversationsService(
    mongodb.db,
    config.llm.systemPrompt
  );

  const dataStreamer = makeDataStreamer();

  const store = await makeDatabaseConnection(config.embeddedContentStore);

  const embed = makeOpenAiEmbedFunc(config.embed);

  const llm = makeOpenAiLlm(config.llm);

  const app = await makeApp({
    embed,
    store,
    conversations,
    dataStreamer,
    llm,
    findNearestNeighborsOptions: config.findNearestNeighborsOptions,
    searchBoosters: config.conversations?.searchBoosters,
  });

  const server = app.listen(PORT, () => {
    logger.info(`Server listening on port: ${PORT}`);
  });

  process.on("SIGINT", async () => {
    logger.info("SIGINT signal received");
    await mongodb.close();
    await store.close();
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        error ? reject(error) : resolve();
      });
    });
    process.exit(1);
  });
};

try {
  startServer();
} catch (e) {
  logger.error(`Fatal error: ${e}`);
  process.exit(1);
}
