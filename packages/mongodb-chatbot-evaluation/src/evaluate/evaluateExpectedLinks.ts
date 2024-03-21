import { ObjectId, Reference } from "mongodb-rag-core";
import { ConversationGeneratedData } from "../generate";
import { checkResponseQuality } from "./checkResponseQuality";
import { EvaluateQualityFunc } from "./EvaluateQualityFunc";
import { strict as assert } from "assert";
import { EvalResult } from "./EvaluationStore";
import { AssistantMessage } from "mongodb-chatbot-server";
/**
  Evaluates if the final assistant message contains the expected links.
  Skips if no `expectedLinks` in the test case data.

  The evaluation checks if each actual link one of the `expectedLink` values
  as a  **substring**. This is to allow for the base URL of the link to change.
  This is possible if the documentation you're testing against is versioned,
  so that the link might update.
  For example, if the `expectedLinks` includes `["link1", "link2" ]`,
  this would match for the actual links of `["https://mongodb.com/foo/v1/link1", "https://docs.mongodb.com/foo/v2/link2"]`.

  The eval result is the portion of the `expectedLinks` that are present in the final assistant message.
  For example, if the `expectedLinks` are `["link1", "link2" ]`
  and the final assistant message only contains `["link1"]`, the eval `result: .5`.

 */
export const evaluateExpectedLinks: EvaluateQualityFunc = async function ({
  generatedData,
  runId,
}) {
  assert(
    generatedData.type === "conversation",
    "Invalid data type. Expected 'conversation' data."
  );
  const conversationData = generatedData as ConversationGeneratedData;
  const {
    data: { messages },
  } = conversationData;
  const { name, expectedLinks } = conversationData.evalData;
  assert(
    expectedLinks && expectedLinks.length > 0,
    `No expectedLinks in test case '${name}'.`
  );
  const finalAssistantMessage = messages[
    messages.length - 1
  ] as AssistantMessage;

  assert(
    finalAssistantMessage.role === "assistant",
    `Last message is not assistant message in test case '${name}'.`
  );

  const expectedLinksMap: Record<
    string,
    { matchingActualLink?: string; includesExpected: boolean }
  > = {};
  const actualLinks = (finalAssistantMessage.references ?? []).map(
    (ref: Reference) => ref.url
  );
  for (const expectedLink of expectedLinks) {
    for (const actualLink of actualLinks) {
      if (actualLink.includes(expectedLink)) {
        expectedLinksMap[expectedLink] = {
          matchingActualLink: actualLink,
          includesExpected: true,
        };
        break;
      } else {
        expectedLinksMap[expectedLink] = {
          includesExpected: false,
        };
      }
    }
  }
  const result =
    Object.values(expectedLinksMap).reduce(
      (acc, { includesExpected }) => acc + (includesExpected ? 1 : 0),
      0
    ) / expectedLinks.length;
  const evaluation = {
    _id: new ObjectId(),
    generatedDataId: generatedData._id,
    commandRunMetadataId: runId,
    type: "expected_links",
    result: result,
    createdAt: new Date(),
    metadata: {
      testName: name,
      expectedLinksFound: expectedLinksMap,
    },
  } satisfies EvalResult;
  return evaluation;
};
