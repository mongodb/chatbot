import { type SomeArtifact } from "./Artifact";
import {
  type Change,
  type ClassifiedChange,
  type ChangelogClassification,
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
export type ClassifyChange = (
  change: Change
) => Promise<ChangelogClassification>;

/**
 A function that includes (i.e. returns true) or excludes (returns false) changes from the changelog based on their classification or other metadata.
 */
export type FilterChange = (change: ClassifiedChange) => boolean;

export type Config = {
  /**
   The name of the project.
   */
  projectName: string;
  fetchArtifacts: FetchArtifacts;
  summarizeArtifact: SummarizeArtifact;
  extractChanges: ExtractChanges;
  classifyChange: ClassifyChange;
  filterChange: FilterChange;
};

export function createChangelogConfig(config: Config): Config {
  return config;
}

export async function loadConfig(path: string): Promise<Config> {
  const { default: configModule } = await import(path);
  return configModule.default;
}
