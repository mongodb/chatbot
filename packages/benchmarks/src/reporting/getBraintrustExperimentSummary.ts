import { init } from "mongodb-rag-core/braintrust";

export interface GetBraintrustExperimentSummary {
  experimentName: string;
  projectName: string;
  apiKey: string;
}

export async function getBraintrustExperimentSummary({
  projectName,
  experimentName,
  apiKey,
}: GetBraintrustExperimentSummary): Promise<unknown> {
  const experiment = await init(projectName, {
    experiment: experimentName,
    apiKey,
    open: true,
  });
  const id = await experiment.id;

  const metadata = (await fetch(
    `https://api.braintrust.dev/v1/experiment/${id}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    }
  ).then((res) => res.json())) as GetExperimentMetadataResponse;

  const summary = (await fetch(
    `https://api.braintrust.dev/v1/experiment/${id}/summarize?summarize_scores=true&comparison_experiment_id=${id}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    }
  ).then((res) => res.json())) as GetExperimentSummaryResponse;

  return { metadata, summary };
}

// ---
// Types from the Braintrust API docs
// ---
/**
  Metadata about the state of the repo when the experiment was created
 */
export type RepoInfo = {
  /**
    SHA of most recent commit
   */
  commit?: string | null;
  /**
    Name of the branch the most recent commit belongs to
   */
  branch?: string | null;
  /**
    Name of the tag on the most recent commit
   */
  tag?: string | null;
  /**
    Whether or not the repo had uncommitted changes when snapshotted
   */
  dirty?: boolean | null;
  /**
    Name of the author of the most recent commit
   */
  author_name?: string | null;
  /**
    Email of the author of the most recent commit
   */
  author_email?: string | null;
  /**
    Most recent commit message
   */
  commit_message?: string | null;
  /**
    Time of the most recent commit
   */
  commit_time?: string | null;
  /**
    If the repo was dirty when run, this includes the diff between the current state of the repo and the most recent commit.
   */
  git_diff?: string | null;
};

export interface GetExperimentMetadataResponse {
  /**
    Unique identifier for the experiment
   */
  id: string;
  /**
    Unique identifier for the project that the experiment belongs under
   */
  project_id: string;
  /**
    Name of the experiment. Within a project, experiment names are unique
   */
  name: string;
  /**
    Textual description of the experiment
   */
  description?: string | null;
  /**
    Date of experiment creation
   */
  created?: string | null;
  repo_info?: RepoInfo;
  /**
    Commit, taken directly from `repo_info.commit`
   */
  commit?: string | null;
  /**
    Id of default base experiment to compare against when viewing this experiment
   */
  base_exp_id?: string | null;
  /**
    Date of experiment deletion, or null if the experiment is still active
   */
  deleted_at?: string | null;
  /**
    Identifier of the linked dataset, or null if the experiment is not linked to a dataset
   */
  dataset_id?: string | null;
  /**
    Version number of the linked dataset the experiment was run against. This can be used to reproduce the experiment after the dataset has been modified.
   */
  dataset_version?: string | null;
  /**
    Whether or not the experiment is public. Public experiments can be viewed by anybody inside or outside the organization
   */
  public: boolean;
  /**
    Identifies the user who created the experiment
   */
  user_id?: string | null;
  /**
   User-controlled metadata about the experiment
   */
  metadata?: {
    [k: string]: {
      [k: string]: unknown;
    };
  } | null;
}

/**
  Summary of an experiment
 */
export interface GetExperimentSummaryResponse {
  /**
    Name of the project that the experiment belongs to
   */
  project_name: string;
  /**
    Name of the experiment
   */
  experiment_name: string;
  /**
    URL to the project's page in the Braintrust app
   */
  project_url: string;
  /**
    URL to the experiment's page in the Braintrust app
   */
  experiment_url: string;
  /**
    The experiment which scores are baselined against
   */
  comparison_experiment_name?: string | null;
  /**
    Summary of the experiment's scores
   */
  scores?: {
    [k: string]: ScoreSummary;
  } | null;
  /**
    Summary of the experiment's metrics
   */
  metrics?: {
    [k: string]: MetricSummary;
  } | null;
}
/**
  Summary of a score's performance
 */
export interface ScoreSummary {
  /**
    Name of the score
   */
  name: string;
  /**
    Average score across all examples
   */
  score: number;
  /**
    Difference in score between the current and comparison experiment
   */
  diff?: number;
  /**
    Number of improvements in the score
   */
  improvements: number;
  /**
    Number of regressions in the score
   */
  regressions: number;
}
/**
  Summary of a metric's performance
 */
export interface MetricSummary {
  /**
    Name of the metric
   */
  name: string;
  /**
    Average metric across all examples
   */
  metric: number;
  /**
    Unit label for the metric
   */
  unit: string;
  /**
    Difference in metric between the current and comparison experiment
   */
  diff?: number;
  /**
    Number of improvements in the metric
   */
  improvements: number;
  /**
    Number of regressions in the metric
   */
  regressions: number;
}
