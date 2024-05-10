import { stripIndents, html } from "common-tags";
import {
  GenerateChatCompletion,
  makeGenerateChatCompletion,
  systemMessage,
  userMessage,
} from "../chat";
import { ReleaseArtifact, releaseArtifactIdentifier } from "./projects";
import { RunLogger } from "../runlogger";

export function safeFileName(fileName: string) {
  return fileName.replace(/[/\\?%*:|"<>]/g, "-");
}

export async function summarizeReleaseArtifact({
  logger,
  generate,
  projectDescription,
  artifact,
}: {
  logger?: RunLogger;
  generate?: GenerateChatCompletion;
  projectDescription: string;
  artifact: ReleaseArtifact;
}) {
  generate = generate ?? makeGenerateChatCompletion();
  const chatTemplate = [
    systemMessage(stripIndents`
      Your task is to analyze a provided artifact associated with a software release and write a succinct summarized description. Artifacts may include information from task tracking software like Jira, source control information like Git diffs and commit messages, or other sources.

      Your summary should be a brief, high-level description of the artifact's contents and purpose. It should avoid technical details and focus on the artifact's significance and relevance to the project. The goal is to provide a clear, concise overview that can be used to generate a change log entry for the release.

      The user may prepend the artifact with additional style guide information or other metadata. This section is denoted by frontmatter enclosed in triple dashes (---). Do not mention this frontmatter in the summary but do follow its guidance.

      Limit the summary length to a maximum of 200 words.

      <Section description="A description of the software project this release is for">
        ${projectDescription}
      </Section>
    `),
    userMessage(createUserPromptForReleaseArtifact(artifact)),
  ];
  logger?.appendArtifact(
    `chatTemplates/${safeFileName(releaseArtifactIdentifier(artifact))}`,
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
  logger?.logInfo(`[summarizeReleaseArtifact chatTemplate] ${chatTemplate}`);

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
        "Focus on the changes the commit applies. Do not mention the commit hash or other git-specific information in the summary."
      );
      return `${fm}\n${artifactString}`;
    }
    case "git-diff":
    case "jira-issue":
      return artifactString;
  }
}
