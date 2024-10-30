import {
  assertEnvVars,
  CORE_OPENAI_CHAT_COMPLETION_ENV_VARS,
  OpenAIClient,
} from "mongodb-rag-core";
import { RunLogger } from "../runlogger";
import { stripIndents } from "common-tags";
import { readdirSync, readFileSync } from "fs";
import path from "path";
import { assistantMessage, systemMessage, userMessage } from "../chat";
import { z } from "zod";
import { DocsMetadata } from "./generateMetadata";

export type MakeGenerateMetaDescription = {
  openAiClient: OpenAIClient;
  logger?: RunLogger;
};

const systemPrompt = stripIndents`
  Your task is to generate a concise, informative description that accurately reflects the content of a given text page.

  This brief summary will be used as a meta description for the page across various services, including search engines.

  The meta description should conform to the following style guide:

  - The meta description should be one single sentence
    - no character limit
    - roughly 150 characters is a good target length
  - The meta description should start with a verb
  - The meta description should not repeat the page title verbatim
  - The meta description should not repeat low value or assumed terms like
    - Don't mention "MongoDB" in the description of a MongoDB docs page.
    - Don't mention "documentation" in the description of a docs page.

  Respond only with the generated description.
`;

export function makeGenerateMetaDescription({
  openAiClient,
  logger,
}: MakeGenerateMetaDescription) {
  const fewShotExamplesDir = "./src/docs-metadata/examples";
  const fewShotExamples = readdirSync(fewShotExamplesDir)
    .filter((fileName) => path.extname(fileName) === ".json")
    .flatMap((fileName) => {
      const file = readFileSync(
        path.join(fewShotExamplesDir, fileName),
        "utf-8"
      );
      const example = z
        .object({
          input: z.object({
            url: z.string(),
            text: z.string(),
          }),
          output: z.string(),
        })
        .parse(JSON.parse(file));
      return [
        userMessage(JSON.stringify(example.input)),
        assistantMessage(example.output),
      ];
    });
  return async function generateMetaDescription({
    url,
    text,
  }: {
    url: string;
    text: string;
  }): Promise<DocsMetadata["description"]> {
    const { OPENAI_CHAT_COMPLETION_DEPLOYMENT } = assertEnvVars(
      CORE_OPENAI_CHAT_COMPLETION_ENV_VARS
    );
    const result = await openAiClient.getChatCompletions(
      OPENAI_CHAT_COMPLETION_DEPLOYMENT,
      [
        systemMessage(systemPrompt),
        ...fewShotExamples,
        userMessage(JSON.stringify({ url, text })),
      ],
      {
        temperature: 0,
        maxTokens: 300,
      }
    );
    const response = result.choices[0].message?.content;
    if (!response) {
      throw new Error("No response from OpenAI");
    }
    return response;
  };
}
