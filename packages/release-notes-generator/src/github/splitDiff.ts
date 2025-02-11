export type SplitDiffResult = {
  fileName: string;
  diff: string;
};

export function splitDiff(diff: string): SplitDiffResult[] {
  // Split the diff into parts for each file
  const parts = diff.split("diff --git");

  // Remove the first item if it's empty (it will be if the file starts with 'diff --git')
  if (parts[0].trim() === "") {
    parts.shift();
  }

  return parts.map((part, index) => {
    // Extract the filename
    const lines = part.split("\n");
    const filenameLine = lines[0]; // This is usually the first line after 'diff --git'
    const filenames = filenameLine.split(" b/"); // Split on ' b/' to get the new filename

    const fileName =
      filenames.length > 1 ? filenames[1].trim() : `file_${index + 1}`;

    if (!part.endsWith("\n")) {
      part += "\n";
    }
    return {
      fileName,
      diff: `diff --git${part}`,
    };
  });
}
