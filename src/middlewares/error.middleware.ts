import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

// Custom error classes
export class ValidationError extends Error {
  constructor(public errors: Record<string, string>) {
    super("Validation failed");
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends Error {
  constructor(resource = "Resource") {
    super(`${resource} not found`);
    this.name = "NotFoundError";
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Handle different error types
  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: "Validation Error",
      details: err.errors,
    });
  }

  if (err instanceof UnauthorizedError) {
    return res.status(401).json({
      error: "Unauthorized",
      message: err.message,
    });
  }

  if (err instanceof ForbiddenError) {
    return res.status(403).json({
      error: "Forbidden",
      message: err.message,
    });
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({
      error: "Not Found",
      message: err.message,
    });
  }

  // Default to 500 server error
  return res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "production"
      ? "An unexpected error occurred"
      : err.message,
  });
};