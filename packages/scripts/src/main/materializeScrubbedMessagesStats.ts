import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import {
  isStartOfMonth,
  startOfMonth,
} from "../materialize/materializedViewUtils";
import { createScrubbedMessageStatsViews } from "../materialize/scrubbed_messages_stats";

async function main() {
  const args = yargs(hideBin(process.argv))
    .option("all", {
      type: "boolean",
      description: "Materialize all stats",
    })
    .option("since", {
      type: "string",
      description: "Materialize stats since a specific date (YYYY-MM-DD)",
      coerce: (value: string) => {
        if (value === "") {
          throw new Error("Must provide a date value for --since");
        }
        return new Date(value);
      },
    })
    .conflicts("all", "since")
    .parseSync();

  const since = args.since ?? (args.all ? undefined : startOfMonth(new Date()));

  if (args.all) {
    console.log("Materializing stats for all time");
  } else if (isStartOfMonth(since)) {
    console.log("Materializing stats since", since?.toISOString());
  } else {
    throw new Error(
      `--since must be the first day of the month, e.g. "2024-01-01" or "2024-01-01T00:00:00Z"`
    );
  }

  await createScrubbedMessageStatsViews({
    granularity: ["daily", "weekly", "monthly"],
    since,
    statsCollectionName: "scrubbed_messages_stats",
  });
}

main();
