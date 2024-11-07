import {
  createConfiguredAction,
  withConfig,
  withConfigOptions,
} from "../withConfig";
import { createCommand } from "../createCommand";
import { makeRunLogger, type RunLogger } from "../runlogger";
import { parse as parseCsv } from "papaparse";
import { promises as fs } from "fs";
import path from "path";

import { action as translateCodeAction } from "./translateCode";
import { ObjectId } from "mongodb-rag-core/mongodb";

let logger: RunLogger;

type ParseDriversCsvCommandArgs = {
  runId?: string;
  csv: string;
  repoPath: string;
  targetDescription: string;
  targetCodeFileExtension: string;
};

export default createCommand<ParseDriversCsvCommandArgs>({
  command: "parseDriversCsv",
  builder(args) {
    return withConfigOptions(args)
      .option("runId", {
        type: "string",
        demandOption: false,
        description: "A unique identifier for this run.",
      })
      .option("csv", {
        type: "string",
        demandOption: true,
        description: "Path to the CSV",
      })
      .option("repoPath", {
        type: "string",
        demandOption: true,
        description: "Path to the local drivers repo with source assets",
      })
      .option("targetDescription", {
        type: "string",
        demandOption: true,
        description: "A text description of the desired output.",
      })
      .option("targetCodeFileExtension", {
        type: "string",
        demandOption: true,
        description: "The file extension to use for the output code files",
      });
  },
  async handler(args) {
    logger = makeRunLogger({ topic: "parseDriversCsv" });
    logger.logInfo(`Running command with args: ${JSON.stringify(args)}`);
    const result = await withConfig(action, args);
    logger.logInfo(`Success`);
    await logger.flushArtifacts();
    await logger.flushLogs();
    return result;
  },
  describe: "Generate a new documentation page based on a prompt.",
});

export const action = createConfiguredAction<ParseDriversCsvCommandArgs>(
  async (
    _config,
    {
      csv,
      repoPath,
      runId = new ObjectId().toHexString(),
      targetDescription,
      targetCodeFileExtension,
    }
  ) => {
    try {
      logger.logInfo(`Setting up...`);
      const csvData = await fs.readFile(csv, "utf8");
      const parsed = parseCsv(csvData, {
        header: true,
      });

      const transformHeaderNames = (csvArray: Record<string, string>[]) => {
        return csvArray.map((csvRecord) => {
          const entries = Object.entries(csvRecord).map(([header, value]) => {
            const newHeader =
              {
                "Node Asset Name": "nodeAssetName",
                "Asset Path": "nodeAssetPath",
                "Asset Type": "assetType",
                "File Rename": "fileRename",
                "Custom Prompt": "customPrompt",
                "Generated Asset": "generatedAsset",
                "Reviewed / Tested by Docs": "reviewedByDocs",
                "Reviewed / Tested by DBX": "reviewedByDbx",
                "Result (Ready to Publish or Failed)": "result",
              }[header] ?? header;
            return [newHeader, value];
          });
          return Object.fromEntries(entries);
        });
      };

      const data = parsed.data as Record<string, string>[];
      const parsedAndNormalized = transformHeaderNames(data);

      const nodeRepoBaseUrl =
        "https://github.com/mongodb/docs-node/blob/master/";

      type RelevantAssetFields = {
        nodeAssetName: string;
        nodeAssetRemotePath: string;
        nodeAssetPathRelativeToSourceRepo: string;
        nodeAssetFullPath: string;
        assetType: string;
        fileRename?: string;
      };
      const relevantAssetFieldsOnly = parsedAndNormalized.map(
        ({ nodeAssetName, nodeAssetPath, assetType, fileRename }) => {
          const nodeAssetPathRelativeToSourceRepo = nodeAssetPath.replace(
            nodeRepoBaseUrl,
            ""
          );

          const nodeAssetFullPath = path.join(
            repoPath,
            nodeAssetPathRelativeToSourceRepo
          );

          const relevantAssetFields: RelevantAssetFields = {
            nodeAssetName,
            nodeAssetRemotePath: nodeAssetPath,
            nodeAssetPathRelativeToSourceRepo,
            nodeAssetFullPath,
            assetType,
            fileRename: fileRename === "" ? undefined : fileRename,
          };
          return relevantAssetFields;
        }
      );

      const { Code: codeExampleAssets } = groupBy(
        relevantAssetFieldsOnly.filter((r) => r !== undefined),
        (asset) => asset.assetType
      );

      const sharedPromptAssertions = [
        "Code should be idiomatic to the target environment and use equivalent methods and functions to those in the source whenever possible.",
        "The output should not contain any non-code text or markdown syntax.",
        "The output should NEVER be wrapped in triple backtick code fences (e.g. ```java, ```Java, ```, etc). Do not add these to any output.",
      ].join(" ");

      for await (const [i, codeExampleAsset] of Object.entries(
        codeExampleAssets
      )) {
        console.log(`Translating[${i}] ${codeExampleAsset.nodeAssetName}`);
        await withConfig(translateCodeAction, {
          runId,
          config: "./build/standardConfig.js",
          source: codeExampleAsset.nodeAssetFullPath,
          targetDescription: targetDescription + " " + sharedPromptAssertions,
          // "Uses the MongoDB Python Driver, PyMongo." + sharedPromptAssertions,
          // "Uses the MongoDB C Driver." + sharedPromptAssertions,
          // "Uses the MongoDB PHP Driver." + sharedPromptAssertions,
          // "Uses the MongoDB PHP Integration for Laravel, laravel-mongodb." + sharedPromptAssertions,
          targetFileExtension: targetCodeFileExtension,
          outputPath: extractPathSubset(
            codeExampleAsset.nodeAssetPathRelativeToSourceRepo
          ),
          outputFilename: codeExampleAsset.fileRename,
        });
      }
      console.log("done!");
    } finally {
      // await cleanupFindContent();
    }
  }
);

function groupBy<T, K extends string | number>(
  array: T[],
  getKey: (item: T) => K
): Record<K, T[]> {
  return array.reduce((accumulator, currentItem) => {
    const key = getKey(currentItem);
    if (!accumulator[key]) {
      accumulator[key] = [];
    }
    accumulator[key].push(currentItem);
    return accumulator;
  }, {} as Record<K, T[]>);
}

function extractPathSubset(filePath: string) {
  if (!isValidFilePath(filePath)) {
    throw new Error(`Invalid file path: ${filePath}`);
  }
  return filePath
    .replace(/^source\/code-snippets\//, "")
    .replace(/\/[^/]*$/, "/");
}

function isValidFilePath(filePath: string) {
  try {
    path.parse(filePath);
    return true;
  } catch (e) {
    return false;
  }
}
