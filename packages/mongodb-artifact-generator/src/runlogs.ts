import { promises as fs } from "fs";

export type LogFile = {
  lines: string[];
  append(line: string): void;
  flush(): Promise<void>;
};

export type MakeLogFileArgs = {
  onAppend?(line: string): void;
  onFlush?(lines: string[]): Promise<void>;
};

export function makeLogFile({
  onAppend,
  onFlush = makeFlushToFile({ filePath: `./runlogs/${Date.now()}.runlog.txt` }),
}: MakeLogFileArgs) {
  const lines: string[] = [];

  const append = (line: string) => {
    onAppend?.(line);
    lines.push(...line.split("\n"));
  };

  const flush = async () => {
    await onFlush(lines);
  };

  return {
    lines,
    append,
    flush,
  };
}

async function saveToFile({
  lines,
  filePath,
}: {
  lines: string[];
  filePath: string;
}) {
  const text = lines.join("\n");
  console.log("SAVING TO FILE", filePath, text);
  return await fs.appendFile(filePath, text, {
    encoding: "utf8",
  });
}

export function makeFlushToFile({ filePath }: { filePath: string }) {
  return async (lines: string[]) => {
    await saveToFile({ lines, filePath });
  };
}
