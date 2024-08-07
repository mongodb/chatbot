import { assertEnvVars, MongoClient } from "mongodb-rag-core";
import { createScrubbedMessageStatsForDayView } from "./daily";
import { createScrubbedMessageStatsForWeekView } from "./weekly";
import { createScrubbedMessageStatsForMonthView } from "./monthly";

export type ChatbotStats = {
  numMessages: number;
  numConversations: number;
};

const { MONGODB_DATABASE_NAME, MONGODB_CONNECTION_URI } = assertEnvVars({
  MONGODB_DATABASE_NAME: "",
  MONGODB_CONNECTION_URI: "",
});

const dailyViewName = "scrubbed_messages_daily_stats";
const weeklyViewName = "scrubbed_messages_weekly_stats";
const monthlyViewName = "scrubbed_messages_monthly_stats";

(async function main() {
  const client = await MongoClient.connect(MONGODB_CONNECTION_URI);
  try {
    const db = client.db(MONGODB_DATABASE_NAME);
    await db.dropCollection(dailyViewName);
    await createScrubbedMessageStatsForDayView({
      db,
      viewName: dailyViewName,
    });
    await db.dropCollection(weeklyViewName);
    await createScrubbedMessageStatsForWeekView({
      db,
      viewName: weeklyViewName,
    });
    await db.dropCollection(monthlyViewName);
    await createScrubbedMessageStatsForMonthView({
      db,
      viewName: monthlyViewName,
    });
  } finally {
    await client.close();
  }
})();
