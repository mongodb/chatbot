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
    "For reference tables, consolidate into only the key points",
    "For code examples of I/O, keep very lean. Feel free to remove, or include only fewer examples of the documents.",
    "These custom instructions should take precedence over the default summarization direction",
  ];
  const config = {
    topic: "Atlas Stream Processing",
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
        name: "cloud-docs",
        tags: ["atlas", "docs"],
        productName: "MongoDB Atlas",
      },
      filter: (page) =>
        isMdPage(page) && page.url.includes("atlas/atlas-stream-processing"),
    },
    maxConcurrency: 20,
  } satisfies GenerateMakeSnootySiteMaxxPromptParams;

  const maxxPrompt = await generateSnootySiteMaxxPrompt(config);
  if (!maxxPrompt) {
    console.error("Failed to generate maxx prompt");
    return;
  }

  const pathOut = path.join(maxxPromptsDir, "atlasStreamProcessing.md");
  console.log(`Writing maxx prompt to ${pathOut}`);
  fs.writeFileSync(pathOut, maxxPrompt);
  console.log(`Wrote maxx prompt to ${pathOut}`);
}
main();
