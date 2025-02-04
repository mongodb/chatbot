import * as fs from "fs";
import * as path from "path";
import { z } from "zod";

export type LogLevel = "debug" | "info" | "warn" | "error";

export const logLevelSchema = z.enum(["debug", "info", "warn", "error"]);

export type LogMessage = {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: Date;
};

export type Logger = {
  /**
   Log a message with optional data. If outputPath is provided, will also write to file.
   */
  log: (level: LogLevel, message: string, data?: unknown) => Promise<void>;
  /**
   Get the current log file path if one is configured
   */
  getOutputPath?: () => string | undefined;
};

export function createConsoleLogger(): Logger {
  return {
    log: async (level: LogLevel, message: string, data?: unknown) => {
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
        timestamp,
        message,
        data,
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
