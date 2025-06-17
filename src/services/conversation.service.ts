import { AppDataSource } from "../config/db.config";
import { Conversation, User } from "../entities";
import logger from "../utils/logger";

export const findOrCreateConversation = async (
  userId: string,
  participantId: string
) => {
  try {
    logger.info("Finding or creating conversation", {
      userId,
      participantId
    });

    if (userId === participantId) {
      logger.warn("User attempted to start conversation with self", { userId });
      throw new Error("You cannot start a conversation with yourself");
    }

    const userRepo = AppDataSource.getRepository(User);
    const convoRepo = AppDataSource.getRepository(Conversation);

    const [user, participant] = await Promise.all([
      userRepo.findOneByOrFail({ id: userId }),
      userRepo.findOneByOrFail({ id: participantId }),
    ]);

    logger.debug("Found both users for conversation", {
      userId: user.id,
      participantId: participant.id
    });

    let conversation = await convoRepo.findOne({
      where: [
        { participantOne: { id: user.id }, participantTwo: { id: participant.id } },
        { participantOne: { id: participant.id }, participantTwo: { id: user.id } },
      ],
    });

    if (!conversation) {
      logger.info("Creating new conversation", {
        userId: user.id,
        participantId: participant.id
      });
      
      conversation = convoRepo.create({
        participantOne: user,
        participantTwo: participant,
      });
      await convoRepo.save(conversation);
    } else {
      logger.info("Found existing conversation", {
        conversationId: conversation.id
      });
    }

    return conversation;
  } catch (error) {
    logger.error("Error in findOrCreateConversation:", {
      error,
      userId,
      participantId
    });
    throw new Error(
      error instanceof Error ? error.message : "An unexpected error occurred"
    );
  }
};

export const getUserConversations = async (userId: string) => {
  logger.info("Getting user conversations", { userId });
  
  try {
    const convoRepo = AppDataSource.getRepository(Conversation);
    const conversations = await convoRepo.find({
      where: [
        { participantOne: { id: userId } },
        { participantTwo: { id: userId } },
      ],
      order: { updatedAt: "DESC" },
    });
    
    logger.info("Retrieved user conversations", {
      userId,
      count: conversations.length
    });
    
    return conversations;
  } catch (error) {
    logger.error("Error getting user conversations", {
      error,
      userId
    });
    throw error;
  }
};
