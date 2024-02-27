import { ObjectId } from "mongodb-rag-core";
import { ReportEvalFunc } from "../report";
import { MockFindFilter } from "./MockFindFilter";
import { EvalResult } from "../evaluate";

/**
  Calculates the number of eval results matching the evaluationRunId
  and returns that number in the `data.numEvals` property.
 */
export const mockReportEvalFunc: ReportEvalFunc = async ({
  evaluationRunId,
  evaluationStore,
  runId,
}) => {
  const filter: MockFindFilter<EvalResult> = (evalRes) =>
    evalRes.commandRunMetadataId.equals(evaluationRunId);
  const evals = await evaluationStore.find(filter);
  return {
    _id: new ObjectId(),
    reportName: "mock_report",
    evaluationRunId,
    commandRunMetadataId: runId,
    createdAt: new Date(),
    data: {
      numEvals: evals?.length ?? 0,
    },
  };
};
