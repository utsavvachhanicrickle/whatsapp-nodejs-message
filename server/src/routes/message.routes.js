import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { 
  messageSendController, 
  multipleMessageSendController,
  getMessagesController,
  getContactsWithMessagesController
} from "../controllers/message.controller.js";

const router = express.Router();

router.post("/send", authMiddleware, messageSendController);
router.post("/multiple-send", authMiddleware, multipleMessageSendController);
router.get("/:sessionId/chats", authMiddleware, getContactsWithMessagesController);
router.get("/:sessionId/messages/:contactWhatsappId", authMiddleware, getMessagesController);

export default router;
