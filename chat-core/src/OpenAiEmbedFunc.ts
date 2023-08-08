import { posix } from "path";
import axios from "axios";
import { EmbedFunc } from "./EmbedFunc";
import { logger } from "./services/logger";
import { stripIndent } from "common-tags";
import { CreateEmbeddingResponse } from "openai";
import { backOff, BackoffOptions } from "exponential-backoff";

export type MakeOpenAiEmbedFuncArgs = {
  /**
    The OpenAI API endpoint.
   */
  baseUrl: string;

  /**
    The deployment key.
   */
  deployment: string;

  /**
    The OpenAI API key.
   */
  apiKey: string;

  /**
    The OpenAI API version to use.
   */
  apiVersion: string;

  /**
    Options used for automatic retry (usually due to rate limiting).
   */
  backoffOptions?: BackoffOptions;
};

/**
  Creates an OpenAI implementation of the embedding function.
 */
export const makeOpenAiEmbedFunc = ({
  baseUrl,
  deployment,
  apiKey,
  apiVersion,
  backoffOptions: backoffOptionsIn,
}: MakeOpenAiEmbedFuncArgs): EmbedFunc => {
  const backoffOptions: BackoffOptions = backoffOptionsIn ?? {
    jitter: "full",
    maxDelay: 10000,
  };

  const url = new URL(baseUrl);
  url.pathname = posix.join(
    url.pathname,
    "openai",
    "deployments",
    deployment,
    "embeddings"
  );
  url.searchParams.append("api-version", apiVersion);
  const DEFAULT_WAIT_SECONDS = 5;
  return async ({ text, userIp }) => {
    return backOff(
      async () => {
        const { data } = await axios.post<CreateEmbeddingResponse>(
          url.toString(),
          {
            input: text,
            user: userIp,
          },
          {
            headers: {
              "api-key": apiKey,
              "Content-Type": "application/json",
            },
          }
        );
        return { embedding: data.data[0].embedding };
      },
      {
        ...backoffOptions,
        async retry(err, attemptNumber) {
          // Catch axios errors which occur if response 4XX or 5XX
          if (!err.response?.status && !err.response?.data?.error) {
            logger.error(
              `OpenAI Embedding API request failed with unknown error: ${err}`
            );
            return false;
          }
          const {
            status,
            data: { error },
          } = err.response;

          const errorMessage = error?.message ?? "Unknown error";
          if (status === 429) {
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
          if (status >= 500) {
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
          const message = stripIndent`OpenAI Embedding API returned an error:
- status: ${status}
- error: ${errorMessage}`;
          logger.error(message);
          return false;
        },
      }
    );
  };
};
