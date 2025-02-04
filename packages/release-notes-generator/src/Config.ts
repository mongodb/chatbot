import { type SomeArtifact } from "./Artifact";
import {
  type ChangelogClassification,
  type Change,
  type ClassifiedChange,
  type SomeClassification,
} from "./Change";

export type VersionRange = {
  current: string;
  previous: string;
};

/**
 A function that fetches artifacts for a release.
 */
export type FetchArtifacts = (version: VersionRange) => Promise<SomeArtifact[]>;

/**
 A function that summarizes a given release artifact.
 */
export type SummarizeArtifact = (artifact: SomeArtifact) => Promise<string>;

/**
 A function that summarizes a given release artifact.
 */
export type ExtractChanges = (artifact: SomeArtifact) => Promise<Change[]>;

/**
 A function that summarizes a given release artifact.
 */
export type ClassifyChange<Classification extends SomeClassification> = (
  change: Change
) => Promise<Classification>;

/**
 A function that includes (i.e. returns true) or excludes (returns false) changes from the changelog based on their classification or other metadata.
 */
export type FilterChange<Classification extends SomeClassification> = (
  change: ClassifiedChange<Classification>
) => boolean;

export type Config<
  Classification extends SomeClassification = Record<string, unknown>
> = {
  /**
   The name of the project.
   */
  projectName: string;
  fetchArtifacts: FetchArtifacts;
  summarizeArtifact: SummarizeArtifact;
  extractChanges: ExtractChanges;
  classifyChange: ClassifyChange<Classification>;
  filterChange: FilterChange<Classification>;
};

export function createConfig<
  Classification extends SomeClassification = Record<string, unknown>
>(config: Config<Classification>): Config<Classification> {
  return config;
}

export function createChangelogConfig(
  config: Config<ChangelogClassification>
): Config<ChangelogClassification> {
  return createConfig<ChangelogClassification>(config);
}

export async function loadConfig<C extends Config>(path: string): Promise<C> {
  const { default: module } = await import(path);
  const config = module.default as C;
  return config;
}
