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

  // const bullets = [
  //   "For the language tabs, only include programming examples from the Node.js driver.",
  // ];
  const config = {
    topic: "MongoDB Atlas - Creating and Managing Clusters",
    // customInstructions: makeBulletPrompt(bullets),
    maxChunkSize: 80000,
    percentToInclude: 15,
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
        isMdPage(page) &&
        (page.url.includes("atlas/tutorial/") ||
        page.url.includes("atlas/getting-started/") ||
        page.url.includes("atlas/sample-data/") ||
        page.url.includes("atlas/atlas-ui/") ||
        page.url.includes("atlas/security/") ||
        (()=>{
          // Using a self-executing function to run regex test
          // Match paths containing either "cluster" or "database-deployment"
          const pattern = /atlas\/.*?(cluster|database-deployment)/i;
          return pattern.test(page.url);
        })()),
        
      // TODO: validate
    },
    maxConcurrency: 20,
  } satisfies GenerateMakeSnootySiteMaxxPromptParams;

  const maxxPrompt = await generateSnootySiteMaxxPrompt(config);
  if (!maxxPrompt) {
    console.error("Failed to generate maxx prompt");
    return;
  }

  const pathOut = path.join(maxxPromptsDir, "AtlasClusters.md");
  console.log(`Writing maxx prompt to ${pathOut}`);
  fs.writeFileSync(pathOut, maxxPrompt);
  console.log(`Wrote maxx prompt to ${pathOut}`);
}
main();
