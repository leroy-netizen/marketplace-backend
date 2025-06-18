# Error Handling and Logging

## Error Handling Strategy

The application implements a centralized error handling approach using Express middleware:

```typescript
// Global error handler middleware
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

  // Handle specific error types
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
```

## Custom Error Classes

The application defines custom error classes for different error scenarios:

```typescript
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
```

## Try-Catch Pattern

Controllers use async/await with try-catch blocks for error handling:

```typescript
export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);
    
    if (!product) {
      throw new NotFoundError("Product");
    }
    
    return res.json(product);
  } catch (error) {
    next(error);
  }
};
```

## Logging System

The application uses Winston for structured logging:

```typescript
import winston from "winston";

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({ 
      filename: "logs/error.log", 
      level: "error" 
    }),
    new winston.transports.File({ 
      filename: "logs/combined.log" 
    }),
  ],
});

// Log request middleware
export const logRequest = (req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`, {
    query: req.query,
    params: req.params,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });
  next();
};

// Log unhandled rejections
export const logUnhandledRejection = (reason: any, promise: Promise<any>) => {
  logger.error("Unhandled Rejection", {
    reason,
    promise,
  });
};

// Log uncaught exceptions
export const logUncaughtException = (error: Error) => {
  logger.error("Uncaught Exception", {
    message: error.message,
    stack: error.stack,
  });
  process.exit(1);
};
```

## Error Response Format

API errors follow a consistent format:

```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "details": {
    "field1": "Error for field1",
    "field2": "Error for field2"
  }
}
```

## Process-Level Error Handling

The application handles process-level errors to prevent crashes:

```typescript
// Register global error handlers
process.on("unhandledRejection", logUnhandledRejection);
process.on("uncaughtException", logUncaughtException);
```