import { Octokit } from "@octokit/rest";
import JiraApi from "jira-client";
import { Embedder, PageStore, EmbeddedContentStore } from "mongodb-rag-core";
import { OpenAI } from "mongodb-rag-core/openai";

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
  openAiClient?: Constructor<OpenAI>;

  /**
    The Jira API client.
   */
  jiraApi?: Constructor<JiraApi>;

  /**
    The maximum number of concurrent requests to make to the Jira API.
    @default 12
   */
  jiraApiMaxConcurrency?: number;

  /**
    The GitHub API client.
   */
  githubApi?: Constructor<Octokit>;

  /**
   The maximum number of concurrent requests to make to an LLM generator.
   @default 8
   */
  llmMaxConcurrency?: number;
};

export type Constructor<T> = (() => T) | (() => Promise<T>);
