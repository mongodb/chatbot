import { startWebhookServer } from "./webhooks";
import { startSlackbotServer } from "./slackbot";

(() => {
  startWebhookServer();
  startSlackbotServer();
})();
