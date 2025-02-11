import { stripIndents } from "common-tags";
import { systemMessage, userMessage } from "../openai-api";
import { Logger } from "../logger";
import { PromisePool } from "@supercharge/promise-pool";
import { iOfN, removeStartOfString, safeFileName } from "../utils";
import { Artifact, SomeArtifact } from "../artifact";

const NO_CHANGELOG_ENTRY_SYMBOL = "<<<NO_CHANGELOG_ENTRY>>>";

export type CreateChangelogArgs = {
  logger?: Logger;
  generate?: GenerateChatCompletion;
  projectDescription: string;
  artifact: SomeArtifact;
};

export async function createChangelogEntry({
  logger,
  generate,
  projectDescription,
  artifact,
}: CreateChangelogArgs) {
  if (!artifact.summary) {
    const errorMessage = `Artifact must have a summary`;
    logger?.log("error", errorMessage, {
      type: artifact.type,
      id: artifact.id,
    });
    throw new Error(errorMessage);
  }
  const chatTemplate = [
    systemMessage({
      content: stripIndents`
        You are an expert technical writer and engineer writing a changelog for a given software project.

        <Task>
        You will be provided with an artifact associated with the software release.
        Based on the content of the artifact and a summary, you will create a set of changelog entries that thoroughly describe the changes associated with the artifact.
        You may create multiple changelog entries for a single artifact.
        If the provided artifact does not make or imply and notable changes, return only and exactly the following text: ${NO_CHANGELOG_ENTRY_SYMBOL}
        </Task>

        <Style Guide>
        A changelog entry is a brief description of the change written in the present tense.
        Limit each changelog entry length to 1 or 2 sentences and a maximum of 50 words.
        Begin each entry with a verb.
        If there are multiple changes, separate each entry with a new line.

        For example, a changelog entry might resemble any of the following:

        - Adds the atlas projects update command.
        - Adds support for Podman 5.0.0 for local deployments.
        - Adds a CommonJS (CJS) build output.
        - Fixes an issue where the \`atlas kubernetes config generate\` command failed to include the specified namespace.
        - Fixes an issue where the Atlas CLI didn't sign Windows binaries.
        - Upgrades the version of Go to 1.17.
        - Deprecates the \`atlas projects create\` command.
        - Removes the \`atlas projects update\` command.
        - Removes the unused \`normalize.css\` file
        </Style Guide>

        <Project Description>
        The software project you will analyze has the following description:

        ${projectDescription}
        </Project Description>
      `,
    }),
    userMessage({
      content: stripIndents`
        <Summary>
        ${artifact.summary}
        </Summary>
        <Artifact>
        ${JSON.stringify(artifact)}
        </Artifact>
      `,
    }),
  ];

  const artifactInfo = {
    type: artifact.type,
    id: artifact.id,
    summary: artifact.summary,
  };
  logger?.log("info", "Generating changelog for artifact", artifactInfo);
  const output = await generate(chatTemplate);
  if (!output) {
    const errorMessage = `"Failed to generate changelog for artifact"`;
    logger?.log("error", errorMessage, artifactInfo);
    throw new Error(errorMessage);
  }
  return output;
}

export async function createChangelogEntries({
  logger,
  generate = makeGenerateChatCompletion(),
  projectDescription,
  artifacts,
  concurrency = 4,
}: Omit<CreateChangelogArgs, "artifact"> & {
  artifacts: CreateChangelogArgs["artifact"][];
  concurrency?: number;
}) {
  const errors: Error[] = [];
  const { results } = await PromisePool.withConcurrency(concurrency)
    .for(artifacts)
    .handleError((error) => {
      errors.push(error);
    })
    .process(async (artifact) => {
      const createChangelogEntryResult = await createChangelogEntry({
        logger,
        generate,
        projectDescription,
        artifact,
      });
      const changelogs = createChangelogEntryResult.split("\n");
      return changelogs;
    });
  if (errors.length > 0) {
    logger?.log("info", `Failed to generate ${errors.length} changelogs.`, {
      errors,
    });
  }
  return results
    .flat()
    .filter((c) => c !== NO_CHANGELOG_ENTRY_SYMBOL)
    .map((changelog) => removeStartOfString(changelog, "- "));
}
