import { stripIndents } from "common-tags";
import type { GenerateChatCompletion } from "../openai-api";
import { systemMessage, userMessage } from "../openai-api";
import type { Logger } from "../logger";
import { PromisePool } from "@supercharge/promise-pool";
import type { SomeArtifact } from "../artifact";

export type MakeSummarizeReleaseArtifactArgs = {
  logger?: Logger;
  generate: GenerateChatCompletion;
  projectDescription: string;
};

export type SummarizeReleaseArtifactArgs = {
  artifact: SomeArtifact;
};

export function makeSummarizeReleaseArtifact({
  logger,
  generate,
  projectDescription,
}: MakeSummarizeReleaseArtifactArgs) {
  return async function summarizeReleaseArtifact({
    artifact,
  }: SummarizeReleaseArtifactArgs) {
    const chatTemplate = [
      systemMessage({
        content: stripIndents`
          You are an expert technical writer and engineer working on a given software project.

          <Task>
          You will analyze a provided artifact associated with a software release and write a succinct summarized description.
          Artifacts may include information from task tracking software like Jira, source control information like Git diffs and commit messages, or other sources.
          Your summary will be used to generate one or more change log entries for the release.
          </Task>

          <Style Guide>
          - Write a brief, high-level description of the artifact's contents and purpose
          - Focus on the facts of the changes
          - Avoid value judgments or subjective language (e.g., how substantial an update was)
          - Do not infer the broader intent behind the changes
          - Do not speculate on future implications unless specifically mentioned in the artifact
          - Assume the reader is familiar with the product's features and use cases
          - Limit the summary length to a maximum of 200 words
          - Follow any guidance provided in the frontmatter (denoted by triple dashes ---) but do not mention the frontmatter itself

          Example summaries:
          1. "This change adds a new CLI command 'atlas kubernetes config generate' that generates configuration files for Kubernetes deployments. The command supports specifying namespaces and includes validation for required parameters."
          2. "This update modifies the authentication flow to use token-based authentication instead of password-based authentication. The change affects all API endpoints and includes updates to error handling for invalid tokens."
          3. "This change fixes a bug where the CLI would fail to properly escape special characters in project names when making API requests. The fix adds proper URL encoding for project name parameters."
          </Style Guide>

          <Project Description>
          The software project you will analyze has the following description:

          ${projectDescription}
          </Project Description>
        `,
      }),
      userMessage({ content: createUserPromptForReleaseArtifact(artifact) }),
    ];

    void logger?.log("info", "Summarizing release artifact", {
      type: artifact.type,
      id: artifact.id,
    });
    const output = await generate({ messages: chatTemplate });
    if (!output) {
      throw new Error("Something went wrong while generating the summary ☹️");
    }
    return output;
  };
}

function frontmatter(
  ...objs: (string | unknown[] | Record<string, unknown>)[]
): string {
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
        tokens.push(`${key}: ${JSON.stringify(value)}`);
      });
    }
  }
  tokens.push("---\n");
  return tokens.join("\n");
}

function createUserPromptForReleaseArtifact(artifact: SomeArtifact): string {
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
    default:
      throw new Error(`Unsupported artifact type: ${artifact.type}`);
  }
}

export type SummarizeReleaseArtifactsArgs = {
  artifacts: SummarizeReleaseArtifactArgs["artifact"][];
  concurrency?: number;
};

export function makeSummarizeReleaseArtifacts({
  logger,
  generate,
  projectDescription,
}: MakeSummarizeReleaseArtifactArgs) {
  const summarizeReleaseArtifact = makeSummarizeReleaseArtifact({
    logger,
    generate,
    projectDescription,
  });

  return async function summarizeReleaseArtifacts({
    artifacts,
    concurrency = 4,
  }: SummarizeReleaseArtifactsArgs) {
    const errors: Error[] = [];
    const { results } = await PromisePool.withConcurrency(concurrency)
      .for(artifacts)
      .handleError((error, artifact) => {
        void logger?.log("error", "Error summarizing artifact", {
          type: artifact.type,
          id: artifact.id,
          error: {
            name: error.name,
            message: error.message,
          },
        });
        errors.push(error);
      })
      .process(async (artifact) => {
        artifact.summary = await summarizeReleaseArtifact({
          artifact,
        });
        return artifact;
      });
    if (errors.length > 0) {
      void logger?.log(
        "info",
        `${errors.length} errors occurred while summarizing artifacts.`,
        {
          errors,
        }
      );
    }
    return results;
  };
}
