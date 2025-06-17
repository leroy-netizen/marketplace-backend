import express from "express";
import {
  createMessage,
  fetchMessages,
  removeMessageForUser,
  removeMessageForEveryone,
  readMessage,
} from "../controllers";
import { authenticate } from "../middlewares/auth.middleware";

export const messageRoutes = express.Router();

messageRoutes.use(authenticate);

messageRoutes.post("/", createMessage);
messageRoutes.get("/:conversationId", fetchMessages);
messageRoutes.delete("/:messageId/user", removeMessageForUser);
messageRoutes.delete("/:messageId/everyone", removeMessageForEveryone);
messageRoutes.patch("/:messageId/read", readMessage);
