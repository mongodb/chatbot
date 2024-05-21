import { z } from "zod";
import { GitHubReleaseInfo } from "./github";
import { JiraReleaseInfo } from "./jira";
import { stripIndents } from "common-tags";

export const ReleaseInfo = z.object({
  github: GitHubReleaseInfo.optional(),
  jira: JiraReleaseInfo.optional(),
  projectDescription: z.string().describe(stripIndents`
    A contextual description of the software project. This should
    describe the purpose, use cases, and goals of the project. In
    particular, it should describe the project's users and the
    way they interact with the project.
  `),
});

export type ReleaseInfo = z.infer<typeof ReleaseInfo>;
