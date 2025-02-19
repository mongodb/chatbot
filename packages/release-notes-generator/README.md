# Release Notes Generator

A flexible and extensible tool for generating release notes from various sources like GitHub commits and Jira issues. The generator supports custom artifact sources, change classification, and filtering to create tailored release notes for your project.

## Features

- 🔄 Supports multiple artifact sources (GitHub, Jira, etc.)
- 🎯 Customizable change classification and filtering
- 📝 Extensible summarization capabilities
- 🔍 Type-safe configuration with runtime validation
- ⚡️ Concurrent processing with configurable rate limiting
- 🎨 Standard config methods with customizable overrides

## Quick Start

The fastest way to get started is using the standard configuration methods:

```typescript
import { generate, createConfig } from "release-notes-generator";
import { makeStandardConfigMethods } from "release-notes-generator/config";
import { makeGitHubReleaseArtifacts } from "release-notes-generator/github";
import { makeJiraReleaseArtifacts } from "release-notes-generator/jira";

// Get the standard methods for processing changes
const standardMethods = makeStandardConfigMethods();

const config = createConfig({
  project: {
    name: "My Project",
    description: "A description of what my project does",
  },
  // Fetch artifacts from both GitHub and Jira
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
      version: current,
    });

    const [commits, issues] = await Promise.all([
      github.getCommits(),
      jira.getIssues(),
    ]);

    return [...commits, ...issues];
  },
  // Use standard methods for processing
  summarizeArtifact: standardMethods.summarizeArtifact,
  extractChanges: standardMethods.extractChanges,
  classifyChange: standardMethods.classifyChange,
  filterChange: standardMethods.filterChange,
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
    return { audience: "internal", scope: "updated" };
  },
});
```

## Configuration Guide

The generator uses a type-safe configuration system that validates your config at runtime. You can use the standard methods from `makeStandardConfigMethods()` or customize each part:

### Project Info

Basic information about your project:
```typescript
project: {
  name: string;
  description: string;
}
```

### Artifact Collection

The `fetchArtifacts` function gathers release-related items from your sources:
```typescript
fetchArtifacts: async ({ current, previous }: VersionRange) => Promise<SomeArtifact[]>
```

Built-in helpers for common sources:
- `makeGitHubReleaseArtifacts`: Fetches commits and diffs from GitHub
- `makeJiraReleaseArtifacts`: Fetches issues from Jira

### Change Processing

Three functions control how changes are processed. You can use the standard implementations from `makeStandardConfigMethods()` or provide your own:

1. `summarizeArtifact`: Creates human-readable summaries
```typescript
summarizeArtifact: async ({ project, artifact }) => Promise<string>
```

2. `extractChanges`: Pulls out individual changes from artifacts
```typescript
extractChanges: async ({ project, artifact }) => Promise<Change[]>
```

3. `classifyChange`: Categorizes changes for grouping
```typescript
classifyChange: async (change: Change) => Promise<ChangelogClassification>
```

### Filtering

Control which changes appear in the final output:
```typescript
filterChange: (change: ClassifiedChange) => boolean
```

The standard filter (from `makeStandardConfigMethods()`) includes all external changes.

### Performance Tuning

Configure concurrent processing:
```typescript
llmMaxConcurrency?: number; // Default: 1
```

## API Reference

### Core Types

```typescript
type Change = {
  description: string;
  sourceIdentifier?: string;
};

type ChangelogClassification = {
  audience: "internal" | "external";
  scope: "added" | "updated" | "fixed" | "deprecated" | "removed" | "security";
};

type ClassifiedChange = Change & {
  classification: ChangelogClassification;
};
```

### Artifacts

The generator uses an artifact system to represent items from different sources:

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
