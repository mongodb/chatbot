import { runPipeline } from "mongodb-chatbot-evaluation";
import configConstructor from "../patronus.eval.config";
import { ObjectId } from "mongodb-rag-core";

runPipeline({
  configConstructor,
  pipeline: async (_generate, evaluate) => {
    const gpt35RunId = new ObjectId("669019be0aae97ffdafcd0ff");
    const gpt4oRunId = new ObjectId("66901df714b4b4953729c844");
    const evaluators = [
      "answer_relevance",
      "context_relevance",
      "context_sufficiency",
    ];
    // Run the eval runs on the different generated data in parallel
    await Promise.allSettled([
      // gpt-3.5
      (async () => {
        // Run the evals in parallel
        return await Promise.allSettled(
          evaluators.map(async (evaluator) => {
            await evaluate(`gpt35_${evaluator}`, gpt35RunId);
          })
        );
      })(),
      // gpt-4o
      (async () => {
        // Run the evals in parallel
        return await Promise.allSettled(
          evaluators.map(async (evaluator) => {
            await evaluate(`gpt4o_${evaluator}`, gpt4oRunId);
          })
        );
      })(),
    ]);
  },
});
