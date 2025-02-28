import type { AzureOpenAI } from "mongodb-rag-core/openai";
import { makeClassifier, type Classifier } from "mongodb-rag-core";

const classificationTypes = [
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
        text: "Updates the Atlas CLI to use version 20231115012.2.0 of the Atlas GO SDK.",
        reason:
          "The Atlas GO SDK is an internal dependency of the Atlas CLI and is not exposed to end users.",
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
];

export type MakeClassifyChangelogAudienceArgs = {
  openAiClient: AzureOpenAI;
  model: string;
};

export function makeClassifyChangelogAudience({
  openAiClient,
  model,
}: MakeClassifyChangelogAudienceArgs): Classifier {
  return makeClassifier({
    openAiClient,
    model,
    classificationTypes,
    chainOfThought: true,
  });
}
