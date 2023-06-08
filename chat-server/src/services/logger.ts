import { createLogger, Logger, transports, format } from 'winston';

// Acts as global logger object as long as it's created by `initiaLogger` funciton
let logger: Logger | null = null;

// Helper function to format JSON message
export const createMessage = (message: string, requestId?: string) => {
  return {
    message,
    reqId: requestId || null,
  };
};

/**
 * Returns a reusable global logger instance. If no logger exists yet, then
 * a new logger is created
 *
 * @returns logger
 */
export const initiateLogger = () => {
  // Reuse global logger
  if (logger) {
    return logger;
  }

  logger = createLogger({
    transports: [
      new transports.Console({
        format: format.json(),
      }),
    ],
  });

  logger.info('Logger created');

  return logger;
};
