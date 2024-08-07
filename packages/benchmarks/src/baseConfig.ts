import {
  EvalConfig,
  makeMongoDbCommandMetadataStore,
  makeMongoDbEvaluationStore,
  makeMongoDbGeneratedDataStore,
  makeMongoDbReportStore,
} from "mongodb-chatbot-evaluation";

export const makeBaseConfig = (connectionUri: string, databaseName: string) => {
  const storeDbOptions = {
    connectionUri,
    databaseName,
  };
  return {
    metadataStore: makeMongoDbCommandMetadataStore(storeDbOptions),
    generatedDataStore: makeMongoDbGeneratedDataStore(storeDbOptions),
    evaluationStore: makeMongoDbEvaluationStore(storeDbOptions),
    reportStore: makeMongoDbReportStore(storeDbOptions),
  } satisfies Pick<
    EvalConfig,
    "metadataStore" | "generatedDataStore" | "evaluationStore" | "reportStore"
  >;
};
