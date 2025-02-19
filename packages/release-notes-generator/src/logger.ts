import * as fs from "fs";
import * as path from "path";
import { z } from "zod";
import { currentTimestamp } from "./utils";

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
   Get the current log file path if one is configured
   */
  getOutputPath: z
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

export function createFileLogger(outputPath: string): Logger {
  // Ensure directory exists
  const dir = path.dirname(outputPath);
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
        outputPath,
        JSON.stringify(logMessage) + "\n",
        "utf8"
      );
    },
    getOutputPath: () => outputPath,
  };
}

export function createMultiLogger(loggers: Logger[]): Logger {
  return {
    log: async (level: LogLevel, message: string, data?: unknown) => {
      await Promise.all(
        loggers.map((logger) => logger.log(level, message, data))
      );
    },
    getOutputPath: () => {
      for (const logger of loggers) {
        const path = logger.getOutputPath?.();
        if (path) return path;
      }
      return undefined;
    },
  };
}

export function createConsoleAndFileLogger(args: {
  namespace: string;
  outputDir: string;
}): Logger {
  if (args.namespace.length === 0) {
    throw new Error("File logger namespace cannot be an empty string");
  }
  if (args.outputDir.length === 0) {
    throw new Error("File logger output directory cannot be an empty string");
  }

  const filePath = path.join(
    args.outputDir,
    `${args.namespace}-${currentTimestamp()}.jsonl`
  );

  return createMultiLogger([createConsoleLogger(), createFileLogger(filePath)]);
}
