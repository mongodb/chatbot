import type { AzureOpenAI } from "mongodb-rag-core/openai";
import { makeClassifyChangelogAudience } from "./classifyChangelogAudience";
import { makeClassifyChangelogScope } from "./classifyChangelogScope";
import type { Classification } from "mongodb-rag-core";

export type ClassifiedChangelog = {
  audience: Classification;
  scope: Classification;
  changelog: string;
};

export type MakeClassifyChangelogScope = {
  openAiClient: AzureOpenAI;
  model: string;
};

export function makeClassifyChangelog({
  openAiClient,
  model,
}: MakeClassifyChangelogScope) {
  const classifyChangelogAudience = makeClassifyChangelogAudience({
    openAiClient,
    model,
  });
  const classifyChangelogScope = makeClassifyChangelogScope({
    openAiClient,
    model,
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
