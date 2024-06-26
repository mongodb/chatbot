import {
  makeClassifier,
  makeClassificationTypes,
} from "../chat/makeClassifier";
import { MakeClassifyChangelogArgs } from "./classifyChangelog";

const classificationTypes = makeClassificationTypes([
  {
    type: "internal",
    description:
      "A change that is internal to the project and not exposed to the public API",
    examples: [
      {
        text: "Upgrades CLI Go version to 1.17",
        reason:
          "The version of the Go programming language used to build the project doesn't directly affect user-facing APIs or the end user experience.",
      },
      {
        text: "Refactors API endpoints to use a directory instead of a single shared file",
        reason:
          "This change affects the project's internal code structure but does not modify the public API or user-facing behavior.",
      },
    ],
  },
  {
    type: "external",
    description:
      "A change that is exposed to the public API or generally affects user-facing behavior",
    examples: [
      {
        text: "Adds a new HTTPS API endpoint that returns user profile data",
        reason:
          "This change modifies the public API and exposes new functionality to users.",
      },
      {
        text: "Fixes a bug that caused the app to crash when users uploaded large files",
        reason:
          "This change affects user-facing behavior and resolves a bug that impacted the user experience.",
      },
    ],
  },
]);

export function makeClassifyChangelogAudience({
  openAiClient,
}: MakeClassifyChangelogArgs) {
  return makeClassifier({
    openAiClient,
    classificationTypes,
    chainOfThought: true,
  });
}
