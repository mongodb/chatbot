import { OpenAIClient } from "mongodb-rag-core";
import { PromisePool } from "@supercharge/promise-pool";
import { makeClassifyChangelogAudience } from "./classifyChangelogAudience";
import { makeClassifyChangelogScope } from "./classifyChangelogScope";
import { iOfN } from "../utils";
import { RunLogger } from "../runlogger";
import { Classification } from "../chat/makeClassifier";

export type ClassifiedChangelog = {
  audience: Classification;
  scope: Classification;
  changelog: string;
};

export type MakeClassifyChangelogScope = {
  openAiClient: OpenAIClient;
  logger?: RunLogger;
};

export function makeClassifyChangelog({
  openAiClient,
  logger,
}: MakeClassifyChangelogScope) {
  const classifyChangelogAudience = makeClassifyChangelogAudience({
    openAiClient,
    logger,
  });
  const classifyChangelogScope = makeClassifyChangelogScope({
    openAiClient,
    logger,
  });

  return async function classifyChangelog({
    changelog,
  }: {
    changelog: string;
  }): Promise<ClassifiedChangelog> {
    const audience = await classifyChangelogAudience({ input: changelog });
    const scope = await classifyChangelogScope({ input: changelog });

    return {
      audience,
      scope,
      changelog,
    };
  };
}

export function makeClassifyChangelogs({
  openAiClient,
  logger,
}: MakeClassifyChangelogScope) {
  const classifyChangelog = makeClassifyChangelog({ openAiClient, logger });

  return async function classifyChangelogs({
    changelogs,
    concurrency = 4,
  }: {
    changelogs: string[];
    concurrency: number;
  }) {
    const errors: Error[] = [];
    const { results: classifiedChangelogs } = await PromisePool.for(changelogs)
      .withConcurrency(concurrency)
      .handleError((error, changelog) => {
        const errMessage = `Error classifying changelog: ${error.message}\nChangelog: ${changelog}`;
        console.log(errMessage);
        logger?.logError(errMessage);
        errors.push(error);
      })
      .process(async (changelog, index) => {
        console.log(`classifying changelog ${iOfN(index, changelogs.length)}`);
        const summary = await classifyChangelog({
          changelog,
        });
        return summary;
      });

    return classifiedChangelogs;
  };
}
