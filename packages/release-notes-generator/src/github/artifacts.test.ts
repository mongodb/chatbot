import { describe, it, expect } from "vitest";
import {
  gitCommitSchema,
  gitDiffSchema,
  makeGitCommitArtifact,
  makeGitDiffArtifact,
  getGitCommitIdentifier,
  getGitDiffIdentifier,
  getCondensedGitCommit,
  getCondensedGitDiff,
  type GitCommit,
  type GitDiff,
} from "./artifacts";

const mockGitCommit: GitCommit = {
  hash: "abc123",
  title: "feat: add new feature",
  message: "feat: add new feature\n\nDetailed description of the feature",
  files: [
    {
      fileName: "src/index.ts",
      additions: 10,
      deletions: 5,
      changes: 15,
      hash: "def456",
      status: "modified",
    },
  ],
};

const mockGitDiff: GitDiff = {
  oldHash: "abc123",
  newHash: "def456",
  fileName: "src/index.ts",
  diff: "@@ -1,5 +1,10 @@\n-old\n+new",
};

describe("gitCommitSchema", () => {
  it("validates a valid git commit", () => {
    expect(() => gitCommitSchema.parse(mockGitCommit)).not.toThrow();
  });

  it("requires all required fields", () => {
    const invalidCommit = {
      hash: "abc123",
      // Missing required fields
    };
    expect(() => gitCommitSchema.parse(invalidCommit)).toThrow();
  });

  it("validates file array structure", () => {
    const invalidFiles = {
      ...mockGitCommit,
      files: [
        {
          fileName: "test.ts",
          // Missing required fields
        },
      ],
    };
    expect(() => gitCommitSchema.parse(invalidFiles)).toThrow();
  });
});

describe("gitDiffSchema", () => {
  it("validates a valid git diff", () => {
    expect(() => gitDiffSchema.parse(mockGitDiff)).not.toThrow();
  });

  it("requires all required fields", () => {
    const invalidDiff = {
      oldHash: "abc123",
      // Missing required fields
    };
    expect(() => gitDiffSchema.parse(invalidDiff)).toThrow();
  });
});

describe("makeGitCommitArtifact", () => {
  it("creates a valid git commit artifact", () => {
    const artifact = makeGitCommitArtifact({
      id: "test-id",
      data: mockGitCommit,
    });

    expect(artifact).toEqual({
      id: "test-id",
      type: "git-commit",
      data: mockGitCommit,
      changes: [],
    });
  });

  it("includes summary when provided", () => {
    const artifact = makeGitCommitArtifact({
      id: "test-id",
      data: mockGitCommit,
      summary: "Custom summary",
    });

    expect(artifact).toEqual({
      id: "test-id",
      type: "git-commit",
      data: mockGitCommit,
      summary: "Custom summary",
      changes: [],
    });
  });

  it("throws on invalid data", () => {
    const invalidData = {
      hash: "abc123",
      // Missing required fields
    };

    expect(() =>
      makeGitCommitArtifact({
        id: "test-id",
        data: invalidData as GitCommit,
      }),
    ).toThrow();
  });
});

describe("makeGitDiffArtifact", () => {
  it("creates a valid git diff artifact", () => {
    const artifact = makeGitDiffArtifact({
      id: "test-id",
      data: mockGitDiff,
    });

    expect(artifact).toEqual({
      id: "test-id",
      type: "git-diff",
      data: mockGitDiff,
      changes: [],
    });
  });

  it("throws on invalid data", () => {
    const invalidData = {
      oldHash: "abc123",
      // Missing required fields
    };

    expect(() =>
      makeGitDiffArtifact({
        id: "test-id",
        data: invalidData as GitDiff,
      }),
    ).toThrow();
  });
});

describe("getGitCommitIdentifier", () => {
  it("returns the correct identifier format", () => {
    const artifact = makeGitCommitArtifact({
      id: "test-id",
      data: mockGitCommit,
    });

    expect(getGitCommitIdentifier(artifact)).toBe("git-commit::abc123");
  });
});

describe("getGitDiffIdentifier", () => {
  it("returns the correct identifier format", () => {
    const artifact = makeGitDiffArtifact({
      id: "test-id",
      data: mockGitDiff,
    });

    expect(getGitDiffIdentifier(artifact)).toBe("git-diff::src/index.ts");
  });
});

describe("getCondensedGitCommit", () => {
  it("returns condensed commit with all fields", () => {
    const artifact = makeGitCommitArtifact({
      id: "test-id",
      data: mockGitCommit,
    });

    expect(getCondensedGitCommit(artifact)).toEqual({
      id: "test-id",
      type: "git-commit",
      summary: "No summary provided",
      hash: "abc123",
      title: "feat: add new feature",
    });
  });

  it("uses provided summary if available", () => {
    const artifact = makeGitCommitArtifact({
      id: "test-id",
      data: mockGitCommit,
      summary: "Custom summary",
    });

    expect(getCondensedGitCommit(artifact)).toEqual({
      id: "test-id",
      type: "git-commit",
      summary: "Custom summary",
      hash: "abc123",
      title: "feat: add new feature",
    });
  });
});

describe("getCondensedGitDiff", () => {
  it("returns condensed diff with all fields", () => {
    const artifact = makeGitDiffArtifact({
      id: "test-id",
      data: mockGitDiff,
    });

    expect(getCondensedGitDiff(artifact)).toEqual({
      id: "test-id",
      type: "git-diff",
      summary: "No summary provided",
      fileName: "src/index.ts",
      oldHash: "abc123",
      newHash: "def456",
    });
  });

  it("uses provided summary if available", () => {
    const artifact = makeGitDiffArtifact({
      id: "test-id",
      data: mockGitDiff,
    });
    artifact.summary = "Custom summary";

    expect(getCondensedGitDiff(artifact)).toEqual({
      id: "test-id",
      type: "git-diff",
      summary: "Custom summary",
      fileName: "src/index.ts",
      oldHash: "abc123",
      newHash: "def456",
    });
  });
});
