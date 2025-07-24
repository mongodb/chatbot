import {
  VerifiedAnswer,
  FindVerifiedAnswerFunc,
  DataStreamer,
  type ResponseStreamOutputTextDelta,
  type ResponseStreamOutputTextAnnotationAdded,
  type ResponseStreamOutputTextDone,
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

export const addMessageToConversationVerifiedAnswerStream: MakeVerifiedAnswerGenerateResponseParams["stream"] =
  {
    onVerifiedAnswerFound: ({ verifiedAnswer, dataStreamer }) => {
      dataStreamer.streamData({
        type: "metadata",
        data: {
          verifiedAnswer: {
            _id: verifiedAnswer._id,
            created: verifiedAnswer.created,
            updated: verifiedAnswer.updated,
          },
        },
      });
      dataStreamer.streamData({
        type: "delta",
        data: verifiedAnswer.answer,
      });
      dataStreamer.streamData({
        type: "references",
        data: verifiedAnswer.references,
      });
    },
  };

export const responsesVerifiedAnswerStream: MakeVerifiedAnswerGenerateResponseParams["stream"] =
  {
    onVerifiedAnswerFound: ({ verifiedAnswer, dataStreamer }) => {
      dataStreamer.streamResponses({
        type: "response.output_text.delta",
        delta: verifiedAnswer.answer,
        content_index: 0,
        output_index: 0,
        item_id: "",
      } satisfies ResponseStreamOutputTextDelta);

      verifiedAnswer.references.forEach(({ title, url }, annotation_index) => {
        dataStreamer.streamResponses({
          type: "response.output_text.annotation.added",
          annotation: {
            type: "url_citation",
            url,
            title,
            start_index: 0,
            end_index: 0,
          },
          annotation_index,
          content_index: 0,
          output_index: 0,
          item_id: "",
        } satisfies ResponseStreamOutputTextAnnotationAdded);
      });

      dataStreamer.streamResponses({
        type: "response.output_text.done",
        text: verifiedAnswer.answer,
        content_index: 0,
        output_index: 0,
        item_id: "",
      } satisfies ResponseStreamOutputTextDone);
    },
  };

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
    const {
      latestMessageText,
      shouldStream,
      dataStreamer,
      customSystemPrompt,
    } = args;
    if (customSystemPrompt) {
      return await onNoVerifiedAnswerFound(args);
    }
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
