import * as braintrust from "braintrust";
import { AnswerRelevancy, ContextRelevancy, Faithfulness } from "autoevals";
import { ConversationGeneratedData } from "mongodb-chatbot-evaluation";
import { PromisePool } from "@supercharge/promise-pool";
import assert from "assert";
import {
  Conversation,
  UserMessage,
  AssistantMessage,
} from "mongodb-chatbot-server";
import { z } from "zod";
import { extractConversationEvalData } from "./utils";
export interface EvaluateRagConversationsParams {
  projectName: string;
  conversationGeneratedData: ConversationGeneratedData[];
  regExp: RegExp;
  metadata?: Record<string, unknown>;
  description?: string;
  experimentName?: string;
}

export async function evaluateRegexMatch({
  projectName,
  conversationGeneratedData,
  regExp,
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
    .process(async (conversation, index, pool) => {
      console.log(
        `Running experiment ${index + 1}/${conversationGeneratedData.length}`
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
