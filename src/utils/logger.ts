import { createLogger, format, transports } from "winston";
import 'winston-daily-rotate-file';
import path from 'path';

// Create logs directory if it doesn't exist
import fs from 'fs';
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Custom format for structured logging
const logFormat = format.printf(({ level, message, timestamp, ...metadata }) => {
  const metaString = Object.keys(metadata).length 
    ? `\n${JSON.stringify(metadata, null, 2)}` 
    : '';
  return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaString}`;
});

// File transport with rotation
const fileRotateTransport = new transports.DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d', // Keep logs for 14 days
  maxSize: '20m',  // Rotate when file reaches 20MB
});

// Error-specific rotating file transport
const errorFileRotateTransport = new transports.DailyRotateFile({
  filename: 'logs/error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d',
  maxSize: '20m',
  level: 'error',
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'marketplace-api' },
  transports: [
    // Console transport with colorized output
    new transports.Console({
      format: format.combine(
        format.colorize(),
        logFormat
      )
    }),
    // Rotating file transports
    fileRotateTransport,
    errorFileRotateTransport
  ],
});

// Export helper methods for consistent logging
export default {
  info: (message: string, meta = {}) => logger.info(message, meta),
  warn: (message: string, meta = {}) => logger.warn(message, meta),
  error: (message: string, meta = {}) => logger.error(message, meta),
  debug: (message: string, meta = {}) => logger.debug(message, meta),
  http: (message: string, meta = {}) => logger.http(message, meta)
};
