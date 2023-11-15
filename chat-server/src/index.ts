/**
  @fileoverview This file contains the implementation of the MongoDB Docs AI chat server.
 */
import "dotenv/config";
import { makeApp } from "./app";
import { logger } from "chat-core";
import { config, mongodb, embeddedContentStore } from "./config";


const PORT = process.env.PORT || 3000;

const startServer = async () => {
  logger.info("Starting server...");
  const app = await makeApp(config);
  const server = app.listen(PORT, () => {
    logger.info(`Server listening on port: ${PORT}`);
  });

  process.on("SIGINT", async () => {
    logger.info("SIGINT signal received");
    await mongodb.close();
    await embeddedContentStore.close();
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
