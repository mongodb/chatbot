import {
  operators,
  representationInDatasetByCommonality,
} from "./queryOperators";
import { DatabaseNlQueryDatasetEntry } from "./DatabaseNlQueryDatasetEntry";

export function countAndLogUsage(entries: DatabaseNlQueryDatasetEntry[]): void {
  // Count and log methods usage
  console.log("Total number of entries in dataset:", entries.length);

  console.log("Queries by dataset:");
  const dbEntryCount = countStringProperty(entries, "databaseName");
  console.log("DB entry count:", dbEntryCount);
  console.log(
    "DB entry percentages:",
    calculatePercentages(dbEntryCount, entries.length)
  );

  console.log("Queries by complexities:");
  const complexityCount = countStringProperty(entries, "complexity");
  console.log("Complexity count:", complexityCount);
  console.log(
    "Complexity percentages:",
    calculatePercentages(complexityCount, entries.length)
  );

  const methodCounts = countUsage(entries, "methods");
  console.log("Method counts:", methodCounts);
  console.log(
    "Method percentages:",
    calculatePercentages(methodCounts, entries.length)
  );

  // Count and log query operators usage
  const operatorCounts = countUsage(entries, "queryOperators");

  console.log("Query operator counts:", operatorCounts);
  const operatorPercentages = calculatePercentages(
    operatorCounts,
    entries.length
  );
  console.log("Query operator percentages:", operatorPercentages);

  // Check if the operator frequencies are within bounds
  const operatorFrequency = checkOperatorFrequency(operatorPercentages);
  const operatorFrequencyEntries = Object.entries(operatorFrequency).map(
    ([operator, freq]) => ({ operator, ...freq })
  );
  console.log("Operators below minimum:");
  console.table(
    operatorFrequencyEntries.filter((v) => v.label === "below_minimum")
  );
  console.log("Operators above maximum:");
  console.table(
    operatorFrequencyEntries.filter((v) => v.label === "above_maximum")
  );
  console.log("Operators within bounds:");
  console.table(
    operatorFrequencyEntries.filter((v) => v.label === "within_bounds")
  );
  console.log("Operators not specified:");
  console.table(
    operatorFrequencyEntries.filter((v) => v.label === "not_specified")
  );
}

export function countStringProperty<
  T extends Record<K, string>,
  K extends string
>(entries: T[], property: K): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const entry of entries) {
    const value = entry[property] || "";
    if (!counts[value]) {
      counts[value] = 0;
    }
    counts[value]++;
  }

  return counts;
}

export function countUsage(
  entries: DatabaseNlQueryDatasetEntry[],
  property: "methods" | "queryOperators"
): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const entry of entries) {
    const items = entry[property] || [];
    for (const item of items) {
      if (!counts[item]) {
        counts[item] = 0;
      }
      counts[item]++;
    }
  }

  return counts;
}

export function checkOperatorFrequency(
  operatorPercentages: Record<string, number>,
  operatorsByFrequency = operators,
  representationInDataset = representationInDatasetByCommonality
) {
  const operatorsBoundCheck: Record<
    string,
    {
      actual: number;
      min: number | null;
      max: number | null;
      label:
        | "below_minimum"
        | "above_maximum"
        | "within_bounds"
        | "not_specified";
    }
  > = {};

  // Check each operator
  for (const [operator, percentage] of Object.entries(operatorPercentages)) {
    // Check if the operator is defined in our frequency list
    if (!(operator in operatorsByFrequency)) {
      operatorsBoundCheck[operator] = {
        actual: percentage,
        min: null,
        max: null,
        label: "not_specified",
      };
      continue;
    }

    // Get the frequency of the operator
    const frequency = operatorsByFrequency[operator];

    // Get the minimum representation for this frequency
    const [minRepresentation, maxRepresentation] =
      representationInDataset[frequency];

    // Check if the operator is below its minimum representation
    if (percentage < minRepresentation) {
      operatorsBoundCheck[operator] = {
        actual: percentage,
        min: minRepresentation,
        max: maxRepresentation,
        label: "below_minimum",
      };
    } else if (percentage > maxRepresentation) {
      operatorsBoundCheck[operator] = {
        actual: percentage,
        min: minRepresentation,
        max: maxRepresentation,
        label: "above_maximum",
      };
    } else if (
      percentage >= minRepresentation &&
      percentage <= maxRepresentation
    ) {
      operatorsBoundCheck[operator] = {
        actual: percentage,
        min: minRepresentation,
        max: maxRepresentation,
        label: "within_bounds",
      };
    }
  }

  return operatorsBoundCheck;
}

export function calculatePercentages(
  counts: Record<string, number>,
  totalQueries: number
): Record<string, number> {
  const percentages: Record<string, number> = {};

  for (const [key, count] of Object.entries(counts)) {
    percentages[key] = count / totalQueries;
  }

  return percentages;
}
