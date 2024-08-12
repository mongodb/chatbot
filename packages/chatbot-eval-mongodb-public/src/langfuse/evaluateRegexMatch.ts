import { ConversationGeneratedData } from "mongodb-chatbot-evaluation";
import { PromisePool } from "@supercharge/promise-pool";
import { Langfuse } from "langfuse";
import { extractConversationEvalData } from "../braintrust/utils";
export interface EvaluateRagConversationsParams {
  projectName: string;
  conversationGeneratedData: ConversationGeneratedData[];
  regExp: RegExp;
  metadata?: Record<string, unknown>;
  description?: string;
  experimentName?: string;
  publicKey: string;
  secretKey: string;
  baseUrl: string;
}

export async function evaluateRegexMatch({
  conversationGeneratedData,
  regExp,
  metadata,
  experimentName,
  publicKey,
  secretKey,
  baseUrl,
}: EvaluateRagConversationsParams) {
  const langfuse = new Langfuse({
    publicKey,
    secretKey,
    baseUrl,
    release: experimentName,
  });

  await PromisePool.for(conversationGeneratedData)
    .withConcurrency(3)
    .process(async (conversation, index) => {
      console.log(
        `Running experiment ${index + 1}/${conversationGeneratedData.length}`
      );
      const { input, output, tags } = extractConversationEvalData(conversation);

      const trace = langfuse.trace({
        metadata,
        tags,
        name: input,
      });
      trace.generation({
        input,
        output,
      });
      trace.score({
        name: "RegexMatch",
        value: regExp.test(output) ? 1 : 0,
        comment: `Matches regex ${regExp.toString()}`,
      });
    });

  await langfuse.shutdownAsync();
}
