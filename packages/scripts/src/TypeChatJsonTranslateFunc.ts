import { createAzureOpenAILanguageModel, createJsonTranslator } from "typechat";
import { createTypeScriptJsonValidator } from "typechat/ts";
import { backOff } from "exponential-backoff";

export interface AzureOpenAiServiceConfig {
  apiKey: string;
  baseUrl: string;
  deployment: string;
  version: string;
}

export type MakeTypeChatJsonTranslateFuncArgs = {
  /**
    The name of the TypeChat schema or interface.
   */
  schemaName: string;

  /**
    The text of a .d.ts that would inform the schema.
   */
  schema: string;

  /**
    Settings for using the Azure service.
   */
  azureOpenAiServiceConfig: AzureOpenAiServiceConfig;

  /**
    Number of times to retry the query preprocessor if it fails.
   */
  numRetries?: number;

  /**
    Delay between retries in milliseconds.
   */
  retryDelayMs?: number;
};

export function makeTypeChatJsonTranslateFunc<SchemaType extends object>({
  azureOpenAiServiceConfig,
  schema,
  schemaName,
  numRetries = 1,
  retryDelayMs = 1000,
}: MakeTypeChatJsonTranslateFuncArgs): (prompt: string) => Promise<SchemaType> {
  const { apiKey, baseUrl, deployment, version } = azureOpenAiServiceConfig;

  const model = createAzureOpenAILanguageModel(
    apiKey,
    `${baseUrl}openai/deployments/${deployment}/chat/completions?api-version=${version}`
  );
  const validator = createTypeScriptJsonValidator<SchemaType>(
    schema,
    schemaName
  );
  // LLM function
  const translator = createJsonTranslator<SchemaType>(model, validator);

  return async (prompt: string) => {
    const response = await backOff(() => translator.translate(prompt), {
      numOfAttempts: numRetries,
      startingDelay: retryDelayMs,
    });

    if (!response.success) {
      throw response; // Response is `Error`
    }

    return response.data; // Success
  };
}
