import crypto from "crypto";
import { Db } from "mongodb-rag-core/mongodb";
import { Embedder, VerifiedAnswer } from "mongodb-rag-core";
import { VerifiedAnswerSpec } from "./parseVerifiedAnswersYaml";
import deepEqual from "deep-equal";

/**
  Creates a non-cryptographic hash of the given question text.
 */
export const makeQuestionId = (text: string) =>
  crypto.createHash("sha256").update(text, "utf8").digest("base64");

/**
  Imports the given verified answer spec into the database. Updates entries that
  already exist in the database and deletes any in the database that are no
  longer in the spec.
 */
export const importVerifiedAnswers = async ({
  verifiedAnswerSpecs,
  db,
  embedder,
  embeddingModelName,
  embeddingModelVersion,
  verifiedAnswersCollectionName,
}: {
  verifiedAnswerSpecs: VerifiedAnswerSpec[];
  db: Db;
  embedder: Embedder;
  embeddingModelName: string;
  embeddingModelVersion: string;
  verifiedAnswersCollectionName: string;
}) => {
  const collection = db.collection<VerifiedAnswer>(
    verifiedAnswersCollectionName
  );

  // Load all entries from collection so we know what to update
  const storedAnswers = await collection.find().toArray();

  const { idsToDelete, answersToUpsert } = await prepareVerifiedAnswers({
    storedAnswers,
    verifiedAnswerSpecs,
    embedder,
    embeddingModelName,
    embeddingModelVersion,
  });

  const upsertResults = await Promise.all(
    answersToUpsert.map(async (doc) => {
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

  return { ...upsertSummary, deleted: deleteResults.deletedCount };
};

/**
  Generates verified answer objects from the given spec as well as the set of
  IDs to be deleted (i.e. that exist in the stored answers but not the spec).

  This function looks at both the incoming verified answer spec and the array of
  existing verified answers (e.g. from the database) to perform a sort of set
  difference operation:

  - If the spec has no corresponding existing entry, generate a verified answer
    object with a new embedding and `created` field set to now.
  - If the spec has a corresponding existing entry and fields in the spec differ
    from the existing entry, re-use the existing entry (and its embedding), but
    update the fields that changed and set the `updated` field to now.
  - If the spec has a corresponding existing entry but nothing has changed, omit
    it from the results.
  - Any existing entry that no longer has a corresponding spec entry gets marked
    for deletion.
 */
export const prepareVerifiedAnswers = async ({
  verifiedAnswerSpecs,
  storedAnswers: storedAnswersIn,
  embedder,
  embeddingModelName,
  embeddingModelVersion,
}: {
  verifiedAnswerSpecs: VerifiedAnswerSpec[];
  storedAnswers: VerifiedAnswer[];
  embedder: Embedder;
  embeddingModelName: string;
  embeddingModelVersion: string;
}): Promise<{ idsToDelete: string[]; answersToUpsert: VerifiedAnswer[] }> => {
  // Make a lookup table of _id -> stored answer
  const storedAnswers = Object.fromEntries(
    storedAnswersIn.map((answer) => [
      answer._id,
      { ...answer, stillExistsInYaml: false },
    ])
  );

  const now = new Date();

  // Transform verified answer specs into verified answer objects
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
    });

  const idsToDelete = Object.values(storedAnswers)
    .filter(({ stillExistsInYaml }) => !stillExistsInYaml)
    .map(({ _id }) => _id);

  const answersToUpsert = (
    await Promise.all(
      verifiedAnswers.map(
        async (verifiedAnswer): Promise<VerifiedAnswer | undefined> => {
          if (verifiedAnswer === undefined) {
            return undefined;
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
              embedding_model: embeddingModelName,
              embedding_model_version: embeddingModelVersion,
              text: question,
            },
          };
        }
      )
    )
  ).filter((v) => v !== undefined) as VerifiedAnswer[];
  return { idsToDelete, answersToUpsert };
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
