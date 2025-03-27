// This function should remove elements from the dataset so that:
// the balance between complexity is roughly 30% simple, 50% moderate, 20% complex
// all operators are as well represented as reasonably possible

import { DatabaseNlQueryDatasetEntry } from "./databaseNlQueries/DatabaseNlQueryDatasetEntry";

// maintain as much a balance between the different databaseNames as is possible
export function filterExamplesForBalancedDataset(
  records: DatabaseNlQueryDatasetEntry[],
  outputDatasetSize: number
): DatabaseNlQueryDatasetEntry[] {
  if (records.length <= outputDatasetSize) {
    console.log(
      `Dataset already smaller than requested size (${records.length} <= ${outputDatasetSize})`
    );
    return records;
  }

  // Step 1: Group records by complexity
  const byComplexity: Record<string, DatabaseNlQueryDatasetEntry[]> = {
    simple: [],
    moderate: [],
    complex: [],
  };

  // Step 2: Group records by database name
  const databaseNames = new Set<string>();
  const byDatabase: Record<string, DatabaseNlQueryDatasetEntry[]> = {};

  // Step 3: Track operator usage in each record
  const operatorUsageByRecord = new Map<
    DatabaseNlQueryDatasetEntry,
    Set<string>
  >();

  // Populate our groupings and collect metadata
  for (const record of records) {
    // Group by complexity
    if (record.complexity in byComplexity) {
      byComplexity[record.complexity].push(record);
    }

    // Group by database name
    const dbName = record.databaseName;
    databaseNames.add(dbName);
    if (!byDatabase[dbName]) {
      byDatabase[dbName] = [];
    }
    byDatabase[dbName].push(record);

    // Use the queryOperators field from the dataset entry
    const operatorsInRecord = new Set<string>(record.queryOperators || []);
    operatorUsageByRecord.set(record, operatorsInRecord);
  }

  // Calculate target counts for each complexity
  const targetCounts = {
    simple: Math.round(outputDatasetSize * 0.3),
    moderate: Math.round(outputDatasetSize * 0.5),
    complex: Math.round(outputDatasetSize * 0.2),
  };

  // Adjust if the sum doesn't match the target size
  const sumTargets =
    targetCounts.simple + targetCounts.moderate + targetCounts.complex;
  if (sumTargets !== outputDatasetSize) {
    const diff = outputDatasetSize - sumTargets;
    // Add or remove from moderate since it's the largest category
    targetCounts.moderate += diff;
  }

  console.log("Target counts by complexity:", targetCounts);

  // Step 4: Score each record based on operator coverage and database balance
  const recordScores = new Map<DatabaseNlQueryDatasetEntry, number>();

  // Get all unique operators across the dataset
  const allOperators = new Set<string>();
  for (const operatorSet of operatorUsageByRecord.values()) {
    for (const op of operatorSet) {
      allOperators.add(op);
    }
  }

  // Count occurrences of each operator
  const operatorCounts: Record<string, number> = {};
  for (const op of allOperators) {
    operatorCounts[op] = 0;
  }

  for (const operatorSet of operatorUsageByRecord.values()) {
    for (const op of operatorSet) {
      operatorCounts[op]++;
    }
  }

  // Calculate operator rarity score (rarer operators are more valuable)
  const operatorRarityScore: Record<string, number> = {};
  for (const op of allOperators) {
    // Normalize so that rarer operators have higher scores
    operatorRarityScore[op] = 1 / (operatorCounts[op] / records.length);
  }

  // Score each record based on the operators it contains and database representation
  for (const record of records) {
    const operatorsInRecord =
      operatorUsageByRecord.get(record) || new Set<string>();

    // Calculate operator diversity score for this record
    let operatorScore = 0;
    for (const op of operatorsInRecord) {
      operatorScore += operatorRarityScore[op];
    }

    // Calculate database representation score
    // Records from underrepresented databases get higher scores
    const dbRepresentationScore =
      1 / (byDatabase[record.databaseName].length / records.length);

    // Combine scores (weight can be adjusted)
    const totalScore = operatorScore * 0.7 + dbRepresentationScore * 0.3;
    recordScores.set(record, totalScore);
  }

  // Step 5: Select records for each complexity category based on scores
  const selectedRecords: DatabaseNlQueryDatasetEntry[] = [];

  for (const complexity of Object.keys(targetCounts)) {
    const recordsOfComplexity = byComplexity[complexity];
    const targetCount = targetCounts[complexity as keyof typeof targetCounts];

    // Sort records by score (highest first)
    recordsOfComplexity.sort((a, b) => {
      return (recordScores.get(b) || 0) - (recordScores.get(a) || 0);
    });

    // Select top N records based on target count
    const selected = recordsOfComplexity.slice(0, targetCount);
    selectedRecords.push(...selected);

    console.log(
      `Selected ${selected.length}/${targetCount} ${complexity} records`
    );
  }

  // Final check on database distribution
  const finalDbCounts: Record<string, number> = {};
  for (const dbName of databaseNames) {
    finalDbCounts[dbName] = 0;
  }

  for (const record of selectedRecords) {
    finalDbCounts[record.databaseName]++;
  }

  console.log("Database distribution in final dataset:", finalDbCounts);

  // Check operator coverage in final dataset
  const finalOperatorCounts: Record<string, number> = {};
  for (const op of allOperators) {
    finalOperatorCounts[op] = 0;
  }

  for (const record of selectedRecords) {
    const ops = operatorUsageByRecord.get(record) || new Set<string>();
    for (const op of ops) {
      finalOperatorCounts[op]++;
    }
  }

  // Report on operator coverage
  console.log(
    `Operator coverage in final dataset (${selectedRecords.length} records):`
  );
  for (const op of Object.keys(finalOperatorCounts).sort()) {
    const originalPercentage = operatorCounts[op] / records.length;
    const finalPercentage = finalOperatorCounts[op] / selectedRecords.length;
    console.log(
      `  ${op}: ${finalOperatorCounts[op]} (${(finalPercentage * 100).toFixed(
        1
      )}% vs original ${(originalPercentage * 100).toFixed(1)}%)`
    );
  }

  return selectedRecords;
}
