import axios from "axios";
import { z } from "zod";
import assert from "assert/strict";

export const PatronusEvaluationApiResultSchema = z.object({
  criterion_id: z.string(),
  profile_name: z.string().nullable(),
  status: z.string(),
  error_message: z.string().nullable(),
  evaluation_result: z.object({
    id: z.string().nullable(),
    app: z.string(),
    explanation: z.string().nullable(),
    score_normalized: z.number(),
    pass: z.boolean().nullable(),
  }),
});
export type PatronusEvaluationApiResult = z.infer<
  typeof PatronusEvaluationApiResultSchema
>;

const PatronusEvaluationApiResponseSchema = z.object({
  results: z.array(PatronusEvaluationApiResultSchema),
});

export interface PatronusClientParams {
  /**
    By default, uses the hosted Patronus platform.
    @default "https://api.patronus.ai/v1"
   */
  baseUrl?: string;
  apiKey: string;
  /**
    Key-value pair tags to apply to all evaluation requests to Patronus API.
   */
  globalTags?: Record<string, string>;
}

/**
  Interact with [Patronus AI evaluators](https://docs.patronus.ai/docs/evaluators)
  via [Patronus RESTful API](https://docs.patronus.ai/reference/patronus-ai-api).
 */
export class PatronusEvaluatorClient {
  private baseUrl: string;
  private headers: {
    "X-API-KEY": string;
  };
  private globalTags?: Record<string, string>;

  constructor({ baseUrl, apiKey, globalTags }: PatronusClientParams) {
    // Make sure baseUrl doesn't end in "/"
    this.baseUrl = (baseUrl ?? "https://api.patronus.ai/v1").replace(
      /\/+$/,
      ""
    );
    this.headers = {
      "X-API-KEY": apiKey,
    };
    this.globalTags = globalTags;
  }

  /**
    Evaluates using `retrieval-answer-relevance-v2`.
    Measures whether the model answer is relevant to the user input.
   */
  async evaluateAnswerRelevanceV2(
    input: string,
    output: string,
    tags?: Record<string, string>
  ) {
    return await this.callEvaluatorApi(
      "retrieval-answer-relevance-v2",
      {
        input,
        output,
      },
      tags
    );
  }

  /**
    Evaluates using `retrieval-context-relevance-v1`.
    Measures whether the retrieved context is relevant to the user input.
   */
  async evaluateContextRelevanceV1(
    input: string,
    contexts: string[],
    tags?: Record<string, string>
  ) {
    return await this.callEvaluatorApi(
      "retrieval-context-relevance-v1",
      {
        input,
        contexts,
      },
      tags
    );
  }

  /**
    Evaluates using `retrieval-hallucination-v2`.
    Measures whether the generated model output is faithful to the retrieved context
    (i.e. is there a hallucination in the response).
   */
  async evaluateHallucinationV2(
    input: string,
    output: string,
    contexts: string[],
    tags?: Record<string, string>
  ) {
    return await this.callEvaluatorApi(
      "retrieval-hallucination-v2",
      {
        input,
        output,
        contexts,
      },
      tags
    );
  }

  /**
    @param output - What the model outputs.
    @param goldAnswer - Ideal answer from model.
    @param tags - Tags to apply to the evaluation run.
   */
  async evaluateExactMatch(
    output: string,
    goldAnswer: string,
    tags?: Record<string, string>
  ) {
    return await this.callEvaluatorApi(
      "exact-match",
      {
        output,
        goldAnswer,
      },
      tags
    );
  }

  /**
    Light wrapper around Patronus API `POST /evaluate` endpoint.
    Includes reasonable defaults selected for reporting.
   */
  async callEvaluatorApi(
    evaluator: string,
    data: {
      input?: string;
      output?: string;
      contexts?: string[];
      goldAnswer?: string;
    },
    tags?: Record<string, string>
  ): Promise<PatronusEvaluationApiResult> {
    const res = await axios.post(
      `${this.baseUrl}/evaluate`,
      {
        evaluators: [
          {
            evaluator_id: evaluator,
            explain_strategy: "always",
          },
        ],
        evaluated_model_input: data.input,
        evaluated_model_retrieved_context: data.contexts,
        evaluated_model_output: data.output,
        evaluated_model_gold_answer: data.goldAnswer,
        capture: "all",
        tags:
          this.globalTags || tags
            ? {
                ...(this.globalTags ?? {}),
                ...(tags ?? {}),
              }
            : undefined,
      },
      {
        headers: this.headers,
      }
    );

    const safeRes = PatronusEvaluationApiResponseSchema.parse(res.data);
    assert(
      safeRes.results.length === 1,
      "There should only be one response object"
    );
    return safeRes.results[0];
  }

  /**
    Call custom evaluator API `custom-v1`.
    Wraps Patronus API `POST /evaluate` endpoint
    custom evaluator functionality.
   */
  async evaluateCustomV1(
    passCriteria: string,
    data: {
      input: string;
      output: string;
    },
    tags?: Record<string, string>
  ) {
    const res = await axios.post(
      `${this.baseUrl}/evaluate`,
      {
        evaluators: [
          {
            evaluator_id: "custom-v1",
            explain_strategy: "always",
            profile_inline: {
              pass_criteria: passCriteria,
            },
          },
        ],
        evaluated_model_input: data.input,
        evaluated_model_output: data.output,
        capture: "all",
        tags:
          this.globalTags || tags
            ? {
                ...(this.globalTags ?? {}),
                ...(tags ?? {}),
              }
            : undefined,
      },
      {
        headers: this.headers,
      }
    );

    const safeRes = PatronusEvaluationApiResponseSchema.parse(res.data);
    assert(
      safeRes.results.length === 1,
      "There should only be one response object"
    );
    return safeRes.results[0];
  }
}
