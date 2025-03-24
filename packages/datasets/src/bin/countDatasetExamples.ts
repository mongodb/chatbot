import fs from "fs";
import path from "path";
import readline from "readline";

const dataOutDir = path.resolve(__dirname, "..", "..", "dataOut");

async function main() {
  const textToMqlOutputPath = path.resolve(
    dataOutDir,
    "text_to_mql_sample_mflix_gpt-4o-mini_1742842836412.jsonl"
  );
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
      const parsedLine = JSON.parse(line);
      if (Array.isArray(parsedLine.result)) {
        if (parsedLine.result.length > 0) {
          referenceAnswers.push(parsedLine);
        }
      } else {
        referenceAnswers.push(parsedLine);
      }
    }
  }
  console.log(`Total answers: ${totalAnsCount}`);
  console.log(`Text to MQL example count: ${referenceAnswers.length}`);
  const complexities = {
    simple: referenceAnswers.filter((r) => r.complexity === "simple").length,
    moderate: referenceAnswers.filter((r) => r.complexity === "moderate")
      .length,
    complex: referenceAnswers.filter((r) => r.complexity === "complex").length,
  };
  console.log("Complexities:", complexities);
  const pathOut = path.resolve(dataOutDir, "referenceAnswers.json");
  fs.writeFileSync(pathOut, JSON.stringify(referenceAnswers, null, 2));
  console.log(`Wrote reference answers to ${pathOut}`);
}

main();
