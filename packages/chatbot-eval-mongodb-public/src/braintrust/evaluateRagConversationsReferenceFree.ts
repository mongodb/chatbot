import * as braintrust from "braintrust";
import {
  AnswerRelevancy,
  ContextRelevancy,
  Faithfulness,
  Scorer,
} from "autoevals";
import { ConversationGeneratedData } from "mongodb-chatbot-evaluation";
import { PromisePool } from "@supercharge/promise-pool";
import { extractConversationEvalData } from "./utils";
export interface EvaluateRagConversationsParams {
  projectName: string;
  conversationGeneratedData: ConversationGeneratedData[];
  evaluatorConfig: {
    apiKey: string;
    modelName: string;
    baseUrl?: string;
    headers?: Record<string, string>;
  };
  metadata?: Record<string, unknown>;
  description?: string;
  experimentName?: string;
}

const retrievedContext: Scorer<string, { context: string[] }> = async ({
  context,
}) => {
  return {
    name: "RetrievedContext",
    score: context.length ? 1 : 0,
  };
};

const allowedQuery: Scorer<string, { allowedQuery: boolean }> = async ({
  allowedQuery,
}) => {
  return {
    name: "AllowedQuery",
    score: allowedQuery ? 1 : 0,
  };
};

/**
  Evaluates a {@link ConversationGeneratedData} using [Braintrust](https://braintrustdata.com)
  based on the reference-free evaluation metrics from the `autoevals` library:
  - {@link Faithfulness}
  - {@link AnswerRelevancy}
  - {@link ContextRelevancy}

  Also uses the {@link retrievedContext} metric to check if any context was retrieved.
 */
export async function evaluateRagConversationsReferenceFree({
  projectName,
  conversationGeneratedData,
  evaluatorConfig,
  metadata,
  description,
  experimentName,
}: EvaluateRagConversationsParams) {
  const experiment = braintrust.init(projectName, {
    metadata,
    description,
    experiment: experimentName,
  });

  await PromisePool.for(conversationGeneratedData)
    .withConcurrency(3)
    .process(async (conversation, index) => {
      console.log(
        `Running experiment ${index + 1}/${conversationGeneratedData.length}`
      );
      await experiment.traced(async (span) => {
        const { input, output, contexts, tags, rejectQuery } =
          extractConversationEvalData(conversation);

        const scores: Record<string, number | null> = {};
        const evaluators = [
          Faithfulness,
          AnswerRelevancy,
          ContextRelevancy,
          retrievedContext,
          allowedQuery,
        ];
        for (const evaluator of evaluators) {
          const { name, score } = await evaluator({
            input,
            output,
            context: contexts,
            openAiApiKey: evaluatorConfig.apiKey,
            model: evaluatorConfig.modelName,
            openAiBaseUrl: evaluatorConfig.baseUrl,
            openAiDefaultHeaders: evaluatorConfig.headers,
            allowedQuery: !rejectQuery,
          });
          scores[name] = score;
        }

        span.log({
          input,
          output,
          tags,
          scores,
          metadata: { contexts, hasContexts: contexts.length > 0 },
        });
      });
    });

  const summary = await experiment.summarize();
  console.log(summary);
  return summary;
}
