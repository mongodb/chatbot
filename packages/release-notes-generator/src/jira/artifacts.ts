// import { Artifact } from "../Artifact";

// export class JiraIssueArtifact extends Artifact<
//   "jira-issue",
//   {
//     key: string;
//     summary: string;
//     description: string;
//     comments: {
//       user: string;
//       timestamp: string;
//       comment: string;
//     }[];
//   }
// > {
//   identifier(): string {
//     return `${this.type}::${this.data.key}`;
//   }

//   condensed() {
//     return {
//       ...super.condensed(),
//       key: this.data.key,
//     };
//   }
// }
