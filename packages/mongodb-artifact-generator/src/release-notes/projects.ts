export type Project = {
  name: string;
  description: string;
  validateReleaseVersionFormat(version: string): boolean;
  getReleaseArtifacts(version: string): Promise<ReleaseArtifact[]>;
};

export type ReleaseArtifact =
  | {
      type: "git-commit";
      data: {
        hash: string;
        message: string;
      };
    }
  | {
      type: "git-diff";
      data: {
        oldCommit: string;
        newCommit: string;
        diff: string;
      };
    };
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
// | {
//     type: "confluence-page";
//     data: {
//       title: string;
//       content: string;
//     };
//   };
