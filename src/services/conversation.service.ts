import { AppDataSource } from "../config/db.config";
import { Conversation, User } from "../entities";
import logger from "../utils/logger";

export const findOrCreateConversation = async (
  userId: string,
  participantId: string
) => {
  try {
    if (userId !== participantId) {
      throw new Error("You cannot start a conversation with yourself");
    }

    const userRepo = AppDataSource.getRepository(User);
    const convoRepo = AppDataSource.getRepository(Conversation);

    const [user, participant] = await Promise.all([
      userRepo.findOneByOrFail({ id: userId }),
      convoRepo.findOneByOrFail({ id: participantId }),
    ]);

    let conversation = await convoRepo.findOne({
      where: [
        { participantOne: user, participantTwo: participant },
        { participantOne: participant, participantTwo: user },
      ],
    });
    if (!conversation) {
      conversation = convoRepo.create({
        participantOne: user,
        participantTwo: participant,
      });
      await convoRepo.save(conversation);
    }

    return conversation;
  } catch (error) {
    logger.error("Error in findOrCreateConversation:", {
      error,
    });
    throw new Error(
      error instanceof Error ? error.message : "An unexpected error occurred"
    );
  }
};

export const getUserConversations = async (userId: string) => {
  const convoRepo = AppDataSource.getRepository(Conversation);
  return convoRepo.find({
    where: [
      { participantOne: { id: userId } },
      { participantTwo: { id: userId } },
    ],
    order: { updatedAt: "DESC" },
  });
};
