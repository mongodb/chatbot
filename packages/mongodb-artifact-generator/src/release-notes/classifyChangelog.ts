import { OpenAI } from "mongodb-rag-core/openai";
import { PromisePool } from "@supercharge/promise-pool";
import { makeClassifyChangelogAudience } from "./classifyChangelogAudience";
import { makeClassifyChangelogScope } from "./classifyChangelogScope";
import { iOfN } from "../utils";
import { RunLogger } from "../runlogger";
import { Classification } from "mongodb-rag-core";

export type ClassifiedChangelog = {
  audience: Classification;
  scope: Classification;
  changelog: string;
};

export type MakeClassifyChangelogScope = {
  openAiClient: OpenAI;
  model: string;
  logger?: RunLogger;
};

export function makeClassifyChangelog({
  openAiClient,
  model,
  logger,
}: MakeClassifyChangelogScope) {
  const classifyChangelogAudience = makeClassifyChangelogAudience({
    openAiClient,
    model,
    logger,
  });
  const classifyChangelogScope = makeClassifyChangelogScope({
    openAiClient,
    model,
    logger,
  });

  return async function classifyChangelog({
    changelog,
  }: {
    changelog: string;
  }): Promise<ClassifiedChangelog> {
    const { classification: audience } = await classifyChangelogAudience({
      input: changelog,
    });
    const { classification: scope } = await classifyChangelogScope({
      input: changelog,
    });

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
  model,
}: MakeClassifyChangelogScope) {
  const classifyChangelog = makeClassifyChangelog({
    openAiClient,
    logger,
    model,
  });

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
