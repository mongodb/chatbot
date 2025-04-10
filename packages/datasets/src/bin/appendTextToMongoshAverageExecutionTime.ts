import path from "path";
import fs from "fs";
import PromisePool from "@supercharge/promise-pool";
import { executeMongoshQuery } from "mongodb-rag-core/executeCode";
import { z } from "zod";
import { assertEnvVars } from "mongodb-rag-core";
import { DATABASE_NL_QUERIES } from "../EnvVars";
const TextToMongoshEvalResult = z.object({
  input: z.object({
    databaseName: z.string(),
    nlQuery: z.string(),
  }),
  tags: z.array(z.string()).optional(),
  metadata: z
    .object({
      complexity: z.string(),
      generationUuid: z.string().optional(),
      language: z.string().optional(),
      methods: z.array(z.string()).optional(),
      queryOperators: z.array(z.string()).optional(),
    })
    .nullable(),
  expected: z.object({
    dbQuery: z.string(),
    result: z.any(),
    executionTimeMs: z.number().nullable().optional(),
  }),
});

type TextToMongoshEvalResult = z.infer<typeof TextToMongoshEvalResult>;

const SAMPLE_NUM_EXECUTIONS = 10;

async function main() {
  const { MONGODB_TEXT_TO_CODE_CONNECTION_URI } =
    assertEnvVars(DATABASE_NL_QUERIES);
  const dataOutDir = path.resolve(__dirname, "..", "..", "dataOut");
  const pathToFile = path.join(
    dataOutDir,
    "atlas_sample_data_benchmark_gpt-4o_filtered.json"
  );
  const pathOut = path.join(
    dataOutDir,
    "atlas_sample_data_benchmark_gpt-4o_filtered_with_execution_time.json"
  );
  const fileContent = fs.readFileSync(pathToFile, "utf-8");
  const dataset = TextToMongoshEvalResult.array().parse(
    JSON.parse(fileContent)
  );

  await PromisePool.for(dataset)
    .withConcurrency(1)
    .process(async (entry) => {
      const {
        input: { databaseName, nlQuery },
        expected: { dbQuery },
      } = entry;
      console.log("processing query", nlQuery, "for db", databaseName, "...");
      // refactor w/ promise.all
      const executionResults = [];
      for (const _execution of Array.from(
        { length: SAMPLE_NUM_EXECUTIONS },
        (_, i) => i
      )) {
        console.log("Executing execution", _execution + 1);
        const executionResult = await executeMongoshQuery({
          databaseName,
          query: dbQuery,
          uri: MONGODB_TEXT_TO_CODE_CONNECTION_URI,
        });

        executionResults.push(executionResult);
      }

      console.log(executionResults);
      const validExecutionResults = executionResults.filter(
        (result) => result.executionTimeMs !== null
      );
      const averageExecutionTime =
        validExecutionResults.reduce(
          (acc, result) => acc + (result.executionTimeMs ?? 0),
          0
        ) / validExecutionResults.length;
      entry.expected.executionTimeMs = averageExecutionTime;
    });
  console.log(`Total number of queries: ${dataset.length}`);
  console.log(`Writing to ${pathOut}`);
  fs.writeFileSync(pathOut, JSON.stringify(dataset, null, 2));
}
main();
