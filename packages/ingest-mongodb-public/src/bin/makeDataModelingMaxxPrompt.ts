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

  const config = {
    topic: "Data Modeling",
    maxChunkSize: 80000,
    percentToInclude: 15,
    options: {
      model,
      //   temperature: 0,
      max_completion_tokens: 4000,
    },
    snooty: {
      dataSource: {
        // MongoDB Manual
        type: "snooty",
        name: "docs",
        tags: ["docs", "manual"],
        productName: "MongoDB Server",
      },
      filter: (page) =>
        isMdPage(page) && page.url.includes("manual/data-modeling/"),
    },
    maxConcurrency: 20,
  } satisfies GenerateMakeSnootySiteMaxxPromptParams;

  const maxxPrompt = await generateSnootySiteMaxxPrompt(config);
  if (!maxxPrompt) {
    console.error("Failed to generate maxx prompt");
    return;
  }

  const pathOut = path.join(maxxPromptsDir, "dataModeling.md");
  console.log(`Writing maxx prompt to ${pathOut}`);
  fs.writeFileSync(pathOut, maxxPrompt);
  console.log(`Wrote maxx prompt to ${pathOut}`);
}
main();
