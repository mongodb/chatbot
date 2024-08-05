import { AnswerRelevancy, ContextRelevancy, Faithfulness } from "autoevals";
import { ConversationGeneratedData } from "mongodb-chatbot-evaluation";
import {
  runTestSuite,
  BaseTestEvaluator,
  Evaluation,
} from "@autoblocks/client/testing";
import { extractConversationEvalData } from "../braintrust/utils";

interface RagTestCase {
  input: string;
  contexts: string[];
  output: string;
}

type RagEvaluator = BaseTestEvaluator<RagTestCase, string>;

interface MakeAnswerRelevancyParams {
  scorer: {
    id: string;
    func:
      | typeof AnswerRelevancy
      | typeof ContextRelevancy
      | typeof Faithfulness;
  };

  maxConcurrency?: RagEvaluator["maxConcurrency"];
  metadata: Evaluation["metadata"];
  threshold?: Evaluation["threshold"];
  evaluatorConfig: {
    apiKey: string;
    modelName: string;
    baseUrl?: string;
    headers?: Record<string, string>;
  };
}
const makeAutoevalsRagEvaluator = function (
  params: MakeAnswerRelevancyParams
): BaseTestEvaluator<RagTestCase, string> {
  const evaluator: BaseTestEvaluator<RagTestCase, string> = {
    id: params.scorer.id,
    maxConcurrency: params.maxConcurrency ?? 1,
    async evaluateTestCase({ testCase, output }): Promise<Evaluation> {
      const results = await params.scorer.func({
        output,
        context: testCase.contexts,
        input: testCase.input,
        openAiApiKey: params.evaluatorConfig.apiKey,
        openAiBaseUrl: params.evaluatorConfig.baseUrl,
        openAiDefaultHeaders: params.evaluatorConfig.headers,
        model: params.evaluatorConfig.modelName,
      });
      console.log("got results for", testCase.input, "for", params.scorer.id);
      console.log("results", results);
      const score = results.score ?? 0;

      return {
        score,
        metadata: params.metadata,
      };
    },
  };
  Object.setPrototypeOf(evaluator, BaseTestEvaluator.prototype);
  return evaluator;
};

export interface EvaluateRagConversationsParams {
  conversationGeneratedData: ConversationGeneratedData[];
  evaluatorConfig: {
    apiKey: string;
    modelName: string;
    baseUrl?: string;
    headers?: Record<string, string>;
  };
  metadata?: Record<string, unknown>;
  experimentName: string;
  maxConcurrency?: number;
}
/**
  Evaluates a {@link ConversationGeneratedData} using [Autoblocks](https://autoblocks.ai)
  based on the reference-free evaluation metrics from the `autoevals` library:

  - {@link Faithfulness}
  - {@link AnswerRelevancy}
  - {@link ContextRelevancy}
 */
export async function evaluateRagConversationsReferenceFree({
  conversationGeneratedData,
  evaluatorConfig,
  metadata,
  experimentName,
  maxConcurrency,
}: EvaluateRagConversationsParams) {
  const scorers = [
    { id: "answer-relevance", func: AnswerRelevancy },
    { id: "faithfulness", func: Faithfulness },
    { id: "context-relevance", func: ContextRelevancy },
  ];

  const evaluators = scorers.map((scorer) =>
    makeAutoevalsRagEvaluator({
      metadata,
      scorer,
      evaluatorConfig,
      maxConcurrency,
    })
  );
  const testCases = conversationGeneratedData.map((genData) =>
    extractConversationEvalData(genData)
  );
  await runTestSuite<RagTestCase, string>({
    id: experimentName,
    testCases,
    testCaseHash: ["input"],
    fn: ({ testCase }) => testCase.output,
    evaluators,
  });
}
