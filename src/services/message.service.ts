import { AppDataSource } from "../config/db.config";
import { Message, Conversation, User } from "../entities/";
import logger from "../utils/logger";

export const sendMessage = async (
  conversationId: string,
  senderId: string,
  content: string
) => {
  logger.info("Sending new message", {
    conversationId,
    senderId,
    contentLength: content?.length,
  });

  try {
    const conversationRepo = AppDataSource.getRepository(Conversation);
    const userRepo = AppDataSource.getRepository(User);
    const messageRepo = AppDataSource.getRepository(Message);

    const conversation = await conversationRepo.findOne({
      where: { id: conversationId },
      relations: ["participantOne", "participantTwo"],
    });

    if (!conversation) {
      logger.warn("Conversation not found", { conversationId });
      throw new Error("Conversation not found");
    }

    if (
      conversation.participantOne.id !== senderId &&
      conversation.participantTwo.id !== senderId
    ) {
      logger.warn("Sender not in conversation", {
        senderId,
        conversationId,
        participantOne: conversation.participantOne.id,
        participantTwo: conversation.participantTwo.id,
      });
      throw new Error("Sender is not a participant in this conversation");
    }

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      logger.warn("Empty message content", { senderId, conversationId });
      throw new Error("Message content cannot be empty");
    }

    const sender = await userRepo.findOneByOrFail({ id: senderId });

    const message = messageRepo.create({
      sender,
      conversation,
      content: trimmedContent,
    });

    const savedMessage = await messageRepo.save(message);

    // Update conversation with last message preview
    conversation.lastMessagePreview =
      trimmedContent.substring(0, 50) +
      (trimmedContent.length > 50 ? "..." : "");
    conversation.updatedAt = new Date(); // Force update timestamp
    await conversationRepo.save(conversation);

    logger.info("Message sent successfully", {
      messageId: savedMessage.id,
      conversationId,
      senderId,
    });

    return savedMessage;
  } catch (error) {
    logger.error("Error sending message", {
      error,
      conversationId,
      senderId,
    });
    throw error;
  }
};

export const verifyConversationAccess = async (
  conversationId: string,
  userId: string
) => {
  logger.debug("Verifying conversation access", {
    conversationId,
    userId,
  });

  const conversationRepo = AppDataSource.getRepository(Conversation);
  const conversation = await conversationRepo.findOne({
    where: { id: conversationId },
    relations: ["participantOne", "participantTwo"],
  });

  if (!conversation) {
    logger.warn("Conversation not found during access verification", {
      conversationId,
      userId,
    });
    throw new Error("Conversation not found");
  }

  if (
    conversation.participantOne.id !== userId &&
    conversation.participantTwo.id !== userId
  ) {
    logger.warn("User not authorized to access conversation", {
      userId,
      conversationId,
      participantOne: conversation.participantOne.id,
      participantTwo: conversation.participantTwo.id,
    });
    throw new Error("You are not authorized to access this conversation");
  }

  logger.debug("Conversation access verified successfully", {
    conversationId,
    userId,
  });

  return conversation;
};

export const getConversationMessages = async (
  conversationId: string,
  userId: string
) => {
  logger.info("Getting conversation messages", {
    conversationId,
    userId,
  });

  try {
    // First verify the user has access to this conversation
    await verifyConversationAccess(conversationId, userId);

    const repo = AppDataSource.getRepository(Message);
    const allMessages = await repo.find({
      where: {
        conversation: { id: conversationId },
      },
      order: { createdAt: "ASC" },
    });

    const filteredMessages = allMessages.filter(
      (msg) => !msg.deletedForEveryone && !msg.deletedForUsers.includes(userId)
    );

    logger.info("Retrieved conversation messages", {
      conversationId,
      userId,
      totalCount: allMessages.length,
      visibleCount: filteredMessages.length,
    });

    return filteredMessages;
  } catch (error) {
    logger.error("Error getting conversation messages", {
      error,
      conversationId,
      userId,
    });
    throw error;
  }
};

export const deleteMessageForUser = async (
  messageId: string,
  userId: string
) => {
  logger.info("Deleting message for user", {
    messageId,
    userId,
  });

  try {
    const repo = AppDataSource.getRepository(Message);
    const message = await repo.findOneByOrFail({ id: messageId });

    if (!message.deletedForUsers.includes(userId)) {
      message.deletedForUsers.push(userId);
      await repo.save(message);
      logger.info("Message deleted for user", {
        messageId,
        userId,
      });
    } else {
      logger.info("Message already deleted for user", {
        messageId,
        userId,
      });
    }

    return message;
  } catch (error) {
    logger.error("Error deleting message for user", {
      error,
      messageId,
      userId,
    });
    throw error;
  }
};

export const deleteMessageForEveryone = async (
  messageId: string,
  senderId: string
) => {
  logger.info("Deleting message for everyone", {
    messageId,
    senderId,
  });

  try {
    const repo = AppDataSource.getRepository(Message);
    const message = await repo.findOneByOrFail({ id: messageId });

    if (message.sender.id !== senderId) {
      logger.warn("Unauthorized deletion attempt", {
        messageId,
        senderId,
        actualSenderId: message.sender.id,
      });
      throw new Error("Only sender can delete message for everyone.");
    }

    message.deletedForEveryone = true;
    const updatedMessage = await repo.save(message);

    logger.info("Message deleted for everyone", {
      messageId,
      senderId,
    });

    return updatedMessage;
  } catch (error) {
    logger.error("Error deleting message for everyone", {
      error,
      messageId,
      senderId,
    });
    throw error;
  }
};

export const markMessageAsRead = async (messageId: string) => {
  logger.info("Marking message as read", { messageId });

  try {
    const repo = AppDataSource.getRepository(Message);
    const message = await repo.findOneByOrFail({ id: messageId });

    if (!message.isRead) {
      message.isRead = true;
      await repo.save(message);
      logger.info("Message marked as read", { messageId });
    } else {
      logger.info("Message already marked as read", { messageId });
    }

    return message;
  } catch (error) {
    logger.error("Error marking message as read", {
      error,
      messageId,
    });
    throw error;
  }
};
