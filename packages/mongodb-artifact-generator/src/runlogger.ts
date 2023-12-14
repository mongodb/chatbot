import { promises as fs } from "fs";
import { z } from "zod";

export type Artifact = z.infer<typeof ArtifactSchema>;
const ArtifactSchema = z
  .object({
    name: z.string(),
    content: z.string(),
  })
  .describe(
    "An artifact created by the generator. For now this will always be a file."
  );
export const isArtifact = (data: unknown): data is Artifact => {
  return ArtifactSchema.safeParse(data).success;
};
export const asArtifact = (data: unknown): Artifact => {
  return ArtifactSchema.parse(data);
};

export type LogLevel = z.infer<typeof LogLevelSchema>;
const logLevels = ["info", "warning", "error"] as const;
const LogLevelSchema = z
  .enum(logLevels)
  .describe(`The log level. One of [${logLevels.map((l) => `"${l}"`)}].`);

export type LogEntry = z.infer<typeof LogEntrySchema>;
const LogEntrySchema = z.object({
  n: z.string().describe(`The name of the topic the entry belongs to.`),
  l: LogLevelSchema,
  t: z
    .number()
    .describe(
      `The timestamp of the log entry. This is a unix timestamp in milliseconds.`
    ),
  m: z.string().describe(`The message.`),
});
export const isLogEntry = (data: unknown): data is LogEntry => {
  return LogEntrySchema.safeParse(data).success;
};
export const asLogEntry = (data: unknown): LogEntry => {
  return LogEntrySchema.parse(data);
};

function formatLogEntry(entry: LogEntry) {
  return `${entry.t} [${entry.l}] ${entry.n}: ${entry.m}`;
}

export type RunLoggerArgs = {
  topic: string;
};

class RunLogger {
  #entries: LogEntry[] = [];
  #artifacts: Artifact[] = [];
  topic: string;

  constructor(args: RunLoggerArgs) {
    this.topic = args.topic;
  }

  log(level: LogLevel, message: string) {
    this.#entries.push(
      asLogEntry({
        l: level,
        n: this.topic,
        t: Date.now(),
        m: message,
      })
    );
  }
  logInfo(message: string) {
    this.log("info", message);
  }
  logWarning(message: string) {
    this.log("warning", message);
  }
  logError(message: string) {
    this.log("error", message);
  }

  async flushLogs(logFlushHandler: LogFlushHandler = defaultFlushLogs) {
    if (this.#entries.length === 0) {
      return; // No entries to flush
    }

    try {
      await logFlushHandler(this.#entries);
      this.#entries = []; // Clear the entries after successful flush
    } catch (error) {
      console.error("Failed to flush log entries:", error);
    }
  }

  appendArtifact(name: string, content: string) {
    this.#artifacts.push(
      asArtifact({
        name,
        content,
      })
    );
    this.logInfo(`Created artifact: ${name}`);
  }

  async flushArtifacts(
    artifactFlushHandler: ArtifactFlushHandler = defaultFlushArtifacts
  ) {
    if (this.#artifacts.length === 0) {
      return; // No artifacts to flush
    }

    try {
      await artifactFlushHandler(this.#artifacts);
      this.#artifacts = []; // Clear the artifacts after successful flush
    } catch (error) {
      console.error("Failed to flush artifacts:", error);
    }
  }
}

export type LogFlushHandler = (entries: LogEntry[]) => Promise<void>;

export const flushLogsToConsole: LogFlushHandler = async (entries) => {
  for (const entry of entries) {
    console.log(formatLogEntry(entry));
  }
};

export const flushLogsToFile: LogFlushHandler = async (entries) => {
  const filePath = `./runlogs/${Date.now()}.runlog.jsonl`;
  // const content = JSON.stringify(entries, null, 2);
  const content = entries.map((e) => JSON.stringify(e)).join("\n");
  await fs.writeFile(filePath, content, {
    encoding: "utf8",
  });
};

export const defaultFlushLogs: LogFlushHandler = async (logs) => {
  flushLogsToConsole(logs);
  flushLogsToFile(logs);
};

export type ArtifactFlushHandler = (artifacts: Artifact[]) => Promise<void>;

export const flushArtifactsToConsole: ArtifactFlushHandler = async (
  artifacts
) => {
  for (const artifact of artifacts) {
    console.log(artifact);
  }
};

export const flushArtifactsToFile: ArtifactFlushHandler = async (artifacts) => {
  for (const artifact of artifacts) {
    const filePath = `./runlogs/${artifact.name}`;
    await fs.writeFile(filePath, artifact.content, {
      encoding: "utf8",
    });
  }
};

export const defaultFlushArtifacts: ArtifactFlushHandler = async (
  artifacts
) => {
  flushArtifactsToConsole(artifacts);
  flushArtifactsToFile(artifacts);
};

export function makeRunLogger(args: { topic: string }) {
  return new RunLogger(args);
}
