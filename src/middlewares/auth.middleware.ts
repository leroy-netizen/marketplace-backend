import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../types";
import dotenv from "dotenv";

dotenv.config();

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      role: string;
    };

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
    return;
  }
};
export function authRbac(role: "admin") {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    console.log("User role >>:", req.user?.role);
    console.log("Required role >>:", role);
    if (req.user?.role !== role) res.status(403).json({ error: "Forbidden. Only admins can perform this operation" });
    next();
  };
}
