import { ObjectId } from "mongodb-rag-core";
import { ReportEvalFunc, ReportEvalFuncParams } from "./ReportEvalFunc";
import { strict as assert } from "assert";
import { Report } from "./ReportStore";

/**
  Report on the pass percentage of a binary evaluation (eval that return either 1 or 0)
  for eval run `evaluationRunId`.
 */
export const reportStatsForBinaryEvalRun: ReportEvalFunc = async ({
  runId,
  evaluationStore,
  evaluationRunId,
  reportName,
}: ReportEvalFuncParams) => {
  const pipeline = [
    {
      $match: {
        commandRunMetadataId: evaluationRunId,
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
    name: reportName,
    type: "binary_eval_stats",
    data: {
      passRate,
      passCount,
      failCount,
      totalTestCount: totalCount,
    },
    createdAt: new Date(),
  } satisfies Report;
};
