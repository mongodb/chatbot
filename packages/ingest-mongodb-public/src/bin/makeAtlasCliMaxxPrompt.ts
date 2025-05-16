import { OpenAI } from "mongodb-rag-core/openai";
import { wrapOpenAI } from "mongodb-rag-core/braintrust";
import {
  GenerateMakeSnootySiteMaxxPromptParams,
  isMdPage,
  makeGenerateSnootySiteMaxxPrompt,
} from "../prompt-maxxing/generateSnootySiteMaxxPrompt";
import fs from "fs";
import path from "path";
import { assertEnvVars, BRAINTRUST_ENV_VARS } from "mongodb-rag-core";
import { makeBulletPrompt } from "../prompt-maxxing/makeBulletPrompt";

const maxxPromptsDir = path.resolve(__dirname, "..", "..", "maxxPrompts");

async function main() {
  const { BRAINTRUST_API_KEY, BRAINTRUST_ENDPOINT } = assertEnvVars({
    ...BRAINTRUST_ENV_VARS,
  });
  const openAiClient = wrapOpenAI(
    new OpenAI({
      apiKey: BRAINTRUST_API_KEY,
      baseURL: BRAINTRUST_ENDPOINT,
    })
  );

  const generateSnootySiteMaxxPrompt = makeGenerateSnootySiteMaxxPrompt({
    openAiClient,
  });

  const model = "o3";

  const bullets = [
    "For deeply nested commands (2 levels deep or more, like `atlas accessLogs list`), only include a very high level overview. Do not list the command options or examples. Only include the command name and a short description.",
    "For commands that are not deeply nested, include a fuller description of the command, while maintaining the summarization direction",
    "These custom instructions should take precedence over the default summarization direction",
  ];
  const config = {
    topic: "MongoDB Atlas CLI",
    topicDescription: "CLI for administering MongoDB Atlas",
    customInstructions: makeBulletPrompt(bullets),
    maxChunkSize: 80000,
    percentToInclude: 10,
    options: {
      model,
      //   temperature: 0,
      max_completion_tokens: 4000,
    },
    snooty: {
      dataSource: {
        type: "snooty",
        name: "atlas-cli",
        tags: ["atlas", "docs", "cli", "atlas-cli"],
        productName: "Atlas CLI",
      },
      filter: (page) =>
        isMdPage(page) &&
        page.url.includes("cli/v1.38") &&
        !page.url.includes("v1.38/command/atlas-api-") &&
        !page.url.includes("changelog"),
    },
    maxConcurrency: 20,
  } satisfies GenerateMakeSnootySiteMaxxPromptParams;

  const maxxPrompt = await generateSnootySiteMaxxPrompt(config);
  if (!maxxPrompt) {
    console.error("Failed to generate maxx prompt");
    return;
  }

  const pathOut = path.join(maxxPromptsDir, "atlasCli.md");
  console.log(`Writing maxx prompt to ${pathOut}`);
  fs.writeFileSync(pathOut, maxxPrompt);
  console.log(`Wrote maxx prompt to ${pathOut}`);
}
main();
