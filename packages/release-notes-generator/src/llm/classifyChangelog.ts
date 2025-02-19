import type { AzureOpenAI } from "mongodb-rag-core/openai";
import { PromisePool } from "@supercharge/promise-pool";
import { makeClassifyChangelogAudience } from "./classifyChangelogAudience";
import { makeClassifyChangelogScope } from "./classifyChangelogScope";
import type { Logger } from "../logger";
import type { Classification } from "mongodb-rag-core";

export type ClassifiedChangelog = {
  audience: Classification;
  scope: Classification;
  changelog: string;
};

export type MakeClassifyChangelogScope = {
  openAiClient: AzureOpenAI;
  model: string;
  logger?: Logger;
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
      .handleError((error, changeDescription) => {
        void logger?.log("error", "Error classifying change", {
          errorMessage: error.message,
          changeDescription,
        });
        errors.push(error);
      })
      .process(async (changeDescription) => {
        const summary = await classifyChangelog({
          changelog: changeDescription,
        });
        return summary;
      });

    return classifiedChangelogs;
  };
}
