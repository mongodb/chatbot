import { stripIndents } from "common-tags";
import {
  GenerateChatCompletion,
  makeGenerateChatCompletion,
  systemMessage,
  userMessage,
} from "../chat";
import { ReleaseArtifact, releaseArtifactIdentifier } from "./projects";
import { RunLogger } from "../runlogger";
import { PromisePool } from "@supercharge/promise-pool";
import { iOfN, safeFileName } from "../utils";

export type SummarizeReleaseArtifactArgs = {
  logger?: RunLogger;
  generate?: GenerateChatCompletion;
  projectDescription: string;
  artifact: ReleaseArtifact;
};

export type ArtifactSummary = {
  artifact: ReleaseArtifact;
  summary: string;
};

export async function summarizeReleaseArtifact({
  logger,
  generate,
  projectDescription,
  artifact,
}: SummarizeReleaseArtifactArgs) {
  generate = generate ?? makeGenerateChatCompletion();
  const chatTemplate = [
    systemMessage({
      content: stripIndents`
        Your task is to analyze a provided artifact associated with a software release and write a succinct summarized description. Artifacts may include information from task tracking software like Jira, source control information like Git diffs and commit messages, or other sources.

        Your summary should be a brief, high-level description of the artifact's contents and purpose. The goal is to provide a clear, concise overview that can be used to generate one or more change log entries for the release. Focus on the facts of the changes. Avoid value judgments or subjective language such as how substantial an update was. Do not infer the broader intent behind the changes or speculate on future implications unless specifically mentioned in the artifact.

        The user may prepend the artifact with additional style guide information or other metadata. This section is denoted by frontmatter enclosed in triple dashes (---). Do not mention this frontmatter in the summary but do follow its guidance.

        Assume the reader of your summary is familiar with the product's features and use cases.

        Limit the summary length to a maximum of 200 words.

        <Section description="A description of the software project this release is for">
          ${projectDescription}
        </Section>
      `,
    }),
    userMessage({ content: createUserPromptForReleaseArtifact(artifact) }),
  ];
  logger?.appendArtifact(
    `chatTemplates/${safeFileName(releaseArtifactIdentifier(artifact))}.txt`,
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
    `[summarizeReleaseArtifact chatTemplate] ${JSON.stringify(chatTemplate)}`
  );

  const output = await generate(chatTemplate);
  if (!output) {
    throw new Error("Something went wrong while generating the summary ☹️");
  }
  return output;
}

function frontmatter(
  ...objs: (string | unknown[] | Record<string, unknown>)[]
) {
  const tokens = ["---"];
  for (const [i, obj] of Object.entries(objs)) {
    if (Number(i) > 0) tokens.push("\n");
    if (typeof obj === "string") {
      tokens.push(obj);
    } else if (Array.isArray(obj)) {
      obj.forEach((value) => {
        tokens.push(JSON.stringify(value));
      });
    } else {
      Object.entries(obj).forEach(([key, value]) => {
        if (typeof value === "object") {
          value = JSON.stringify(value);
        }
        tokens.push(`${key}: ${value}`);
      });
    }
  }
  tokens.push("---\n");
  return tokens.join("\n");
}

function createUserPromptForReleaseArtifact(artifact: ReleaseArtifact) {
  const artifactString = JSON.stringify(artifact);
  switch (artifact.type) {
    case "git-commit": {
      const fm = frontmatter(
        "In your summary, focus only on the changes the commit applies. You can use all the provided information for context, but do not mention the commit hash or other git-specific information in the summary.",
        `Use concise and precise language that describes the intent and scope of the changes. For example:`,
        [
          {
            Artifact: `{ "type": "git-commit", "hash": "eeee67b680459edf25feed0da0ff446027a5deaa", "message": "Release mongodb-chatbot-ui v0.7.1", files: [...] }`,
            Summary:
              "This commit modifies the package version of mongodb-chatbot-ui with a minor version bump to version 0.7.1 and signifies a new release.",
          },
          {
            Artifact: `{ "type": "git-commit", "hash": "660267ae9d9b4355fc0f58c60cc7fc677f939b0c", "message": "build(deps): bump github.com/mongodb/mongodb-atlas-kubernetes/v2 from 2.2.0 to 2.2.1 (#2858)\n\nSigned-off-by: dependabot[bot] <support@github.com>\r\nSigned-off-by: john.anonymous <john.anonymous@mongodb.com>\r\nCo-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>\r\nCo-authored-by: john.anonymous <john.anonymous@mongodb.com>", files: [...] }`,
            Summary:
              "This commit applies internal upgrades and improvements, including dependency version bumps and minor adjustments to tests and internal implementation details.",
          },
          {
            Artifact: `{ "type": "git-commit", "hash": "5b9efe53fc39e3f69c26946783f92ea2df7669ae", "message": "CLOUDP-245955: Add describe connectedOrgConfigs command (#2890)", files: [...] }`,
            Summary:
              "This commit adds a new CLI command: `atlas federatedAuthentication federationSettings connectedOrgConfigs describe`\n\nThe command returns descriptions of the user's Atlas federated authentication connected organization configurations.",
          },
        ]
      );
      return `${fm}\n${artifactString}`;
    }
    case "git-diff":
      return artifactString;
    case "jira-issue": {
      const fm = frontmatter(
        "In your summary, focus on the bug, task, improvement, etc. that the Jira issue describes. You can use all the provided information for context, but do not mention the issue key, component or other jira-specific information in the summary.",
        `Use concise and precise language that describes the intent and scope of the changes. For example:`,
        [
          {
            Artifact: `{ "type": "jira-issue", "key": "CLOUDP-191365", "summary": "Move CLI release token to a cloud owned account" }`,
            Summary:
              "This issue improves the release process of the CLI. Previously, the CLI was released with a token linked to an individual's GitHub account. This issue aims to transition to a more secure and organization-controlled approach by moving the token to a service account, specifically suggesting the use of the mms build account.",
          },
          {
            Artifact: `{ "type": "jira-issue", "key": "CLOUDP-245955", "summary": "[AtlasCLI] Add connectedOrgs config describe" }`,
            Summary:
              "This issue represents a new CLI command: `connectedOrgs config describe`. The command allows users to describe their connected organizations' configuration.",
          },
          {
            Artifact: `{ "type": "jira-issue", "key": "CLOUDP-247010", "summary":"AtlasCLI 1.22.0 Release" }`,
            Summary:
              "This issue tracks the release of Atlas CLI version 1.22.0.",
          },
        ]
      );
      return `${fm}\n${artifactString}`;
    }
  }
}

export async function summarizeReleaseArtifacts({
  logger,
  generate = makeGenerateChatCompletion(),
  projectDescription,
  artifacts,
  onArtifactSummarized,
  concurrency = 4,
}: Omit<SummarizeReleaseArtifactArgs, "artifact"> & {
  artifacts: ReleaseArtifact[];
  concurrency?: number;
  onArtifactSummarized?: (artifact: ReleaseArtifact, summary: string) => void;
}) {
  const errors: Error[] = [];
  const { results } = await PromisePool.withConcurrency(concurrency)
    .for(artifacts)
    .handleError((error, artifact) => {
      const errMessage = `Error summarizing ${artifact.type}. ${error.name} "" ${error.message}`;
      console.log(errMessage);
      logger?.logError(errMessage);
      errors.push(error);
    })
    .process(async (artifact, index) => {
      console.log(
        `summarizing ${artifact.type} ${iOfN(index, artifacts.length)}`
      );
      const summary = await summarizeReleaseArtifact({
        logger,
        generate,
        projectDescription,
        artifact,
      });
      onArtifactSummarized?.(artifact, summary);
      return summary;
    });
  if (errors.length > 0) {
    logger?.logInfo(
      `${errors.length} errors occurred while summarizing artifacts.`
    );
  }
  return results;
}
