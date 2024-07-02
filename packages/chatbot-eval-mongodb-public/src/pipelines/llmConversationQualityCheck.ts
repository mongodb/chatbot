import { runPipeline } from "mongodb-chatbot-evaluation";
import configConstructor from "../eval.config";

/*
  Pipeline checks how well various LLMs without retrieval-augmented generation
  perform on on our standard conversation quality metrics.

  Useful for assessing the quality of LLM in answering MongoDB-related questions.
 */
runPipeline({
  configConstructor,
  pipeline: async (generate, evaluate, report) => {
    /*
      Execute multiple pipelines in parallel.
      Since they're using different LLMs, we don't have to worry
      about rate limit interference.
     */
    await Promise.allSettled([
      (async () => {
        const {
          commandRunMetadata: { _id: genRunId },
        } = await generate("gpt35_0613_Conversations");
        const {
          commandRunMetadata: { _id: evalRunId },
        } = await evaluate("conversationQuality", genRunId);
        await report("gpt35_0613_ConversationQualityRun", evalRunId);
      })(),
      (async () => {
        const {
          commandRunMetadata: { _id: genRunId },
        } = await generate("gpt4_0124_Conversations");
        const {
          commandRunMetadata: { _id: evalRunId },
        } = await evaluate("conversationQuality", genRunId);
        await report("gpt4_0124_ConversationQualityRun", evalRunId);
      })(),
    ]);
  },
});
