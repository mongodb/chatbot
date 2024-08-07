/**
  Creates views with aggregated analytics stats. This is useful for things
  like our dashboard which charts historical usage.
 */

import "dotenv/config";
import { Db, Document } from "mongodb-rag-core";
import { ChatbotStats } from ".";

export type ScrubbedMessageStatsForMonth = Document &
  ChatbotStats & {
    date: Date;
    year: number;
    month: number;
  };

export function createScrubbedMessageStatsForMonthView({
  db,
  viewName,
}: {
  db: Db;
  viewName: string;
}) {
  return db.createCollection<ScrubbedMessageStatsForMonth>(viewName, {
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
            month: {
              $month: "$createdAt",
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
          month: "$_id.month",
          date: {
            $dateFromParts: {
              year: "$_id.isoYear",
              month: "$_id.month",
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
          month: -1,
        },
      },
    ],
  });
}
