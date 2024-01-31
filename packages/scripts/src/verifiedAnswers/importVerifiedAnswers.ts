import crypto from "crypto";
import { Db } from "mongodb";
import { Embedder } from "mongodb-rag-core";
import { VerifiedAnswerSpec, Reference } from "./parseVerifiedAnswersYaml";
import deepEqual from "deep-equal";

export type Question = {
  embedding: number[];
  embedding_model: string;
  embedding_model_version: string;
  text: string;
};

export type VerifiedAnswer = {
  _id: string;
  question: Question;
  answer: string;
  author_email: string;
  hidden?: boolean;
  references: Reference[];
  created: Date;
  updated?: Date;
};

const makeQuestionId = (text: string) =>
  crypto.createHash("sha256").update(text, "utf8").digest("base64");

export const importVerifiedAnswers = async ({
  embedder,
  verifiedAnswerSpecs,
  db,
  embeddingModel,
  embeddingModelVersion,
}: {
  embedder: Embedder;
  verifiedAnswerSpecs: VerifiedAnswerSpec[];
  db: Db;
  embeddingModel: string;
  embeddingModelVersion: string;
}) => {
  const collection = db.collection<VerifiedAnswer>("verified_answers");

  // Load all entries from collection so we know what to update
  const storedAnswers = Object.fromEntries(
    (await collection.find().toArray()).map((answer) => [
      answer._id,
      { ...answer, stillExistsInYaml: false },
    ])
  );

  const now = new Date();
  const verifiedAnswers = verifiedAnswerSpecs
    .map(({ questions, answer, author_email, hidden, references }) =>
      questions.map(
        (
          question
        ): Omit<VerifiedAnswer, "question" | "created"> & {
          question: string;
        } => ({
          _id: makeQuestionId(question),
          question,
          answer,
          author_email,
          hidden,
          references,
        })
      )
    )
    .flat(1)
    .map((verifiedAnswer) => {
      // See if this entry exists already
      const storedAnswer = storedAnswers[verifiedAnswer._id];
      if (storedAnswer === undefined) {
        // Entry does not exist, so this is a new entry, which will need an
        // embedding generated for it.
        return {
          ...verifiedAnswer,
          created: now,
        };
      }

      // Paint the storedAnswer as visited - those not visited will be deleted
      storedAnswer.stillExistsInYaml = true;

      // Entry exists but may or may not have changed. Strip properties that
      // aren't relevant to the question "has this changed?"
      const comparableVerifiedAnswer =
        makeComparableVerifiedAnswer(verifiedAnswer);

      if (
        !deepEqual(
          makeComparableVerifiedAnswer(storedAnswer),
          comparableVerifiedAnswer
        )
      ) {
        // The entry exists and has changed. Overwrite any new properties but
        // not the embedded question or creation date.
        return {
          ...storedAnswer,
          ...comparableVerifiedAnswer,
          updated: now,
        };
      }

      // The entry exists and is unchanged.
      return undefined;
    })
    .filter((entry) => entry !== undefined);

  const idsToDelete = Object.values(storedAnswers)
    .filter(({ stillExistsInYaml }) => !stillExistsInYaml)
    .map(({ _id }) => _id);

  const toUpdate = (
    await Promise.all(
      verifiedAnswers.map(
        async (verifiedAnswer): Promise<VerifiedAnswer | undefined> => {
          if (verifiedAnswer === undefined) {
            // Nothing to update.
            return;
          }

          const { question } = verifiedAnswer;
          if (typeof question !== "string") {
            // Already complete, just needs to be updated in database.
            return { ...verifiedAnswer, question };
          }

          // Needs embedding.
          const { embedding } = await embedder.embed({
            text: question,
          });

          return {
            ...verifiedAnswer,
            question: {
              embedding,
              embedding_model: embeddingModel,
              embedding_model_version: embeddingModelVersion,
              text: question,
            },
          };
        }
      )
    )
  ).filter((v) => v !== undefined) as VerifiedAnswer[];

  const upsertResults = await Promise.all(
    toUpdate.map(async (doc) => {
      return await collection.updateOne(
        { _id: doc._id },
        { $set: doc },
        {
          upsert: true,
        }
      );
    })
  );

  const upsertSummary = upsertResults.reduce(
    (acc, cur) => ({
      failed: acc.failed + (cur.acknowledged ? 0 : 1),
      updated: acc.updated + (cur.modifiedCount ?? 0),
      created: acc.created + (cur.upsertedCount ?? 0),
    }),
    {
      updated: 0,
      created: 0,
      failed: 0,
    }
  );

  const deleteResults = await collection.deleteMany({
    _id: { $in: idsToDelete },
  });

  console.log({ ...upsertSummary, deleted: deleteResults.deletedCount });
};

/**
  Strip properties that aren't relevant to the question "has this changed?"
 */
const makeComparableVerifiedAnswer = ({
  _id,
  author_email,
  references,
  hidden,
  answer,
}: Omit<VerifiedAnswer, "question" | "created">) => ({
  _id,
  author_email,
  references,
  hidden,
  answer,
});
