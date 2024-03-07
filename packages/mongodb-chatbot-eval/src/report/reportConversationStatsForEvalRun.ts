import { ObjectId } from "mongodb-rag-core";
import { ReportEvalFunc, ReportEvalFuncParams } from "./ReportEvalFunc";
import { strict as assert } from "assert";
import { Report } from "./ReportStore";

/**
  Report on the pass percentage of the `"conversation_quality"` evaluation
  for eval run `evaluationRunId`.
 */
export const reportConversationStatsForEvalRun: ReportEvalFunc = async ({
  runId,
  evaluationStore,
  evaluationRunId,
}: ReportEvalFuncParams) => {
  const pipeline = [
    {
      $match: {
        commandRunMetadataId: evaluationRunId,
        evalName: "conversation_quality",
      },
    },
    {
      $group: {
        _id: null,
        totalCount: { $sum: 1 },
        passCount: {
          $sum: {
            $cond: [{ $eq: ["$result", 1] }, 1, 0],
          },
        },
        failCount: {
          $sum: {
            $cond: [{ $eq: ["$result", 0] }, 1, 0],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalCount: 1,
        passCount: 1,
        failCount: 1,
        passRate: {
          $divide: ["$passCount", "$totalCount"],
        },
      },
    },
  ];
  const result = await evaluationStore.aggregate(pipeline);
  assert(result.length === 1, "Expected exactly one result.");
  const { passRate, totalCount, passCount, failCount } = result[0];
  assert(typeof passRate === "number", "Expected 'passRate' to be a number.");
  assert(
    typeof totalCount === "number",
    "Expected 'totalCount' to be a number."
  );
  return {
    _id: new ObjectId(),
    commandRunMetadataId: runId,
    reportName: "conversation_quality_stats",
    data: {
      passRate,
      passCount,
      failCount,
      totalTestCount: totalCount,
    },
    createdAt: new Date(),
  } satisfies Report;
};
