import { runPipeline } from "mongodb-chatbot-evaluation";
import configConstructor from "../marketing.eval.config";

runPipeline({
  configConstructor,
  pipeline: async (generate, evaluate, report) => {
    // GPT-3.5 check
    const { _id: gpt35GenRunId } = await generate(
      "gpt35_0613_discoveryConversations"
    );

    const { _id: gpt35MongoDbInclusionEvalRunId } = await evaluate(
      "conversationLastMessageMentionsMongoDb",
      gpt35GenRunId
    );
    await report(
      "gpt35_0613_ConversationDiscoveryRun",
      gpt35MongoDbInclusionEvalRunId
    );

    // GPT-4-turbo check
    const { _id: gpt4GenRunId } = await generate(
      "gpt4_0124_discoveryConversations"
    );

    const { _id: gpt4MongoDbInclusionEvalRunId } = await evaluate(
      "conversationLastMessageMentionsMongoDb",
      gpt4GenRunId
    );
    await report(
      "gpt4_0124_ConversationDiscoveryRun",
      gpt4MongoDbInclusionEvalRunId
    );
  },
});
