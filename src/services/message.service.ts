import { AppDataSource } from "../config/db.config";
import { Message, Conversation, User } from "../entities/";

export const sendMessage = async (
  senderId: string,
  conversationId: string,
  content: string
) => {
  const conversationRepo = AppDataSource.getRepository(Conversation);
  const userRepo = AppDataSource.getRepository(User);
  const messageRepo = AppDataSource.getRepository(Message);

  const conversation = await conversationRepo.findOne({
    where: { id: conversationId },
    relations: ["participantOne", "participantTwo"],
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  if (
    conversation.participantOne.id !== senderId &&
    conversation.participantTwo.id !== senderId
  ) {
    throw new Error("Sender is not a participant in this conversation");
  }

  const trimmedContent = content.trim();
  if (!trimmedContent) {
    throw new Error("Message content cannot be empty");
  }

  const sender = await userRepo.findOneByOrFail({ id: senderId });

  const message = messageRepo.create({
    sender,
    conversation,
    content: trimmedContent,
  });

  return await messageRepo.save(message);
};

export const getConversationMessages = async (
  conversationId: string,
  userId: string
) => {
  const repo = AppDataSource.getRepository(Message);
  const allMessages = await repo.find({
    where: {
      conversation: { id: conversationId },
    },
    order: { createdAt: "ASC" },
  });

  return allMessages.filter(
    (msg) => !msg.deletedForEveryone && !msg.deletedForUsers.includes(userId)
  );
};

export const deleteMessageForUser = async (
  messageId: string,
  userId: string
) => {
  const repo = AppDataSource.getRepository(Message);
  const message = await repo.findOneByOrFail({ id: messageId });

  if (!message.deletedForUsers.includes(userId)) {
    message.deletedForUsers.push(userId);
    await repo.save(message);
  }

  return message;
};

export const deleteMessageForEveryone = async (
  messageId: string,
  senderId: string
) => {
  const repo = AppDataSource.getRepository(Message);
  const message = await repo.findOneByOrFail({ id: messageId });

  if (message.sender.id !== senderId) {
    throw new Error("Only sender can delete message for everyone.");
  }

  message.deletedForEveryone = true;
  return await repo.save(message);
};

export const markMessageAsRead = async (messageId: string) => {
  const repo = AppDataSource.getRepository(Message);
  const message = await repo.findOneByOrFail({ id: messageId });
  message.isRead = true;
  return await repo.save(message);
};
