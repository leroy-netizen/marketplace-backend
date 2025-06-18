import {Router} from "express";
import { authenticate } from "../middlewares/auth.middleware";

import { startConversation, fetchConversations } from "../controllers";

export const conversationRoutes = Router();

conversationRoutes.post("/", authenticate, startConversation);
conversationRoutes.get("/", authenticate, fetchConversations);
// conversationRoutes.get("/:conversationId", authenticate, getConversationById);
// conversationRoutes.patch("/:conversationId", authenticate, updateConversation);
// conversationRoutes.delete("/:conversationId", authenticate, deleteConversation);
// conversationRoutes.post("/:conversationId/messages", authenticate, sendMessage);
// conversationRoutes.get("/:conversationId/messages", authenticate, getMessagesByConversationId);
// conversationRoutes.get("/:conversationId/messages/:messageId", authenticate, getMessageById);