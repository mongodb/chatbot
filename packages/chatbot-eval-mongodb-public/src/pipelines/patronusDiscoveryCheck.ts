import { runPipeline } from "mongodb-chatbot-evaluation";
import configConstructor from "../patronus.eval.config";
import { ObjectId } from "mongodb-rag-core";

runPipeline({
  configConstructor,
  pipeline: async (_generate, evaluate) => {
    const gpt35RunId = new ObjectId("6697d593e310cb2895dd98ab");
    const gpt4oRunId = new ObjectId("668bee7ef618eee7c5856151");

    // Run the eval runs on the different generated data in parallel
    await Promise.allSettled([
      // gpt-3.5
      (async () => {
        await evaluate("gpt35_mongodb_discovery", gpt35RunId);
      })(),
      // gpt-4o
      (async () => {
        await evaluate("gpt4o_mongodb_discovery", gpt4oRunId);
      })(),
    ]);
  },
});
