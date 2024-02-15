import { ObjectId } from "../core";

export interface EvalResult {
  _id: ObjectId;
  conversationId: ObjectId;
  commandRunMetadataId: ObjectId;
  evalName: string;
  /**
    Number between 0 and 1, inclusive.
   */
  result: number;
  endTime: Date;
}

export interface EvaluationStore {
  insertOne(evalResult: EvalResult): Promise<boolean>;
  find(filter: Record<string, unknown>): Promise<EvalResult[] | undefined>;
}

// TODO: implement
export function makeMongoDbEvaluationStore(): EvaluationStore {
  return {
    async insertOne(evalResult) {
      return true;
    },
    async find(filter) {
      return undefined;
    },
  };
}
