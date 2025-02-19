import type { AzureOpenAI } from "mongodb-rag-core/openai";
import { makeClassifier, type Classifier } from "mongodb-rag-core";

const classificationTypes = [
  {
    type: "added",
    description: "a new feature",
    examples: [
      {
        text: "Adds the atlas projects update command.",
        reason: "This change adds a new user-facing command to the CLI",
      },
      {
        text: "Adds support for Podman 5.0.0 for local deployments.",
        reason:
          "This change adds support for a new major version of a third-party tool",
      },
      {
        text: "Adds a CommonJS (CJS) build output for mongodb-chatbot-ui package, allowing it to be used in environments that require CJS modules.",
        reason:
          "This change adds support for a new build output that users of the library can consume",
      },
    ],
  },
  {
    type: "updated",
    description: "a change in existing functionality",
    examples: [
      {
        text: "Upgrades CLI Go version to 1.17",
        reason:
          "This change modifies the version of an existing dependency that's already in use",
      },
    ],
  },
  {
    type: "deprecated",
    description: "a soon-to-be removed feature",
    examples: [
      {
        text: "Requests to the v1 API now return a deprecation notice with upgrade instructions.",
        reason:
          "This change marks a feature as deprecated and provides guidance on how to upgrade to a newer version",
      },
    ],
  },
  {
    type: "removed",
    description: "a now removed feature",
    examples: [
      {
        text: "Removed support for outdated cryptographic algorithms",
        reason:
          "This change entirely removes support for a previously existing feature",
      },
    ],
  },
  {
    type: "fixed",
    description: "a bug fix",
    examples: [
      {
        text: "Fixes an issue with the atlas kubernetes config generate command.",
        reason: "This change resolves an issue with a CLI command",
      },
      {
        text: "The applications list command now correctly applies a filter if you pass one",
        reason:
          "This change resolves a bug where a command did not correctly use a provided parameter",
      },
    ],
  },
  {
    type: "security",
    description: "an action taken to address a security vulnerability",
    examples: [
      {
        text: "Patched a cross-site scripting (XSS) vulnerability in the user profile page.",
        reason:
          "This change fixes a security vulnerability that could be exploited by an attacker to get user information",
      },
    ],
  },
];

export type MakeClassifyChangelogScopeArgs = {
  openAiClient: AzureOpenAI;
  model: string;
};

export function makeClassifyChangelogScope({
  openAiClient,
  model,
}: MakeClassifyChangelogScopeArgs): Classifier {
  return makeClassifier({
    openAiClient,
    model,
    classificationTypes,
    chainOfThought: true,
  });
}
