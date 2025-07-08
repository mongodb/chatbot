import {
  VerifiedAnswer,
  FindVerifiedAnswerFunc,
  DataStreamer,
} from "mongodb-rag-core";
import { strict as assert } from "assert";
import {
  GenerateResponse,
  GenerateResponseReturnValue,
} from "./GenerateResponse";

export interface MakeVerifiedAnswerGenerateResponseParams {
  /**
    Find content based on the user's message and preprocessing.
   */
  findVerifiedAnswer: FindVerifiedAnswerFunc;

  /**
    Format or modify the verified answer before displaying it to the user.
   */
  onVerifiedAnswerFound?: (verifiedAnswer: VerifiedAnswer) => VerifiedAnswer;

  onNoVerifiedAnswerFound: GenerateResponse;

  stream?: {
    onVerifiedAnswerFound: StreamFunction<{ verifiedAnswer: VerifiedAnswer }>;
  };
}

export type StreamFunction<Params> = (
  params: { dataStreamer: DataStreamer } & Params
) => void;

/**
  Searches for verified answers for the user query.
  If no verified answer can be found for the given query, the
  `onNoVerifiedAnswerFound` function is called instead.
 */
export const makeVerifiedAnswerGenerateResponse = ({
  findVerifiedAnswer,
  onVerifiedAnswerFound,
  onNoVerifiedAnswerFound,
  stream,
}: MakeVerifiedAnswerGenerateResponseParams): GenerateResponse => {
  return async (args) => {
    const { latestMessageText, shouldStream, dataStreamer } = args;
    const { answer: foundVerifiedAnswer, queryEmbedding } =
      await findVerifiedAnswer({
        query: latestMessageText,
      });

    if (foundVerifiedAnswer === undefined) {
      return await onNoVerifiedAnswerFound(args);
    }

    const verifiedAnswer =
      onVerifiedAnswerFound?.(foundVerifiedAnswer) ?? foundVerifiedAnswer;

    const metadata = {
      verifiedAnswer: {
        _id: verifiedAnswer._id,
        created: verifiedAnswer.created,
        updated: verifiedAnswer.updated,
      },
    };
    const { answer, references } = verifiedAnswer;

    if (shouldStream) {
      assert(dataStreamer, "Must have dataStreamer if shouldStream=true");
      assert(stream, "Must have stream if shouldStream=true");

      stream.onVerifiedAnswerFound({
        dataStreamer,
        verifiedAnswer,
      });
    }

    return {
      messages: [
        {
          role: "user",
          embedding: queryEmbedding,
          content: latestMessageText,
        },
        {
          role: "assistant",
          content: answer,
          references,
          metadata,
        },
      ],
    } satisfies GenerateResponseReturnValue;
  };
};
