import {
  createConfiguredAction,
  withConfig,
  withConfigOptions,
} from "../withConfig";
import { createCommand } from "../createCommand";
import { makeRunLogger, type RunLogger } from "../runlogger";
import { getReleaseArtifacts } from "../release-notes/getReleaseArtifacts";
import { summarizeReleaseArtifacts } from "../release-notes/summarizeReleaseArtifacts";
import {
  ReleaseArtifact,
  releaseArtifactShortMetadata,
} from "../release-notes/projects";
import { promises as fs } from "fs";
import { createChangelogs } from "../release-notes/createChangelog";
import { groupBy } from "../utils";
import {
  ClassifiedChangelog,
  makeClassifyChangelogs,
} from "../release-notes/classifyChangelog";
import { PromisePool } from "@supercharge/promise-pool";

let logger: RunLogger;

type GenerateJiraPromptResponseCommandArgs = {
  runId?: string;
  llmMaxConcurrency: number;
};

export default createCommand<GenerateJiraPromptResponseCommandArgs>({
  command: "generateJiraPromptResponse",
  builder(args) {
    return withConfigOptions(args)
      .option("runId", {
        type: "string",
        demandOption: false,
        description:
          "A unique name for the run. This controls where outputs artifacts and logs are stored.",
      })
      .option("llmMaxConcurrency", {
        type: "number",
        demandOption: false,
        default: 10,
        description:
          "The maximum number of concurrent requests to the LLM API. Defaults to 10.",
      });
  },
  async handler(args) {
    logger = makeRunLogger({
      topic: "GenerateJiraPromptResponse",
      runId: args.runId,
    });
    logger.logInfo(`Running command with args: ${JSON.stringify(args)}`);
    try {
      const result = await withConfig(action, args);
      logger.logInfo(`Success`);
      return result;
    } finally {
      await logger.flushArtifacts();
      await logger.flushLogs();
    }
  },
  describe:
    "Generate prompt-response pairs that crytallize knowledge from raw jira issues.",
});

export const action =
  createConfiguredAction<GenerateJiraPromptResponseCommandArgs>(
    async ({ jiraApi, openAiClient }, { llmMaxConcurrency }) => {
      logger.logInfo(`Setting up...`);
      if (!jiraApi) {
        throw new Error(
          "jiraApi is required. Make sure to define it in the config."
        );
      }
      if (!openAiClient) {
        throw new Error(
          "openAiClient is required. Make sure to define it in the config."
        );
      }

      const testIssues = [
        "CDRIVER-1072",
        "CDRIVER-2045",
        "COMPASS-2389",
        "COMPASS-2437",
        // "COMPASS-4547",
        // "COMPASS-4837",
        // "COMPASS-7283",
        // "CSHARP-1165",
        // "CSHARP-1734",
        // "CSHARP-1895",
        // "CSHARP-3653",
        // "CSHARP-4058",
        // "CSHARP-4474",
        // "CSHARP-673",
        // "CSHARP-863",
        // "CSHARP-994",
        "DOCS-12798",
        "DOCS-12941",
        "DOCS-13654",
        // "DOCS-13727",
        "DOCS-14793",
        "DOCS-5270",
        // "GODRIVER-1182",
        "GODRIVER-1763",
        "GODRIVER-3062",
        "GODRIVER-897",
        "JAVA-2609",
        // "JAVA-3452",
        "JAVA-3668",
        "JAVA-4044",
        // "JAVA-4154",
        "JAVA-466",
        "KAFKA-395",
        "MONGOID-247",
        "MONGOID-4067",
        // "MONGOSH-1031",
        "MONGOSH-587",
        // "NODE-1051",
        "NODE-1649",
        "NODE-3523",
        // "NODE-3631",
        // "NODE-3654",
        "NODE-5305",
        "NODE-5662",
        "PYTHON-1434",
        // "PYTHON-1880",
        // "PYTHON-3257",
        // "RUBY-1917",
        // "RUST-1779",
        // "RUST-940",
        // "SERVER-10860",
        // "SERVER-13520",
        // "SERVER-1603",
        // "SERVER-18335",
        // "SERVER-19470",
        // "SERVER-19638",
        // "SERVER-20243",
        // "SERVER-22056",
        // "SERVER-25760",
        // "SERVER-25883",
        // "SERVER-27369",
        // "SERVER-31340",
        // "SERVER-31478",
        // "SERVER-31598",
        // "SERVER-31602",
      ];

      // Get each issue using a promise pool
      const jiraMaxConcurrency = 12;
      const { results: jiraIssues, errors: getJiraIssuesErrors } =
        await PromisePool.for(testIssues)
          .withConcurrency(jiraMaxConcurrency)
          .process(async (issueKey) => {
            return await jiraApi.getIssue(issueKey);
          });
      for (const error of getJiraIssuesErrors) {
        logger.logError(`Error fetching issue: ${error.item}`);
      }

      logger.appendArtifact("jiraIssues.raw.json", JSON.stringify(jiraIssues));

      interface JiraComment {
        id: string;
        body: string;
        author: {
          emailAddress: string;
          displayName: string;
        };
        created: string;
        updated: string;
      }

      interface RawJiraIssue {
        key: string;
        fields: {
          project: {
            name: string;
          };
          summary: string;
          status: {
            name: string;
          };
          created: string;
          updated: string;
          description: string;
          comment: {
            comments: JiraComment[];
          };
        };
      }

      interface FormattedJiraIssue {
        key: string;
        projectName: string;
        summary: string;
        status: string;
        created: string;
        updated: string;
        description: string;
        comments: JiraComment[];
      }
      const formattedJiraIssues = (jiraIssues as RawJiraIssue[]).map(
        (issue) => {
          return {
            key: issue.key,
            projectName: issue.fields.project.name,
            summary: issue.fields.summary,
            status: issue.fields.status.name,
            created: issue.fields.created,
            updated: issue.fields.updated,
            description: issue.fields.description,
            comments: issue.fields.comment.comments.map((comment) => {
              return {
                id: comment.id,
                body: comment.body,
                author: {
                  emailAddress: comment.author.emailAddress,
                  displayName: comment.author.displayName,
                },
                created: comment.created,
                updated: comment.updated,
              };
            }),
          } satisfies FormattedJiraIssue;
        }
      );

      logger.appendArtifact(
        "jiraIssues.formatted.json",
        JSON.stringify(formattedJiraIssues)
      );

      // Summarize each issue using a promise pool
      const summariesByIssueKey = new Map<string, string>();
      const { errors: summarizeJiraIssueErrors } = await PromisePool.for(
        jiraIssues
      )
        .withConcurrency(jiraMaxConcurrency)
        .process(async (issue) => {
          const summary = await summarizeJiraIssue(issue); // TODO
          summariesByIssueKey.set(issue.key, summary);
        });
      for (const error of summarizeJiraIssueErrors) {
        logger.logError(`Error summarizing issue: ${error.item}`);
      }

      logger.appendArtifact(
        "summaries.json",
        JSON.stringify(Object.fromEntries(summariesByIssueKey))
      );

      // Append summaries to formatted issues
      const formattedIssuesWithSummaries = formattedJiraIssues.map((issue) => {
        return {
          ...issue,
          summary: summariesByIssueKey.get(issue.key),
        };
      });
      logger.appendArtifact(
        "jiraIssues.formattedWithSummaries.json",
        JSON.stringify(formattedIssuesWithSummaries)
      );

      // Generate a list of N questions/prompts for each issue
      const promptsByIssueKey = new Map<string, string[]>();
      const { errors: generatePromptsErrors } = await PromisePool.for(
        formattedIssuesWithSummaries
      )
        .withConcurrency(llmMaxConcurrency)
        .process(async (issue) => {
          const prompts = await generatePrompts(issue); // TODO
          promptsByIssueKey.set(issue.key, prompts);
        });
      for (const error of generatePromptsErrors) {
        logger.logError(`Error generating prompts: ${error.item}`);
      }
      const prompts: [issueKey: string, prompt: string][] = [
        ...promptsByIssueKey.entries(),
      ].flatMap(([issueKey, prompts]) => {
        return prompts.map((prompt) => [issueKey, prompt] as [string, string]);
      });
      // Have the LLM generate a response to each prompt with the formatted/summarized issue as context
      const responsesByIssueKey = new Map<
        string,
        [prompt: string, response: string][]
      >();
      const { errors: generateResponsesErrors } = await PromisePool.for(prompts)
        .withConcurrency(llmMaxConcurrency)
        .process(async ([issueKey, prompt]) => {
          // TODO
          const response = await generateResponse({
            prompt,
            context: formattedIssuesWithSummaries.find(
              (issue) => issue.key === issueKey
            ),
          });
          if (!responsesByIssueKey.has(issueKey)) {
            responsesByIssueKey.set(issueKey, []);
          }
          responsesByIssueKey.get(issueKey)?.push([prompt, response]);
        });
      for (const error of generateResponsesErrors) {
        logger.logError(`Error generating responses: ${error.item}`);
      }

      // Evaluate the response for adherence to information in the Jira issue
    }
  );
