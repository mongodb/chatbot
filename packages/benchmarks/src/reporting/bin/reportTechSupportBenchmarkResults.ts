import { reportBenchmarkResults } from "../reportBenchmarkResults";
import { strict as assert } from "assert";
import fs from "fs";
import path from "path";
import "dotenv/config";

async function main() {
  const pathOut = path.join("testData", "tech_support_results.json");

  console.log(`Reporting tech support benchmark results to ${pathOut}`);

  const apiKey = process.env.BRAINTRUST_API_KEY;
  assert(apiKey, "must have BRAINTRUST_API_KEY set");

  const projectName = "tech-support-prompt-completion";

  const cases = await reportBenchmarkResults({
    apiKey,
    projectName,
    experimentType: "prompt_response",
  });
  console.log(`Reported ${cases.length} cases`);
  fs.writeFileSync(pathOut, JSON.stringify(cases, null, 2));
}

main();
