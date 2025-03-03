import * as fs from "fs";
import * as path from "path";
import { z } from "zod";
import { currentTimestamp, safeFileName } from "./utils";

export const logLevelSchema = z.enum(["debug", "info", "warn", "error"]);
export type LogLevel = z.infer<typeof logLevelSchema>;

export const logMessageSchema = z.object({
  level: logLevelSchema,
  message: z.string(),
  data: z.unknown().optional(),
  timestamp: z.date(),
});
export type LogMessage = z.infer<typeof logMessageSchema>;

export const loggerSchema = z.object({
  /**
   Log a message with optional data. If outputPath is provided, will also write to file.
   */
  log: z
    .function()
    .args(logLevelSchema, z.string(), z.unknown().optional())
    .returns(z.void().or(z.promise(z.void()))),
  /**
   Get the current log file directory if one is configured
   */
  getLogFileDir: z
    .function()
    .args()
    .returns(z.string().or(z.undefined()))
    .optional(),
  /**
   Get the current log file name if one is configured
   */
  getLogFileName: z
    .function()
    .args()
    .returns(z.string().or(z.undefined()))
    .optional(),
  /**
   Get the current log file path if one is configured
   */
  getLogFilePath: z
    .function()
    .args()
    .returns(z.string().or(z.undefined()))
    .optional(),
});
export type Logger = z.infer<typeof loggerSchema>;

export function createConsoleLogger(): Logger {
  return {
    log: (level: LogLevel, message: string, data?: unknown) => {
      const timestamp = new Date();
      const logMessage = `[${timestamp.toISOString()}] ${level.toUpperCase()}: ${message}`;
      switch (level) {
        case "debug":
          console.debug(logMessage, data);
          break;
        case "info":
          console.info(logMessage, data);
          break;
        case "warn":
          console.warn(logMessage, data);
          break;
        case "error":
          console.error(logMessage, data);
          break;
      }
    },
  };
}

export type FileLoggerArgs = {
  namespace: string;
  outputDir: string;
};

export function createFileLogger(args: FileLoggerArgs): Logger {
  if (args.namespace.length === 0) {
    throw new Error("File logger namespace cannot be an empty string");
  }
  if (args.outputDir.length === 0) {
    throw new Error("File logger output directory cannot be an empty string");
  }

  const filePath = path.join(
    args.outputDir,
    safeFileName(`${args.namespace}-${currentTimestamp()}.jsonl`),
  );

  // Ensure directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return {
    log: async (level: LogLevel, message: string, data?: unknown) => {
      const timestamp = new Date();
      const logMessage = {
        level,
        message,
        data,
        timestamp,
      };
      await fs.promises.appendFile(
        filePath,
        JSON.stringify(logMessage) + "\n",
        "utf8",
      );
    },
    getLogFilePath: () => filePath,
    getLogFileDir: () => dir,
    getLogFileName: () => path.basename(filePath),
  };
}

export function createMultiLogger(loggers: Logger[]): Logger {
  return {
    log: async (level: LogLevel, message: string, data?: unknown) => {
      await Promise.all(
        loggers.map((logger) => logger.log(level, message, data)),
      );
    },
    getLogFilePath: () => {
      for (const logger of loggers) {
        const path = logger.getLogFilePath?.();
        if (path) return path;
      }
      return undefined;
    },
    getLogFileDir: () => {
      for (const logger of loggers) {
        const dir = logger.getLogFileDir?.();
        if (dir) return dir;
      }
      return undefined;
    },
    getLogFileName: () => {
      for (const logger of loggers) {
        const name = logger.getLogFileName?.();
        if (name) return name;
      }
    },
  };
}

export function createConsoleAndFileLogger(
  fileLoggerArgs: FileLoggerArgs,
): Logger {
  return createMultiLogger([
    createConsoleLogger(),
    createFileLogger(fileLoggerArgs),
  ]);
}
