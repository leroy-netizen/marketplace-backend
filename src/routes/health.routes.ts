import { Router, Request, Response } from "express";

export const healthRoutes = Router();

/**
 * Simple health check endpoint
 * Returns 200 OK with minimal response for connectivity testing
 */
healthRoutes.get("/", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", timestamp: Date.now() });
});

/**
 * HEAD request for even lighter connectivity testing
 */
healthRoutes.head("/", (_req: Request, res: Response) => {
  res.status(200).end();
});
