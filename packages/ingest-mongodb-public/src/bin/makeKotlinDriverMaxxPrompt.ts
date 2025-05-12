import { OpenAI } from "mongodb-rag-core/openai";
import { wrapOpenAI } from "mongodb-rag-core/braintrust";
import {
  GenerateMakeSnootySiteMaxxPromptParams,
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
    topic: "Kotlin Coroutine Driver",
    customInstructions: `- Format the content to be used as prompt for an LLM.
- Remove formatting that seems specific to rendering on a web page, like tabs.
- Remove marketing fluff. This guide is to be used for technical purposes to prompt an LLM
- For the Aggregate builders, keep it super minimal.
- Focus on the stuff for the Kotlin coroutine driver that is more Kotlin/corountine specific. Spend little time on the stuff that's more general to MongoDB or very similar to the Java driver.`,
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
        name: "kotlin",
        tags: ["docs", "driver", "kotlin", "kotlin-coroutines"],
        productName: "Kotlin Coroutine Driver",
      },
    },
    maxConcurrency: 20,
  } satisfies GenerateMakeSnootySiteMaxxPromptParams;

  const maxxPrompt = await generateSnootySiteMaxxPrompt(config);
  if (!maxxPrompt) {
    console.error("Failed to generate maxx prompt");
    return;
  }

  const pathOut = path.join(maxxPromptsDir, "kotlinCoroutineDriver.md");
  console.log(`Writing maxx prompt to ${pathOut}`);
  fs.writeFileSync(pathOut, maxxPrompt);
  console.log(`Wrote maxx prompt to ${pathOut}`);
}
main();
