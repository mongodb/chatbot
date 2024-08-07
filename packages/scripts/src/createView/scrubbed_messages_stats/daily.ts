/**
  Creates views with aggregated analytics stats. This is useful for things
  like our dashboard which charts historical usage.
 */

import "dotenv/config";
import { Db, Document } from "mongodb-rag-core";
import { ChatbotStats } from ".";

export type ScrubbedMessageStatsForDay = Document &
  ChatbotStats & {
    date: Date;
    year: number;
    dayOfYear: number;
    month: number;
    dayOfMonth: number;
    week: number;
    dayOfWeek: number;
  };

export function createScrubbedMessageStatsForDayView({
  db,
  viewName,
}: {
  db: Db;
  viewName: string;
}) {
  return db.createCollection<ScrubbedMessageStatsForDay>(viewName, {
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
            dayOfYear: {
              $dayOfYear: "$createdAt",
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
          dayOfYear: "$_id.dayOfYear",
          date: {
            $dateFromParts: {
              year: "$_id.isoYear",
              day: "$_id.dayOfYear",
            },
          },
          numMessages: 1,
          numConversations: {
            $size: "$conversations",
          },
        },
      },
      {
        $addFields: {
          month: {
            $month: "$date",
          },
          dayOfMonth: {
            $dayOfMonth: "$date",
          },
          week: {
            $week: "$date",
          },
          dayOfWeek: {
            $dayOfWeek: "$date",
          },
        },
      },
      {
        $sort: {
          year: -1,
          dayOfYear: -1,
        },
      },
    ],
  });
}
