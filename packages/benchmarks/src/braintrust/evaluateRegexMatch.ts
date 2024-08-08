import * as braintrust from "braintrust";
import {
  ConversationGeneratedData,
  SomeGeneratedData,
} from "mongodb-chatbot-evaluation";
import { PromisePool } from "@supercharge/promise-pool";
import {
  checkConversationGeneratedData,
  extractConversationEvalData,
} from "./utils";
export interface EvaluateRagConversationsParams {
  projectName: string;
  generatedData: SomeGeneratedData[];
  regExp: RegExp;
  metadata?: Record<string, unknown>;
  description?: string;
  experimentName?: string;
  apiKey: string;
}
import { logger } from "mongodb-rag-core";

export async function evaluateRegexMatch({
  projectName,
  generatedData,
  regExp,
  metadata,
  description,
  experimentName,
  apiKey,
}: EvaluateRagConversationsParams) {
  const experiment = braintrust.init(projectName, {
    metadata,
    description,
    experiment: experimentName,
    apiKey,
  });

  const conversationGeneratedData = generatedData.map((gd) =>
    checkConversationGeneratedData(gd)
  );
  await PromisePool.for(conversationGeneratedData)
    .withConcurrency(3)
    .process(async (conversation, index, pool) => {
      logger.info(
        `Running span ${index + 1}/${conversationGeneratedData.length}`
      );
      await experiment.traced(async (span) => {
        const { input, output, tags } =
          extractConversationEvalData(conversation);

        span.log({
          input,
          output,
          tags,
          scores: {
            RegexMatch: regExp.test(output) ? 1 : 0,
          },
          metadata: {
            regexp: regExp.toString(),
          },
        });
      });
    });

  const summary = await experiment.summarize();
  console.log(summary);
  return summary;
}
