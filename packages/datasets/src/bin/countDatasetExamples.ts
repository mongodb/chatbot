import fs from "fs";
import path from "path";
import readline from "readline";
import { DatabaseNlQueryDatasetEntry } from "../treeGeneration/databaseNlQueries/DatabaseNlQueryDatasetEntry";
import {
  operators,
  minRepresentationInDatasetByCommonality,
  Frequency,
} from "../treeGeneration/queryOperators";

// Define our extended frequency type to include 'not_defined'
type ExtendedFrequency = Frequency & "not_defined";

const dataOutDir = path.resolve(__dirname, "..", "..", "dataOut");

async function main() {
  const textToMqlOutputPaths = [
    "text_to_mql_sample_mflix_gpt-4o-mini_1742928450949.jsonl",
    "text_to_mql_sample_weatherdata_gpt-4o-mini_1742928450949.jsonl",
    "text_to_mql_sample_supplies_gpt-4o-mini_1742928450949.jsonl",
    "text_to_mql_sample_airbnb_gpt-4o-mini_1742928450949.jsonl",
    "text_to_mql_sample_analytics_gpt-4o-mini_1742928450949.jsonl",
    "text_to_mql_sample_geospatial_gpt-4o-mini_1742928450949.jsonl",
    "text_to_mql_sample_guides_gpt-4o-mini_1742928450949.jsonl",
    "text_to_mql_sample_restaurants_gpt-4o-mini_1742928450949.jsonl",
  ].map((p) => path.resolve(dataOutDir, p));

  const allReferenceAnswers: DatabaseNlQueryDatasetEntry[] = [];
  for (const textToMqlOutputPath of textToMqlOutputPaths) {
    // Use readline interface to read the file line by line instead of loading it all at once
    const fileStream = fs.createReadStream(textToMqlOutputPath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });
    let totalAnsCount = 0;
    const referenceAnswers = [];
    // Count lines as we read them
    for await (const line of rl) {
      totalAnsCount++;
      if (line.trim() && line.includes(`"isReferenceAnswer":true`)) {
        const parsedLine = JSON.parse(line) as DatabaseNlQueryDatasetEntry;
        if (Array.isArray(parsedLine.result)) {
          if (parsedLine.result.length > 0) {
            referenceAnswers.push(parsedLine);
          }
        } else {
          referenceAnswers.push(parsedLine);
        }
      }
    }
    console.log("Processsed dataset:", path.basename(textToMqlOutputPath));
    console.log(`Total answers: ${totalAnsCount}`);
    console.log(`Text to MQL example count: ${referenceAnswers.length}`);
    const complexities = countComplexities(referenceAnswers);
    console.log("Complexities:", complexities);
    allReferenceAnswers.push(...referenceAnswers);
  }
  countAndLogUsage(allReferenceAnswers);
  const allReferenceAnswersPathOut = path.resolve(
    dataOutDir,
    "referenceAnswers.json"
  );
  fs.writeFileSync(
    allReferenceAnswersPathOut,
    JSON.stringify(allReferenceAnswers, null, 2)
  );
  console.log(
    `Wrote ${allReferenceAnswers.length} reference answers to ${allReferenceAnswersPathOut}`
  );
}

function countComplexities(entries: DatabaseNlQueryDatasetEntry[]) {
  return {
    simple: entries.filter((r) => r.complexity === "simple").length,
    moderate: entries.filter((r) => r.complexity === "moderate").length,
    complex: entries.filter((r) => r.complexity === "complex").length,
  };
}

function countAndLogUsage(entries: DatabaseNlQueryDatasetEntry[]): void {
  // Count and log methods usage
  const methodCounts = countUsage(entries, "methods");
  console.log("Method counts:", methodCounts);
  console.log(
    "Method percentages:",
    calculatePercentages(methodCounts, entries.length)
  );

  // Count and log query operators usage
  const operatorCounts = countUsage(entries, "queryOperators");
  console.log("Total number of queries:", entries.length);
  console.log("Query operator counts:", operatorCounts);
  const operatorPercentages = calculatePercentages(
    operatorCounts,
    entries.length
  );
  console.log("Query operator percentages:", operatorPercentages);

  // Check if operators are within bounds
  console.log("\nOperator usage analysis:");
  checkOperatorBounds(operatorPercentages);
  console.log("\nComplexities:", countComplexities(entries));
}

function checkOperatorBounds(
  operatorPercentages: Record<string, number>
): void {
  // Get all operators from both the percentages and the defined operators
  const allOperators = new Set<string>([
    ...Object.keys(operatorPercentages),
    ...Object.keys(operators),
  ]);

  // Create an array of objects for the report
  const report = Array.from(allOperators).map((operator) => {
    const usage = operatorPercentages[operator] || 0;
    const frequency = operators[operator] || null;
    let bounds: [number, number] | null = null;

    if (frequency) {
      bounds = minRepresentationInDatasetByCommonality[frequency];
    }

    let status = "within bounds";
    if (bounds) {
      const [min, max] = bounds;
      if (usage < min) {
        status = `under-represented`;
      } else if (usage > max) {
        status = `over-represented`;
      }
    }

    return {
      operator,
      frequency: frequency || ("not defined" as ExtendedFrequency),
      usage: usage.toFixed(4),
      minBound: bounds ? bounds[0].toFixed(4) : "null",
      maxBound: bounds ? bounds[1].toFixed(4) : "null",
      status,
    };
  });

  // Sort by frequency category and then by operator name
  report.sort((a, b) => {
    // First sort by frequency category (most_common > common > uncommon > not defined)
    const frequencyOrder: { [key in ExtendedFrequency]: number } = {
      most_common: 0,
      common: 1,
      uncommon: 2,
      not_defined: 3,
    };
    const freqCompare =
      (frequencyOrder[a.frequency as ExtendedFrequency] || 3) -
      (frequencyOrder[b.frequency as ExtendedFrequency] || 3);

    if (freqCompare !== 0) return freqCompare;

    // Then sort by status (under-represented > over-represented > within bounds)
    const statusOrder = {
      "under-represented": 0,
      "over-represented": 1,
      "within bounds": 2,
    };
    const statusCompare =
      (statusOrder[a.status as keyof typeof statusOrder] || 2) -
      (statusOrder[b.status as keyof typeof statusOrder] || 2);

    if (statusCompare !== 0) return statusCompare;

    // Finally sort alphabetically by operator name
    return a.operator.localeCompare(b.operator);
  });

  console.table(report);

  // Generate summary statistics
  const underRepresented = report.filter(
    (r) =>
      r.status === "under-represented" &&
      r.frequency !== ("not defined" as ExtendedFrequency)
  );
  const overRepresented = report.filter((r) => r.status === "over-represented");
  const withinBounds = report.filter(
    (r) =>
      r.status === "within bounds" &&
      r.frequency !== ("not defined" as ExtendedFrequency)
  );
  const notDefined = report.filter(
    (r) => r.frequency === ("not defined" as ExtendedFrequency)
  );

  console.log("\nSummary:");
  console.log(`- ${underRepresented.length} operators are under-represented`);
  console.log(`- ${overRepresented.length} operators are over-represented`);
  console.log(`- ${withinBounds.length} operators are within bounds`);
  console.log(
    `- ${notDefined.length} operators are not defined in queryOperators.ts`
  );

  // List over-represented operators
  if (overRepresented.length > 0) {
    console.log("\nOver-represented operators:");
    overRepresented.forEach((op) => {
      console.log(
        `- ${op.operator} (${op.frequency}): ${op.usage} > ${op.maxBound}`
      );
    });
  }

  // List most_common operators that are under-represented
  const criticalUnderRepresented = underRepresented.filter(
    (r) => r.frequency === ("most_common" as ExtendedFrequency)
  );
  if (criticalUnderRepresented.length > 0) {
    console.log("\nCritical under-represented operators (most_common):");
    criticalUnderRepresented.forEach((op) => {
      console.log(`- ${op.operator}: ${op.usage} < ${op.minBound}`);
    });
  }
}

function countUsage(
  entries: DatabaseNlQueryDatasetEntry[],
  property: "methods" | "queryOperators"
): Record<string, number> {
  const counts: Record<string, number> = {};

  // Count how many queries use each operator/method (count only once per query)
  entries.forEach((entry) => {
    const values = entry[property];
    if (Array.isArray(values)) {
      // Use a Set to ensure we only count each unique value once per entry
      const uniqueValues = new Set(values);
      uniqueValues.forEach((value) => {
        counts[value] = (counts[value] || 0) + 1;
      });
    }
  });

  return counts;
}

function calculatePercentages(
  counts: Record<string, number>,
  totalQueries: number
): Record<string, number> {
  // Calculate percentages based on the total number of queries
  // This gives us the percentage of queries that use each operator/method
  if (totalQueries === 0) return {};

  const percentages: Record<string, number> = {};
  Object.entries(counts).forEach(([key, count]) => {
    percentages[key] = Number((count / totalQueries).toFixed(4));
  });

  return percentages;
}

main();
