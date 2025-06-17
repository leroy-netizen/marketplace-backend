import { Response } from "express";
import {
  findOrCreateConversation,
  getUserConversations,
} from "../services/conversation.service";
import { AuthenticatedRequest } from "../types";
import logger from "../utils/logger";

export const startConversation = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user!.id;
  const { participantId } = req.body;

  try {
    const conversation = await findOrCreateConversation(userId, participantId);
    res.status(200).json(conversation);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
    logger.error("Error fetching conversations", {
      userId: req.user?.id,
      error: error.message,
      stack: error.stack,
    });
  }
};

export const fetchConversations = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user!.id;
    const conversations = await getUserConversations(userId);
    res.json(conversations);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Failed to fetch conversations", error: error.message });
    logger.error("Error fetching conversations", {
      userId: req.user?.id,
      error: error.message,
      stack: error.stack,
    });
  }
};
