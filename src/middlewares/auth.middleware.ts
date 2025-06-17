import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../types";
import dotenv from "dotenv";
import logger from "../utils/logger";

dotenv.config();

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  logger.debug("Authentication attempt", {
    hasAuthHeader: !!authHeader,
    headerStartsWithBearer: authHeader?.startsWith("Bearer ") || false,
    path: req.path,
    method: req.method
  });

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logger.warn("Authentication failed - No token provided", {
      path: req.path,
      method: req.method,
      ip: req.ip
    });
    res.status(401).json({ message: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      role: string;
    };

    logger.debug("Token verified successfully", {
      userId: decoded.id,
      userRole: decoded.role,
      path: req.path
    });

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (err) {
    logger.error("Token verification failed", {
      error: err instanceof Error ? err.message : "Unknown error",
      path: req.path,
      method: req.method,
      ip: req.ip
    });
    res.status(401).json({ message: "Invalid token" });
    return;
  }
};
export function authRbac(role: "admin") {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    logger.debug("RBAC check", {
      userRole: req.user?.role,
      requiredRole: role,
      path: req.path
    });
    
    if (req.user?.role !== role) {
      logger.warn("RBAC authorization failed", {
        userRole: req.user?.role,
        requiredRole: role,
        userId: req.user?.id,
        path: req.path
      });
      return res.status(403).json({ error: "Forbidden. Only admins can perform this operation" });
    }
    next();
  };
}
