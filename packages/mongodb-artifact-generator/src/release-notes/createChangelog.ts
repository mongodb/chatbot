import { stripIndents } from "common-tags";
import {
  GenerateChatCompletion,
  makeGenerateChatCompletion,
  systemMessage,
  userMessage,
} from "../chat";
import {
  ReleaseArtifactSummary,
  releaseArtifactSummaryIdentifier,
} from "./projects";
import { RunLogger } from "../runlogger";
import { PromisePool } from "@supercharge/promise-pool";
import { iOfN, removeStartOfString, safeFileName } from "../utils";

const NO_CHANGELOG_ENTRY = "<<<NO_CHANGELOG_ENTRY>>>";

export type CreateChangelogArgs = {
  logger?: RunLogger;
  generate?: GenerateChatCompletion;
  projectDescription: string;
  artifactSummary: ReleaseArtifactSummary;
};

export async function createChangelog({
  logger,
  generate,
  projectDescription,
  artifactSummary,
}: CreateChangelogArgs) {
  generate = generate ?? makeGenerateChatCompletion();
  const chatTemplate = [
    systemMessage({
      content: stripIndents`
        Your task is to create a thorough changelog for a software release. A changelog is a file which contains a curated, chronologically ordered list of notable changes for each version of a project.

        You will be provided a data set that describes artifacts associated with a release of the software. Based on that data set, you will generate a set of change log entries.

        A changelog entry is a brief description of the change written in the present tense.

        Limit each changelog entry length to 1 or 2 sentences and a maximum of 50 words.

        If the provided data does not contain any changes, return only and exactly the following text: ${NO_CHANGELOG_ENTRY}

        Format each entry as a markdown unordered list item. For multiple entries, separate each list item with a newline.

        For example, a set of changelog entries might resemble the following:

        - Adds the atlas projects update command.
        - Fixes an issue with the atlas kubernetes config generate command.
        - Adds support for Podman 5.0.0 for local deployments.
        - Fixes an issue where the Atlas CLI didn't sign Windows binaries.
        - Adds a CommonJS (CJS) build output for mongodb-chatbot-ui package, allowing it to be used in environments that require CJS modules.
        - Upgrades CLI Go version to 1.17.

        <Section description="A description of the software project this release is for">
          ${projectDescription}
        </Section>
      `,
    }),
    userMessage({
      content: stripIndents`
        ${JSON.stringify(artifactSummary.artifact)}

        ${artifactSummary.summary}
      `,
    }),
  ];
  logger?.appendArtifact(
    `chatTemplates/changelog-${safeFileName(
      releaseArtifactSummaryIdentifier(artifactSummary.artifact)
    )}.json`,
    chatTemplate
      .map((m) => {
        switch (m.role) {
          case "system":
            return `<SystemMessage>\n${m.content}\n</SystemMessage>`;
          case "user":
            return `<UserMessage>\n${m.content}\n</UserMessage>`;
        }
      })
      .join("\n")
  );
  logger?.logInfo(
    `[createChangelog chatTemplate] ${JSON.stringify(chatTemplate)}`
  );

  const output = await generate(chatTemplate);
  if (!output) {
    throw new Error("Something went wrong while generating the summary ☹️");
  }
  return output;
}

export async function createChangelogs({
  logger,
  generate = makeGenerateChatCompletion(),
  projectDescription,
  artifactSummaries,
  concurrency = 4,
}: Omit<CreateChangelogArgs, "artifactSummary"> & {
  artifactSummaries: ReleaseArtifactSummary[];
  concurrency?: number;
}) {
  const errors: Error[] = [];
  const { results } = await PromisePool.withConcurrency(concurrency)
    .for(artifactSummaries)
    .handleError((error, artifactSummary) => {
      const errMessage = `Error summarizing ${artifactSummary.artifact.type}. ${error.name} "" ${error.message}`;
      console.log(errMessage);
      logger?.logError(errMessage);
      errors.push(error);
    })
    .process(async (artifactSummary, index) => {
      console.log(
        `creating changelog for ${artifactSummary.artifact.type} ${iOfN(
          index,
          artifactSummaries.length
        )}`
      );
      const createChangelogResult = await createChangelog({
        logger,
        generate,
        projectDescription,
        artifactSummary,
      });
      const changelogs = createChangelogResult.split("\n");
      return changelogs;
    });
  if (errors.length > 0) {
    logger?.logInfo(`${errors.length} errors occurred while create changelog.`);
  }
  return results
    .flat()
    .filter((c) => c !== NO_CHANGELOG_ENTRY)
    .map((changelog) => removeStartOfString(changelog, "- "));
}
