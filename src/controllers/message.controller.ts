import { Response } from "express";

import {
  sendMessage,
  getConversationMessages,
  deleteMessageForUser,
  deleteMessageForEveryone,
  markMessageAsRead,
} from "../services/message.service";
import { AuthenticatedRequest } from "../types";
import logger from "../utils/logger";

export const createMessage = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const senderId = req.user!.id;
    const { conversationId, content } = req.body;

    logger.info("Create message request", {
      senderId,
      conversationId,
      contentLength: content?.length
    });

    const message = await sendMessage(conversationId, senderId, content);
    
    logger.info("Message created successfully", {
      messageId: message.id,
      senderId,
      conversationId
    });
    
    res.status(201).json(message);
  } catch (error: any) {
    logger.error("Error creating message", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      conversationId: req.body?.conversationId
    });
    
    res.status(400).json({ message: error.message });
  }
};

export const fetchMessages = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user!.id;
    const { conversationId } = req.params;
    
    logger.info("Fetch messages request", {
      userId,
      conversationId
    });

    const messages = await getConversationMessages(conversationId, userId);
    
    logger.info("Messages fetched successfully", {
      userId,
      conversationId,
      messageCount: messages.length
    });
    
    res.status(200).json(messages);
  } catch (error: any) {
    logger.error("Error fetching messages", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      conversationId: req.params.conversationId
    });
    
    res.status(500).json({ 
      message: "Failed to fetch messages", 
      error: error.message 
    });
  }
};

export const removeMessageForUser = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user!.id;
    const { messageId } = req.params;
    
    logger.info("Remove message for user request", {
      userId,
      messageId
    });

    const message = await deleteMessageForUser(messageId, userId);
    
    logger.info("Message removed for user successfully", {
      userId,
      messageId
    });
    
    res.status(200).json({ message: "Deleted for user", data: message });
  } catch (error: any) {
    logger.error("Error removing message for user", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      messageId: req.params.messageId
    });
    
    res.status(error.message.includes("not found") ? 404 : 500).json({ 
      message: "Failed to delete message", 
      error: error.message 
    });
  }
};

export const removeMessageForEveryone = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const senderId = req.user!.id;
    const { messageId } = req.params;
    
    logger.info("Remove message for everyone request", {
      senderId,
      messageId
    });

    const message = await deleteMessageForEveryone(messageId, senderId);
    
    logger.info("Message removed for everyone successfully", {
      senderId,
      messageId
    });
    
    res.status(200).json({ message: "Deleted for everyone", data: message });
  } catch (error: any) {
    logger.error("Error removing message for everyone", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      messageId: req.params.messageId
    });
    
    if (error.message.includes("Only sender")) {
      return res.status(403).json({ 
        message: "Failed to delete message", 
        error: error.message 
      });
    }
    
    res.status(error.message.includes("not found") ? 404 : 500).json({ 
      message: "Failed to delete message", 
      error: error.message 
    });
  }
};

export const readMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { messageId } = req.params;
    
    logger.info("Mark message as read request", {
      userId: req.user!.id,
      messageId
    });

    const updated = await markMessageAsRead(messageId);
    
    logger.info("Message marked as read successfully", {
      userId: req.user!.id,
      messageId
    });
    
    res.status(200).json(updated);
  } catch (error: any) {
    logger.error("Error marking message as read", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      messageId: req.params.messageId
    });
    
    res.status(error.message.includes("not found") ? 404 : 500).json({ 
      message: "Failed to mark message as read", 
      error: error.message 
    });
  }
};
