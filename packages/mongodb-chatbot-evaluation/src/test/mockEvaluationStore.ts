import { EvaluationStore, EvalResult } from "../evaluate/EvaluationStore";
import { MockFindFilter } from "./MockFindFilter";

export const makeMockEvaluationStore = () => {
  const memDb: Record<string, EvalResult> = {};
  return {
    async find(filterFunc: MockFindFilter<EvalResult>) {
      return Object.values(memDb).filter(filterFunc);
    },
    async insertOne(evalResult: EvalResult) {
      memDb[evalResult._id.toHexString()] = evalResult;
      return true;
    },
    async insertMany(evalResults: EvalResult[]) {
      for (const evalResult of evalResults) {
        memDb[evalResult._id.toHexString()] = evalResult;
      }
      return true;
    },
    aggregate: jest.fn(),
    close: jest.fn(),
  } satisfies EvaluationStore;
};
