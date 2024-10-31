import OpenAI from "openai";
import { Embedder } from "./Embedder";
import { logger } from "../logger";
import { stripIndent } from "common-tags";
import { backOff, BackoffOptions } from "exponential-backoff";

export type MakeOpenAiEmbedderArgs = {
  /**
    Options used for automatic retry (usually due to rate limiting).
   */
  backoffOptions?: BackoffOptions;

  /**
    The deployment key.
   */
  deployment: string;

  /**
    The OpenAI client.
   */
  openAiClient: OpenAI;
};

/**
  Constructor for implementation of the {@link Embedder} using [OpenAI
  Embeddings API](https://platform.openai.com/docs/guides/embeddings).
 */
export const makeOpenAiEmbedder = ({
  backoffOptions: backoffOptionsIn,
  deployment,
  openAiClient,
}: MakeOpenAiEmbedderArgs): Embedder => {
  const backoffOptions: BackoffOptions = backoffOptionsIn ?? {
    jitter: "full",
    maxDelay: 10000,
  };

  const DEFAULT_WAIT_SECONDS = 5;
  return {
    async embed({ text }) {
      return backOff(
        async () => {
          const response = await openAiClient.embeddings.create({
            model: deployment,
            input: [text],
          });
          return { embedding: response.data[0].embedding };
        },
        {
          ...backoffOptions,
          async retry(err, attemptNumber) {
            // Catch errors if response 4XX or 5XX
            if (err.code === undefined) {
              logger.error(
                `OpenAI Embedding API request failed with unknown error: ${JSON.stringify(
                  err
                )}`
              );
              return false;
            }
            const { code: codeString, message } = err;
            const code = parseInt(codeString);
            const errorMessage = (message as string) ?? "Unknown error";
            if (code === 429) {
              logger.info(
                `OpenAI Embedding API rate limited (attempt ${
                  attemptNumber - 1
                }): ${errorMessage}`
              );

              // Quick optimization for retry where we wait as long as it tells us
              // to (if it does)
              const matches = /retry after ([0-9]+) seconds/.exec(errorMessage);
              const waitSeconds = matches
                ? parseInt(matches[1])
                : DEFAULT_WAIT_SECONDS;
              if (waitSeconds) {
                await new Promise((resolve) =>
                  setTimeout(resolve, waitSeconds * 1000)
                );
              }

              return true; // Keep trying until max attempts
            }
            // Azure OpenAI service returns 5XX errors for rate limiting in addition to 429
            if (code >= 500) {
              logger.info(
                `OpenAI Embedding API unavailable (attempt ${
                  attemptNumber - 1
                }): ${errorMessage}`
              );
              await new Promise((resolve) =>
                setTimeout(resolve, DEFAULT_WAIT_SECONDS * 1000)
              );
              return true; // Keep trying until max attempts
            }
            const resultMessage = stripIndent`OpenAI Embedding API returned an error:
- code: ${code}
- message: ${errorMessage}`;
            logger.error(resultMessage);
            return false;
          },
        }
      );
    },
  };
};
