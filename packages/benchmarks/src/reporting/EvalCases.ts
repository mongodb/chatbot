import { ObjectId } from "mongodb-rag-core/mongodb";
import { OpenAI } from "mongodb-rag-core/openai";

type ChatCompletionMessageParam = OpenAI.Chat.ChatCompletionMessageParam;

/**
 This represents a single prompt that we pass to models for evaluation.
*/
export type BaseCase<
  CaseMetadata extends Record<string, unknown> = Record<string, unknown>,
  CaseResult extends Result = Result
> = {
  /*
  A unique identifier for the prompt.
  */
  _id: ObjectId;

  /*
  The type of prompt. This determines the format of the prompt, its expected response, and the type of metrics we use to evaluate the results.
  */
  type: string;

  /*
  A list of tags for the prompt that we can filter by.
  */
  tags: string[];

  /*
  Metadata about the prompt.
  */
  metadata?: CaseMetadata;

  /*
  A human readable label for the case. For most cases this will just be the natural language query.
  */
  name: string;

  /*
  The prompt messages that we pass to the model.
  */
  prompt: ChatCompletionMessageParam[];

  /*
  The expected response from the model. The format of this depends on the type of prompt.
  */
  expected: string;

  /*
   A list of results for the prompt.
   */
  results: {
    [modelName: string]: CaseResult;
  };
};

/**
 This represents the result of running a prompt through a specific model.
*/
type Result<
  Metadata extends Record<string, unknown> = Record<string, unknown>
> = {
  /*
  The name of the model that was used to generate the result.
  */
  model: string;

  /*
  The name of the company/lab that created the model.
  */
  provider: string;

  /*
  The date and time the result was generated.
  */
  date: Date;

  /*
  The response returned from the model.
  */
  response: string;

  /*
  Additional metadata about the result. For example, we could use this to map results back to their experiment name in Braintrust
  */
  metadata?: Metadata;

  /*
  A list of evaluation metrics that we use to judge the quality of the result.
  */
  metrics: {
    [metricName: string]: number;
  };
};

/**
 This represents a multiple choice prompt. Used for evaluating models that can choose from a list of options.
 For example, the prompt may be an individual MongoDB University quiz question or skill assessment question.
 The response is a string containing one or more choices that correspond to the correct answer.
*/
export type MultipleChoiceCase = BaseCase & {
  type: "multiple_choice";
};

/**
 This represents a natural language prompt. Used for evaluating models that can generate text.
 For example, the prompt may be a technical support question, product knowledge question, or general awareness question.
 The response is a single string that, ideally, matches the expected answer.
*/
export type NaturalLanguageCase = BaseCase & {
  type: "natural_language";
};

/**
 This represents a code generation prompt. Used for evaluating models that can generate code.
 For example, the prompt may be a user query on a specific collection, with or without additional context like schemas, indexes, etc.
 The response is code representing a valid MongoDB query that returns the expected results.
*/
export type NaturalLanguageToCodeCase = BaseCase & {
  type: "natural_language_to_code";
  results: (Result & {
    /*
     The type of code we're generating, e.g. mongosh, Java Driver, etc.
    */
    target: string;

    /*
    The value returned after executing the generated code
    */
    codeResult: unknown;
  })[];
};
