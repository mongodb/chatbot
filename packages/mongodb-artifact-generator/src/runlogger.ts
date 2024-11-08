import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";
import { createRunId } from "./runId";
import { ObjectId } from "mongodb-rag-core/mongodb";

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
  runId?: string;
  topic: string;
};

export function makeRunLogger(args: RunLoggerArgs) {
  return new RunLogger(args);
}

export class RunLogger {
  #entries: LogEntry[] = [];
  #artifacts: Artifact[] = [];
  #runId: string;
  topic: string;

  constructor(args: RunLoggerArgs) {
    this.#runId = args.runId ?? createRunId();
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
      await logFlushHandler(this.#entries, {
        topic: this.topic,
        runId: this.#runId,
      });
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
      await artifactFlushHandler(this.#artifacts, {
        topic: this.topic,
        runId: this.#runId,
      });
      this.#artifacts = []; // Clear the artifacts after successful flush
    } catch (error) {
      console.error("Failed to flush artifacts:", error);
    }
  }
}

export type FlushOptions = { topic?: string; runId?: string };

export type LogFlushHandler = (
  entries: LogEntry[],
  options?: FlushOptions
) => Promise<void>;

export const flushLogsToConsole: LogFlushHandler = async (entries) => {
  for (const entry of entries) {
    console.log(formatLogEntry(entry));
  }
};

export const flushLogsToFile: LogFlushHandler = async (
  entries,
  options = createDefaultFlushOptions()
) => {
  await assertFlushDirectory(options);
  const oid = new ObjectId().toHexString();
  const filePath = path.join(
    getFlushDirectoryPath(options),
    `runlog-${oid}.jsonl`
  );
  const content = entries.map((e) => JSON.stringify(e)).join("\n");
  await fs.writeFile(filePath, content, {
    encoding: "utf8",
  });
};

export const defaultFlushLogs: LogFlushHandler = async (
  logs,
  optionOverrides
) => {
  const options = {
    ...createDefaultFlushOptions(),
    ...optionOverrides,
  };
  flushLogsToConsole(logs, options);
  flushLogsToFile(logs, options);
};

export type ArtifactFlushHandler = (
  artifacts: Artifact[],
  options?: FlushOptions
) => Promise<void>;

export const flushArtifactsToConsole: ArtifactFlushHandler = async (
  artifacts
) => {
  for (const artifact of artifacts) {
    console.log(artifact);
  }
};

export const flushArtifactsToFile: ArtifactFlushHandler = async (
  artifacts,
  options = createDefaultFlushOptions()
) => {
  await assertFlushDirectory(options);
  for (const artifact of artifacts) {
    const filePath = path.join(getFlushDirectoryPath(options), artifact.name);
    await assertDirectory(path.dirname(filePath));
    await fs.writeFile(filePath, ensureFileEndsWithNewline(artifact.content), {
      encoding: "utf8",
    });
  }
};

export const defaultFlushArtifacts: ArtifactFlushHandler = async (
  artifacts,
  optionOverrides
) => {
  const options = {
    ...createDefaultFlushOptions(),
    ...optionOverrides,
  };
  flushArtifactsToFile(artifacts, options);
};

function createDefaultFlushOptions() {
  return {
    topic: "default",
    runId: new ObjectId().toHexString(),
  };
}

async function assertFlushDirectory({
  topic = "default",
  runId,
}: Partial<FlushOptions> & Pick<FlushOptions, "runId">) {
  return await assertDirectory(getFlushDirectoryPath({ topic, runId }));
}

async function assertDirectory(path: string) {
  return await fs.mkdir(path, {
    recursive: true,
  });
}

function getFlushDirectoryPath(options: FlushOptions) {
  const { topic, runId } = options;
  const dir = `./runlogs/${topic}/${runId}`;
  return dir;
}

function ensureFileEndsWithNewline(fileText: string) {
  return fileText.endsWith("\n") ? fileText : fileText + "\n";
}
