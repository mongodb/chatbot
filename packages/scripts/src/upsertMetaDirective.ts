// A CLI script that accepts a docs rST file path and an updated meta description
// The script will update the meta description in the rST file in place
// Usage: node build/upsertMetaDirective.js <path-to-rst-file> <meta-description>

import path from "path";
import fs from "fs";
import { upsertMetaDirectiveInFile } from "./meta2rst";
import { parse, transform } from "csv/sync";
import { z } from "zod";
import { homedir } from "os";

const args = process.argv.slice(2);

const csvFilePathArg = args[0];
if (!csvFilePathArg) {
  console.log("ERROR: CSV File path is required");
  process.exit(1);
}

const csvFilePath = path.resolve(csvFilePathArg);
if (!fs.existsSync(csvFilePath)) {
  console.log(`ERROR: CSV File does not exist: ${csvFilePath}`);
  process.exit(1);
}

const csvFile = fs.readFileSync(csvFilePath, "utf8");
const csvData = parse(csvFile, { columns: true });
// Example of CSV data
// Project,Repo,Path Prefix,Status,URL,Description,,
// Compass,mongodb/docs-compass,compass,Approved,https://mongodb.com/docs/compass/current/agg-pipeline-builder/export-pipeline-results/,"Export your aggregation pipeline results from Compass as JSON or CSV files, with options for advanced JSON formats to preserve data types.",,
// Compass,mongodb/docs-compass,compass,Approved,https://mongodb.com/docs/compass/current/agg-pipeline-builder/count-pipeline-results/,View the number of documents outputted by your aggregation pipeline using the count results button in MongoDB Compass.,,
// Compass,mongodb/docs-compass,compass,Approved,https://mongodb.com/docs/compass/current/agg-pipeline-builder/export-pipeline-to-language/,Export aggregation pipelines to various programming languages using the Aggregation Pipeline Builder for integration into applications.,,
const metaDescriptionRecordSchema = z.object({
  project: z.string(),
  repo: z.string(),
  pathPrefix: z.string(),
  url: z.string(),
  metaDescription: z.string(),
});

type MetaDescriptionRecord = z.infer<typeof metaDescriptionRecordSchema>;

const metaDescriptionRecords = transform<
  Record<string, string>,
  MetaDescriptionRecord
>(csvData, (record) => {
  return metaDescriptionRecordSchema.parse({
    project: record["Project"],
    repo: record["Repo"],
    pathPrefix: record["Path Prefix"],
    url: record["URL"],
    metaDescription: record["Description"],
  });
});

// Transform and group by repo
type RepoUpdates = {
  org: string;
  repo: string;
  pathPrefix: string;
  updates: {
    url: string;
    metaDescription: string;
  }[];
};

const updatesByRepo = metaDescriptionRecords.reduce((acc, record) => {
  const [org, repo] = record.repo.split("/");
  if (!acc[record.repo]) {
    acc[record.repo] = {
      org,
      repo,
      pathPrefix: record.pathPrefix,
      updates: [],
    };
  }
  acc[record.repo].updates.push({
    url: record.url,
    metaDescription: record.metaDescription,
  });
  return acc;
}, {} as Record<string, RepoUpdates>);

// Write updates to files
const missingFileUrls: string[] = [];
const baseReposDir = path.resolve(homedir(), "github-repos");
console.log("Base repos dir: ", baseReposDir);
for (const { org, repo, pathPrefix, updates } of Object.values(updatesByRepo)) {
  console.log(`\n\nREPO: ${org}/${repo}`);
  const repoPath = path.join(baseReposDir, org, repo);
  if (!fs.existsSync(repoPath)) {
    console.log(`ERROR: Repo does not exist: ${repoPath}`);
    continue;
  }
  for (const update of updates) {
    console.log(`\nUPDATE: ${update.url}`);
    const filePath = resolveFilePath({
      repoPath,
      pathPrefix,
      url: update.url,
    });

    if (!filePath) {
      console.log(`ERROR: File does not exist: ${update.url}`);
      missingFileUrls.push(update.url);
      continue;
    }

    try {
      upsertMetaDirectiveInFile(
        filePath,
        {
          description: update.metaDescription,
          keywords: null,
        },
        {
          allowOverwrite: false,
        }
      );
    } catch (e) {
      console.log(`ERROR: Failed to upsert meta directive: ${update.url}`, e);
    }
  }
}

function resolveFilePath(args: {
  repoPath: string;
  pathPrefix: string;
  url: string;
}) {
  // Files always end in .txt
  // URLs always begin with "https://mongodb.com/docs/"
  // First, look for the file at the url path. If it's not there, look for a directory with an index.txt file.
  // e.g. for {
  //   url: "https://mongodb.com/docs/manual/core/foo/bar/",
  //   pathPrefix: "manual/core",
  // }
  // The file is either at:
  // - {repoPath}/source/foo/bar.txt
  // - {repoPath}/source/foo/bar/index.txt
  // Or does not exist - return null for this case.
  // Otherwise, return the file path.
  const urlPath = args.url
    // Remove the base URL and path prefix (if it exists)
    .replace(
      `https://mongodb.com/docs/${
        args.pathPrefix ? args.pathPrefix + "/" : ""
      }`,
      ""
    )
    // Remove "/current" from the start if it exists
    .replace(/^current/, "")
    // Remove trailing slash
    .replace(/\/$/, "");
  // urlPath has the form "foo/bar"
  const coreFilePath = path.join(args.repoPath, "source", urlPath);
  const txtFilePath = coreFilePath + ".txt";
  const dirIndexFilePath = path.join(coreFilePath, "index.txt");
  console.log(
    JSON.stringify(
      {
        repoPath: args.repoPath,
        coreFilePath,
        txtFilePath,
        dirIndexFilePath,
      },
      null,
      2
    )
  );
  if (fs.existsSync(txtFilePath)) {
    return txtFilePath;
  }
  if (fs.existsSync(dirIndexFilePath)) {
    return dirIndexFilePath;
  }
  return null;
}
