import { ObjectId } from "mongodb-rag-core";
import { ReportEvalFunc } from "./ReportEvalFunc";

/**
  Report the average score of an evaluation run.
 */
export const reportAverageScore: ReportEvalFunc = async ({
  runId,
  evaluationStore,
  evaluationRunId,
  reportName,
}) => {
  const pipeline = [
    {
      $match: {
        commandRunMetadataId: evaluationRunId,
      },
    },
    {
      $group: {
        _id: null,
        averageScore: { $avg: "$result" },
        totalTestCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        averageScore: 1,
        totalTestCount: 1,
      },
    },
  ];
  const result = await evaluationStore.aggregate(pipeline);
  return {
    _id: new ObjectId(),
    commandRunMetadataId: runId,
    name: reportName,
    type: "average_score",
    data: result[0],
    createdAt: new Date(),
  };
};
