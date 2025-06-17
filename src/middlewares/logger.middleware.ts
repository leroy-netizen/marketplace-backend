import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

// Log every incoming HTTP request
export const logRequest = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const { method, originalUrl, ip } = req;
  const userAgent = req.get("User-Agent") || "unknown";
  
  // Log request received
  logger.http(`Request received: ${method} ${originalUrl}`, {
    ip,
    userAgent,
    query: req.query,
    params: req.params
  });

  // Log response when finished
  res.on("finish", () => {
    const { statusCode } = res;
    const responseTime = Date.now() - startTime;
    
    const logLevel = statusCode >= 400 ? 'warn' : 'http';
    logger[logLevel](`Response sent: ${method} ${originalUrl} ${statusCode}`, {
      statusCode,
      responseTime: `${responseTime}ms`,
      ip,
      userAgent
    });
  });

  next();
};
// Log errors that occur in the application
export const logError = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { method, originalUrl, ip } = req;
  const userAgent = req.get("User-Agent") || "unknown";

  logger.error(`Error processing ${method} ${originalUrl}`, {
    error: err.message,
    stack: err.stack,
    ip,
    userAgent
  });
  
  next(err);
};
// Log unhandled rejections
export const logUnhandledRejection = (reason: any, promise: Promise<any>) => {
  logger.error(`Unhandled Rejection`, {
    reason: reason?.message || reason,
    stack: reason?.stack,
    promise: promise.toString()
  });
  
  // Terminate process after logging (optional)
  process.exit(1);
};
// Log uncaught exceptions
export const logUncaughtException = (error: Error) => {
  logger.error(`Uncaught Exception`, {
    error: error.message,
    stack: error.stack
  });
  
  // Terminate process after logging (optional)
  process.exit(1);
};


