import { startOfMonth } from "../materialize/materializedViewUtils";
import { createScrubbedMessageStatsViews } from "../materialize/scrubbed_messages_stats";

async function main() {
  let since: Date | undefined = startOfMonth(new Date());
  process.argv.forEach((val) => {
    if (val === "--all") {
      since = undefined;
    }
  });
  await createScrubbedMessageStatsViews({
    granularity: ["daily", "weekly", "monthly"],
    since,
    statsCollectionName: "scrubbed_messages_stats",
  });
}

main();
