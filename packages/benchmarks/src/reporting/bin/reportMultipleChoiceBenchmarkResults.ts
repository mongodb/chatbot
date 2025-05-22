import { reportBenchmarkResults } from "../reportBenchmarkResults";
import { strict as assert } from "assert";
import fs from "fs";
import path from "path";
import "dotenv/config";
import { BSON } from "mongodb-rag-core/mongodb";
const { EJSON } = BSON;

async function main() {
  const pathOut = path.join(
    __dirname,
    "testData",
    "multiple_choice_results.json"
  );

  console.log(`Reporting multiple choice benchmark results to ${pathOut}`);

  const apiKey = process.env.BRAINTRUST_API_KEY;
  assert(apiKey, "must have BRAINTRUST_API_KEY set");

  const projectName = "mongodb-multiple-choice";

  const cases = await reportBenchmarkResults({
    apiKey,
    projectName,
    experimentType: "multiple_choice",
  });
  console.log(`Reported ${cases.length} cases`);
  fs.writeFileSync(pathOut, EJSON.stringify(cases));
}

main();
