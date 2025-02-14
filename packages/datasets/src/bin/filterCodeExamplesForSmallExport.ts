/**
  @fileoverview Filter the generated code examples + prompts for only those we'll export to partner orgs.
 */
import fs from "fs";
import path from "path";
import { AugmentedAstExtractedCodeblock } from "../AstExtractedCodeBlock.js";
import "dotenv/config";
import yaml from "yaml";

// URLs that we are forbidden from exporting for training
const forbiddenUrls = new Set([
  "https://mongodb.com/docs/manual/reference/mongodb-wire-protocol/",
  "https://mongodb.com/docs/manual/core/read-preference-mechanics/",
  "https://mongodb.com/docs/manual/reference/replica-set-protocol-versions/",
  "https://mongodb.com/docs/manual/core/wiredtiger/",
  "https://mongodb.com/docs/manual/core/journaling/",
  "https://mongodb.com/docs/manual/core/security-encryption-at-rest/",
  "https://mongodb.com/docs/manual/reference/server-sessions/",
  "https://mongodb.com/docs/manual/core/index-creation/",
  "https://mongodb.com/docs/manual/core/distributed-queries/",
  "https://mongodb.com/docs/manual/core/read-isolation-consistency-recency/",
  "https://mongodb.com/docs/manual/core/query-plans/",
  "https://mongodb.com/docs/manual/core/timeseries/timeseries-compression/",
  "https://mongodb.com/docs/manual/core/replica-set-elections/",
  "https://mongodb.com/docs/manual/core/replica-set-rollbacks/",
]);
async function main(): Promise<void> {
  const basePath = path.resolve("data");
  const codeExamplesPath1 = path.resolve(
    basePath,
    "docs-chatbot.code-examples-with-prompts-all-1713802102876.yaml"
  );
  const codeExamplesPath2 = path.resolve(
    basePath,
    "docs-chatbot.code-examples-with-prompts-all-1716234694210.yaml"
  );
  const codeExamples1 = yaml.parse(
    fs.readFileSync(codeExamplesPath1, "utf-8")
  ) as AugmentedAstExtractedCodeblock[];
  const codeExamples2 = yaml.parse(
    fs.readFileSync(codeExamplesPath2, "utf-8")
  ) as AugmentedAstExtractedCodeblock[];
  const codeExamples = codeExamples1.concat(codeExamples2);

  console.log(`Loaded ${codeExamples.length} code examples`);
  const includedSources = new Set([
    "snooty-cpp-driver",
    "snooty-kotlin",
    "snooty-csharp",
    "snooty-node",
    "snooty-java",
    "snooty-node",
    "snooty-pymongo",
    "snooty-rust",
    "snooty-laravel",
  ]);
  const filteredCodeExamples = codeExamples
    .filter((example) => {
      return (
        // only included sources
        includedSources.has(example.metadata.sourceName) &&
        // no forbidden URLs
        !forbiddenUrls.has(example.metadata.pageUrl) &&
        // only usage examples or api reference (not CLI commands)
        (example.classification === "usage_example" ||
          example.classification === "api_reference") &&
        // only examples with a defined programming language
        example.programmingLanguage &&
        // somewhat arbitrary heuristic to get total number to less than 1000
        example.code.length > 204
        // ||
        //   example.classification === 'cli_command'
      );
    })
    .map((example) => {
      delete example.metadata.mdastNode;
      return example;
    });
  console.log(`Filtered down to ${filteredCodeExamples.length} code examples`);

  const pathOut = path.resolve(
    basePath,
    `docs-chatbot.code-examples-with-prompts-filtered-small-for-export-${Date.now()}.yaml`
  );

  fs.appendFileSync(pathOut, yaml.stringify(filteredCodeExamples));
}
main();
