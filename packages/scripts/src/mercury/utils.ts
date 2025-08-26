import path from "path";
import fs from "fs";

export function diffLists<T, ParsedT = T>(list1: T[], list2: T[]): ParsedT[] {
  const set1 = new Set(list1.map((x) => JSON.stringify(x)));
  const set2 = new Set(list2.map((x) => JSON.stringify(x)));
  return [...set1.difference(set2)].map((x) => JSON.parse(x)) as ParsedT[];
}

export function truncateString(str: string, maxLength: number) {
  return str.length > maxLength ? str.substring(0, maxLength - 3) + "..." : str;
}

export type ReferenceAlignmentTag =
  | "Mismatch"
  | "Subset"
  | "Superset"
  | "Match";

export function mapReferenceAlignmentScoreToTag(
  score: number | null
): ReferenceAlignmentTag | null {
  if (score === null) {
    return null;
  }
  switch (score) {
    case 0:
      return "Mismatch";
    case 0.4:
    case 0.75:
      return "Subset";
    case 0.6:
    case 0.8:
    case 0.9:
      return "Superset";
    case 1:
      return "Match";
    default:
      return null;
  }
}

export function createOutputs(args: {
  outputDir: string;
  errors: unknown[];
  results: unknown[];
  skipped: string[];
}) {
  const dir = path.join(args.outputDir, Date.now().toString());
  fs.mkdirSync(dir, { recursive: true });
  const errorsFile = path.join(dir, "errors.json");
  fs.writeFileSync(errorsFile, JSON.stringify(args.errors, null, 2));
  const resultsFile = path.join(dir, "results.json");
  fs.writeFileSync(resultsFile, JSON.stringify(args.results, null, 2));
  const skippedFile = path.join(dir, "skipped.txt");
  fs.writeFileSync(skippedFile, args.skipped.join("\n"));
  return {
    errorsFile,
    resultsFile,
    skippedFile,
  };
}
