import fs from "fs";
import path from "path";
import { createAzureOpenAILanguageModel, createJsonTranslator } from "typechat";
import { CheckQualityResult } from "./CheckQualityResult";
import { stripIndents } from "common-tags";

export interface AzureOpenAiServiceConfig {
  apiKey: string;
  baseUrl: string;
  deployment: string;
  version: string;
}
export async function checkResponseQuality(
  received: string,
  expectedOutputDescription: string,
  azureOpenAiServiceConfig: AzureOpenAiServiceConfig
): Promise<CheckQualityResult> {
  const schemaPath = fs.readFileSync(
    path.join(__dirname, "CheckQualityResult.ts"),
    "utf8"
  );
  const schemaName = "CheckQualityResult";
  const { apiKey, baseUrl, deployment, version } = azureOpenAiServiceConfig;

  const model = createAzureOpenAILanguageModel(
    apiKey,
    `${baseUrl}openai/deployments/${deployment}/chat/completions?api-version=${version}`
  );

  // LLM function
  const translator = createJsonTranslator<CheckQualityResult>(
    model,
    schemaPath,
    schemaName
  );

  const promptWrapper = stripIndents`

  <Content>

  ${received}

  <End of content>

  <Expectation>
  ${expectedOutputDescription}
  <End of expectation>
  `;

  const response = await translator.translate(promptWrapper);
  if (!response.success) {
    throw new Error(response.message);
  }
  return response.data;
}
