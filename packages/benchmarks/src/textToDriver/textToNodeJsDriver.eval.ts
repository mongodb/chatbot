import { runTextToDriverEval } from "./runTextToDriverEval";
import { radiantModels } from "../radiantModels";
import { MongoClient } from "mongodb-rag-core";
async function main() {
  const projectName = "text-to-node-js-driver-benchmark";
  const datasetName = "text-to-query-results";
  // TODO: there'll be some stuff to set up the task w/ MongoDB

  // TODO: load when prompts PR merged
  const prompts = {
    name: "value",
    name2: "value2",
  };
  const mongoClient = new MongoClient("TODO: pass from env");

  try {
    await Promise.allSettled(
      radiantModels.map(async (modelInfo) => {
        const modelEvalPromises = Object.entries(prompts).map(
          // TODO: use value to construct the task...
          async ([key, value]) => {
            // TODO: use task
            return runTextToDriverEval({
              dataset: {
                name: datasetName,
              },
              experimentName: `${modelInfo.label}-${key}`,
              metadata: { ...modelInfo, promptStrategy: key },
              modelName: modelInfo.radiantModelDeployment,
              projectName,
            });
          }
        );
        for (const modelEvalPromise of modelEvalPromises) {
          await modelEvalPromise;
        }
      })
    );
  } finally {
    await mongoClient.close();
  }
}
main();
