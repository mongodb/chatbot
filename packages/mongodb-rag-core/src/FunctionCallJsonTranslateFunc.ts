import { AzureOpenAI } from "openai";

export type MakeFunctionCallJsonTranslateFuncArgs = {
  /**
    The name of the TypeChat schema or interface.
   */
  schemaName: string;

  /**
    The text of a .d.ts that would inform the schema.
   */
  schema: string;

  /**
    An Azure OpenAI client.
   */
  openAiClient: AzureOpenAI;

  /**
    Number of times to retry the query preprocessor if it fails.
   */
  numRetries?: number;

  /**
    Delay between retries in milliseconds.
   */
  retryDelayMs?: number;
};

export function makeFunctionCallJsonTranslateFunc<SchemaType extends object>({
  openAi,
  schema,
  schemaName,
  numRetries = 1,
  retryDelayMs = 1000,
}: MakeFunctionCallJsonTranslateFuncArgs): (
  prompt: string
) => Promise<SchemaType> {
  const { apiKey, baseUrl, deployment, version } = azureOpenAiServiceConfig;

  const model = createAzureOpenAILanguageModel(
    apiKey,
    `${baseUrl}openai/deployments/${deployment}/chat/completions?api-version=${version}`
  );

  // LLM function
  const translator = createJsonTranslator<SchemaType>(
    model,
    schema,
    schemaName
  );

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
