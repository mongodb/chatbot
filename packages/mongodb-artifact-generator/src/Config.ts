import { Octokit } from "@octokit/rest";
import JiraApi from "jira-client";
import {
  Embedder,
  PageStore,
  EmbeddedContentStore,
  OpenAIClient,
} from "mongodb-rag-core";

/**
  The configuration for the artifact generator.

  You can provide your own configuration to the tool.

  Every property is a function that constructs an instance (synchronously or
  asynchronously). This allows you to run logic for construction or build async.
  It also avoids unnecessary construction and cleanup if that field of the
  config is overridden by a subsequent config.
 */
export type Config = {
  /**
    The store that holds pages downloaded from data sources.
   */
  pageStore: Constructor<PageStore>;

  /**
    The embedding function.
   */
  embedder: Constructor<Embedder>;

  /**
    The store that holds the embedded content and vector embeddings for later vector search.
   */
  embeddedContentStore: Constructor<EmbeddedContentStore>;

  /**
    The OpenAI API client.
   */
  openAiClient?: Constructor<OpenAIClient>;

  /**
    The Jira API client.
   */
  jiraApi?: Constructor<JiraApi>;

  /**
    The GitHub API client.
   */
  githubApi?: Constructor<Octokit>;
};

export type Constructor<T> = (() => T) | (() => Promise<T>);
