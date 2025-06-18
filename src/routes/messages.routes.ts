import express from "express";
import {
  createMessage,
  fetchMessages,
  removeMessageForUser,
  removeMessageForEveryone,
  readMessage,
} from "../controllers";
import { authenticate } from "../middlewares/auth.middleware";
import logger from "../utils/logger";

export const messageRoutes = express.Router();

// Apply authentication middleware to all message routes
messageRoutes.use(authenticate);

// Log all requests to message routes
messageRoutes.use((req, res, next) => {
  logger.debug("Message route accessed", {
    path: req.path,
    method: req.method,
    userId: (req as any).user?.id,
  });
  next();
});

messageRoutes.post("/", createMessage);
messageRoutes.get("/:conversationId", fetchMessages);
messageRoutes.delete("/:messageId/user", removeMessageForUser);
//@ts-ignore
messageRoutes.delete("/:messageId/everyone", removeMessageForEveryone);
messageRoutes.patch("/:messageId/read", readMessage);
