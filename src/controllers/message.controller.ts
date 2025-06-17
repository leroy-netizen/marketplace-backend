import { Response } from "express";

import {
  sendMessage,
  getConversationMessages,
  deleteMessageForUser,
  deleteMessageForEveryone,
  markMessageAsRead,
} from "../services/message.service";
import { Auth } from "typeorm";
import { AuthenticatedRequest } from "../types";

export const createMessage = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const senderId = req.user!.id;
  const { conversationId, content } = req.body;

  const message = await sendMessage(conversationId, senderId, content);
  res.status(201).json(message);
};

export const fetchMessages = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user!.id;
  const { conversationId } = req.params;
  const messages = await getConversationMessages(conversationId, userId);
  res.status(200).json(messages);
};

export const removeMessageForUser = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user!.id;
  const { messageId } = req.params;

  const message = await deleteMessageForUser(messageId, userId);
  res.status(200).json({ message: "Deleted for user", data: message });
};

export const removeMessageForEveryone = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const senderId = req.user!.id;
  const { messageId } = req.params;

  const message = await deleteMessageForEveryone(messageId, senderId);
  res.status(200).json({ message: "Deleted for everyone", data: message });
};

export const readMessage = async (req: AuthenticatedRequest, res: Response) => {
  const { messageId } = req.params;

  const updated = await markMessageAsRead(messageId);
  res.status(200).json(updated);
};
