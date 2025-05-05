interface ListBraintrustExperimentsParams {
  apiKey: string;
  queryParams?: {
    limit?: number;
    starting_after?: string;
    ending_before?: string;
    ids?: string[];
    experiment_name?: string;
    project_name?: string;
    project_id?: string;
    org_name?: string;
  };
}

export async function listBraintrustExperiments({
  apiKey,
  queryParams,
}: ListBraintrustExperimentsParams): Promise<unknown> {
  const url = new URL(`https://api.braintrust.dev/v1/experiment/`);
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (Array.isArray(value)) {
        value.forEach((v) => url.searchParams.append(key, v.toString()));
      } else if (value) {
        url.searchParams.append(key, value.toString());
      }
    }
  }
  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
  if (res.status !== 200) {
    throw new Error(`Failed to list experiments: ${res.status}`);
  }
  const json = await res.json();
  return json as ListBraintrustExperimentsResponse;
}

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

export interface ListBraintrustExperimentsResponse {
  /**
    A list of experiment objects
   */
  objects: Experiment[];
}

export interface Experiment {
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
