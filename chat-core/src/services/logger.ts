import { createLogger, transports, format } from "winston";

// Helper function to format JSON message
interface CreateMessageParams {
  message: string;
  requestBody?: any;
  requestId?: string;
  ipAddress?: string;
}
export const createMessage = ({
  message,
  requestBody,
  requestId,
  ipAddress,
}: CreateMessageParams) => {
  return {
    message,
    requestBody,
    requestId,
    ipAddress,
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
