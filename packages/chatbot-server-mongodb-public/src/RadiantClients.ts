import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { Embeddings } from "@langchain/core/embeddings";
export interface BaseMongoDbRadiantParams {
  /**
    The base URL of the Radiant API.
   */
  radiantBaseUrl: string;
  /**
    The API key for the Radiant API.
   */
  radiantApiKey: string;
  /**
    `cookie` string that contains authentication information
    to access Radiant through MongoDB corporate security.

    _Must_ contain the following cookies:

    - `auth_claim_0`
    - `auth_claim_1`
    - `auth_token`
    - `auth_user`
   */
  cookie?: string;
}

/**
  Constructs a client to access MongoDB [Radiant AI](https://radiantai.com/)
  instance to communicate with LLMs.
  Used to consume models hosted with Radiant.
 */
export function makeRadiantLlmClient({
  radiantApiKey,
  radiantBaseUrl,
  cookie,
  openAiClientParams,
}: BaseMongoDbRadiantParams & {
  /**
    Optional parameters to pass to the {@link ChatOpenAI}.
   */
  openAiClientParams?: ConstructorParameters<typeof ChatOpenAI>[0];
}) {
  return new ChatOpenAI({
    ...openAiClientParams,
    configuration: {
      ...(openAiClientParams?.configuration ?? {}),
      apiKey: radiantApiKey,
      baseURL: radiantBaseUrl,
      defaultHeaders: {
        ...(openAiClientParams?.configuration?.defaultHeaders ?? {}),
        cookie,
      },
    },
  });
}

/**
  Constructs a client to access MongoDB [Radiant AI](https://radiantai.com/)
  instance to communicate with LLMs.
  Used to consume models hosted with Radiant.
 */
export function makeRadiantEmbeddingClient({
  radiantApiKey,
  radiantBaseUrl,
  cookie,
  openAiClientParams,
}: BaseMongoDbRadiantParams & {
  /**
      Optional parameters to pass to the {@link OpenAIEmbeddings}.
     */
  openAiClientParams?: ConstructorParameters<typeof OpenAIEmbeddings>[0];
}) {
  return new OpenAIEmbeddings({
    ...openAiClientParams,
    configuration: {
      ...(openAiClientParams?.configuration ?? {}),
      apiKey: radiantApiKey,
      baseURL: radiantBaseUrl,
      defaultHeaders: {
        ...(openAiClientParams?.configuration?.defaultHeaders ?? {}),
        cookie,
      },
    },
  }) satisfies Embeddings as Embeddings;
}
