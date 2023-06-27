import { createLogger, transports, format } from "winston";

// Helper function to format JSON message
export const createMessage = (
  message: string,
  requestBody?: any,
  requestId?: string
) => {
  return {
    message,
    requestBody,
    reqId: requestId || null,
  };
};

/**
 * Returns a reusable global logger instance. If no logger exists yet, then
 * a new logger is created
 *
 * @returns logger
 */
const initiateLogger = () => {
  const logger = createLogger({
    transports: [
      new transports.Console({
        format: format.json(),
      }),
    ],
  });

  logger.info("Logger created");

  return logger;
};

export const logger = initiateLogger();
