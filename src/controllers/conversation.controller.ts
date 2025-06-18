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

  logger.info("Start conversation request", {
    userId,
    participantId
  });

  try {
    const conversation = await findOrCreateConversation(userId, participantId);
    logger.info("Conversation started/found successfully", {
      userId,
      participantId,
      conversationId: conversation.id
    });
    res.status(200).json(conversation);
  } catch (error: any) {
    logger.error("Error starting conversation", {
      userId: req.user?.id,
      participantId,
      error: error.message,
      stack: error.stack,
    });
    res.status(400).json({ message: error.message });
  }
};

export const fetchConversations = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user!.id;
  
  logger.info("Fetch conversations request", { userId });
  
  try {
    const conversations = await getUserConversations(userId);
    logger.info("Conversations fetched successfully", {
      userId,
      count: conversations.length
    });
    res.json(conversations);
  } catch (error: any) {
    logger.error("Error fetching conversations", {
      userId: req.user?.id,
      error: error.message,
      stack: error.stack,
    });
    res
      .status(500)
      .json({ message: "Failed to fetch conversations", error: error.message });
  }
};
