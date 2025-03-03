# Release Notes Generator

A flexible and extensible tool for generating changelogs and release notes from various sources like GitHub commits and Jira issues.

## Features

- Supports multiple artifact sources (GitHub, Jira, etc.)
- Includes standard config methods with customizable overrides
- Uses a type-safe configuration with runtime validation
- Allows for concurrent processing with configurable rate limiting

## Quick Start

The fastest way to get started is using the standard configuration methods:

```typescript
import {
  createConfig,
  generate,
  makeStandardConfigMethods,
  makeGitHubReleaseArtifacts,
  makeJiraReleaseArtifacts,
 } from "release-notes-generator";

// Get the standard methods for processing changes
// You can customize any part of the configuration by replacing the standard methods with your own
const standardMethods = makeStandardConfigMethods({
  azureOpenAi: {
    apiKey: "my-api-key",
    apiVersion: "2024-02-15-preview",
    deployment: "my-deployment",
    endpoint: "https://my-endpoint.openai.azure.com",
  },
  logger: {
    namespace: "my-project",
  },
});

const config = createConfig({
  // Use the standard methods for processing release artifacts
  ...standardMethods,
  // Provide information about your project
  project: {
    name: "My Project",
    description: "A description of what my project does",
  },
  // Fetch release artifacts from your sources
  fetchArtifacts: async ({ current, previous }) => {
    const github = makeGitHubReleaseArtifacts({
      githubApi,
      owner: "myorg",
      repo: "myrepo",
      version: current,
      previousVersion: previous,
    });
    const jira = makeJiraReleaseArtifacts({
      jiraApi,
      version: current, // Fetch Jira issues based on the fixVersion field
      issuesKeys: ["EAI-123", "EAI-456"], // Or fetch specific issues by key
    });

    const [commits, issues] = await Promise.all([
      github.getCommits(),
      jira.getIssues(),
    ]);

    return [...commits, ...issues];
  },
});

// Generate release notes
const changes = await generate(config, {
  current: "1.1.0",
  previous: "1.0.0",
});
```

You can customize any part of the configuration by replacing the standard methods with your own:

```typescript
const config = createConfig({
  // ... project and fetchArtifacts as above ...
  // Use standard methods but override classification
  ...standardMethods,
  classifyChange: async (change) => {
    // Custom classification logic
    if (change.description.startsWith("feat:")) {
      return { audience: "external", scope: "added" };
    }
    if (change.description.startsWith("fix:")) {
      return { audience: "external", scope: "fixed" };
    }
    return standardMethods.classifyChange(change);
  },
});
```

## Configuration Reference

The generator uses a type-safe configuration system that validates your config
at runtime. You can use the standard methods from `makeStandardConfigMethods()`
or customize the tool with your own methods.

### Project Info

This contains high-level information about your project, including the project
name and a description. The tool passes this information to relevant processing
stages to give additional context.

The project description should specify the project's intended audience and the
various use cases it supports.

```typescript
project: {
  name: string;
  description: string;
}
```

### Gather Release Artifacts

The `fetchArtifacts` method is responsible for sourcing relevant data and
formatting them as [artifacts](#artifacts).

```typescript
fetchArtifacts: async ({ current, previous }: VersionRange) => Promise<SomeArtifact[]>
```

The tool includes built-in helpers for common artifact sources:

- `makeGitHubReleaseArtifacts`: Fetches commits and diffs from GitHub

  ```typescript
  const github = makeGitHubReleaseArtifacts({
    githubApi: new Octokit({ auth: process.env.GITHUB_TOKEN }),
    owner: "mongodb",
    repo: "chatbot",
    version: current,
    previousVersion: previous,
  });

  const commits = await github.getCommits(); // Fetches the commits between the previous version and the current version.
  const diffs = await github.getDiffs();
  const jiraIssueKeys = await github.getJiraIssueKeys("EAI");
  ```

- `makeJiraReleaseArtifacts`: Fetches issues from Jira

  ```typescript
  const jira = makeJiraReleaseArtifacts({
    jiraApi: new JiraApi({ auth: process.env.JIRA_TOKEN }),
    version: current,
    issuesKeys: ["EAI-123", "EAI-456"],
  });

  const issues = await jira.getIssues(); // Fetches the specified issues or all issues for the current version.
  ```

If you need to fetch artifacts from a source that is not supported by the
built-in helpers, you can implement your own artifact source by following the
[Artifact](#artifacts) interface.

> [!NOTE]
> If you define a custom artifact type, you must also implement custom
> `summarizeArtifact` and `extractChanges` methods to handle the artifact type.

### Process Artifacts Into Classified Changes

These methods control how changes are processed.

1. `summarizeArtifact`: Creates a human-readable summary of a given artifact.
   The standard implementation summarizes the artifact by calling an LLM with
   the full artifact, the project description, and a set of few-shot examples.

   ```typescript
   summarizeArtifact: async ({ project, artifact }) => Promise<string>
   ```

2. `extractChanges`: Pulls out a set of changes from each artifact. A change in
   this context is a string that describes how the artifact affects the project
   as well as a source identifier that points back to the artifact that it came
   from. Each artifact may map to a single change, multiple changes, or no
   changes at all. The standard implementation extracts changes based on the
   full artifact, the project description, the artifact summary, and a set of
   few-shot examples.

   ```typescript
   extractChanges: async ({ project, artifact }) => Promise<Change[]>
   ```

3. `classifyChange`: Categorizes each change along two dimensions: the audience
   that it is intended for and the scope of the change. The standard
   implementation uses the project description and a set of few-shot examples to
   classify each change.

   - The audience is either "internal", referring to engineers and other
     stakeholders working on the project, or "external", referring to users of
     the project.

   - The scope is one of "added", "updated", "fixed", "deprecated", "removed",
     or "security". For more information on the scope, see the [Keep A
     Changelog](https://keepachangelog.com/) documentation.

   ```typescript
   classifyChange: async (change: Change) => Promise<ChangelogClassification>
   ```

### Filter Changes

The `filterChange` method controls which changes appear in the final changelog
output. The standard implementation includes all change classified as external
but omits internal changes.

```typescript
filterChange: (change: ClassifiedChange) => boolean
```

The standard filter (from `makeStandardConfigMethods()`) includes all external changes.

### Performance Tuning

You can configure the tool to process changes concurrently by setting the
`llmMaxConcurrency` option. By default, the tool will process changes one at a
time.

```typescript
llmMaxConcurrency?: number; // Default: 1
```

## Artifacts

The generator uses an artifact system to represent items from different sources.

An artifact is a generic container for data that is relevant to a given release.
The `type` field identifies the type of artifact (for example, `"git-commit"` or
`"jira-issue"`), and the `data` field contains the raw data from the source.

As the tool processes an artifact, it populates the `summary` and `changes`
fields. The `summary` field is a human-readable summary of the artifact
(generated by the `summarizeArtifact` method), and the `changes` field is a list
of changes that are relevant to the release (generated by the `extractChanges`
method).

```typescript
type Artifact<T extends string, D> = {
  id: string;
  type: T;
  data: D;
  summary?: string;
  changes: ClassifiedChange[];
  metadata?: Record<string, unknown>;
};
```
