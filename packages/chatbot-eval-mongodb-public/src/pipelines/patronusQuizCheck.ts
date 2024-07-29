import { runPipeline } from "mongodb-chatbot-evaluation";
import configConstructor from "../patronus.eval.config";
import { ObjectId } from "mongodb-rag-core";

runPipeline({
  configConstructor,
  pipeline: async (_generate, evaluate) => {
    const gpt35RunId = new ObjectId("6684174d7db25ec3ea206f4e");
    const gpt4oRunId = new ObjectId("6684174d7db25ec3ea206f50");

    // Run the eval runs on the different generated data in parallel
    await Promise.allSettled([
      // gpt-3.5
      (async () => {
        await evaluate("gpt35_quiz_check", gpt35RunId);
      })(),
      // gpt-4o
      (async () => {
        await evaluate("gpt4o_quiz_check", gpt4oRunId);
      })(),
    ]);
  },
});
