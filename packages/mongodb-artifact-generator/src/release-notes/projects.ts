export type Project = {
  name: string;
  description: string;
  validateReleaseVersionFormat(version: string): boolean;
  getReleaseArtifacts(version: string): Promise<ReleaseArtifact[]>;
};

export type GitCommitArtifact = {
  type: "git-commit";
  data: {
    hash: string;
    message: string;
    files: {
      fileName: string;
      additions: number;
      deletions: number;
      changes: number;
      hash: string;
      status: string;
    }[];
  };
};

export type GitDiffArtifact = {
  type: "git-diff";
  data: {
    oldHash: string;
    newHash: string;
    fileName: string;
    diff: string;
  };
};

export type ReleaseArtifact = GitCommitArtifact;

// | {
//     type: "jira-issue";
//     data: {
//       key: string;
//       summary: string;
//       description: string;
//     };
//   }
// | {
//     type: "jira-release";
//     data: {
//       version: string;
//       description: string;
//     };
//   }
// | {
//     type: "jira-changelog";
//     data: {
//       version: string;
//       issues: string[];
//     };
//   }
