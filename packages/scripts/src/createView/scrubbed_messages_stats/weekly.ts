/**
  Creates views with aggregated analytics stats. This is useful for things
  like our dashboard which charts historical usage.
 */

import "dotenv/config";
import { Db, Document } from "mongodb-rag-core";
import { ChatbotStats } from ".";

export type ScrubbedMessageStatsForWeek = Document &
  ChatbotStats & {
    date: Date;
    year: number;
    week: number;
  };

export function createScrubbedMessageStatsForWeekView({
  db,
  viewName,
}: {
  db: Db;
  viewName: string;
}) {
  return db.createCollection<ScrubbedMessageStatsForWeek>(viewName, {
    viewOn: "scrubbed_messages",
    pipeline: [
      {
        $match: {
          role: "user",
        },
      },
      {
        $group: {
          _id: {
            isoWeek: {
              $isoWeek: "$createdAt",
            },
            isoYear: {
              $isoWeekYear: "$createdAt",
            },
          },
          numMessages: {
            $sum: 1,
          },
          conversations: {
            $addToSet: "$conversationId",
          },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.isoYear",
          week: "$_id.isoWeek",
          date: {
            $dateFromParts: {
              isoWeekYear: "$_id.isoYear",
              isoWeek: "$_id.isoWeek",
              isoDayOfWeek: 1,
            },
          },
          numMessages: 1,
          numConversations: {
            $size: "$conversations",
          },
        },
      },
      {
        $sort: {
          year: -1,
          week: -1,
        },
      },
    ],
  });
}
