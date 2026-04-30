import { logDb } from "../db";
import { type LogLevel, logLevels, logs } from "../db/log.schema";
import { env } from "../env";

export class LoggerService {
  /**
   * The category to log the message under.
   */
  private category?: string;

  /**
   * Creates a new LoggerService instance.
   * @param category - The category to log the message under
   */
  constructor({ category }: { category?: string } = {}) {
    this.category = category;
  }

  /**
   * Converts a log level to a number.
   * @param level - The log level to convert
   * @returns The number representation of the log level
   */
  private logLevelToNumber(level: LogLevel) {
    return logLevels.indexOf(level);
  }

  /**
   * Creates a new LoggerService instance with the category set.
   * @param category - The category to log the message under
   * @returns A new LoggerService instance with the category set
   */
  withCategory(category: string) {
    return new LoggerService({ category });
  }

  /**
   * Logs a message to the database.
   * @param level - The log level
   * @param message - The message to log
   * @param data - The data to log
   */
  async log(level: LogLevel, message: string, data?: Record<string, unknown>) {
    // If the log level is higher than the configured log level, don't log
    if (this.logLevelToNumber(env.LOG_LEVEL) > this.logLevelToNumber(level)) {
      return;
    }

    // Insert the log into the database
    await logDb.insert(logs).values({
      timestamp: new Date(),
      level,
      category: this.category,
      message,
      data,
    });
  }

  /**
   * Logs a debug message to the database.
   * @param message - The message to log
   * @param data - The data to log
   */
  async debug(message: string, data?: Record<string, unknown>) {
    return this.log("debug", message, data);
  }

  /**
   * Logs an info message to the database.
   * @param message - The message to log
   * @param data - The data to log
   */
  async info(message: string, data?: Record<string, unknown>) {
    return this.log("info", message, data);
  }

  /**
   * Logs a warning message to the database.
   * @param message - The message to log
   * @param data - The data to log
   */
  async warn(message: string, data?: Record<string, unknown>) {
    return this.log("warn", message, data);
  }

  /**
   * Logs an error message to the database.
   * @param message - The message to log
   * @param data - The data to log
   */
  async error(message: string, data?: Record<string, unknown>) {
    return this.log("error", message, data);
  }
}

const loggerService = new LoggerService();

export { loggerService };

export default loggerService;
