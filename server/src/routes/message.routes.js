import express from "express";
import { 
  messageSendController, 
  multipleMessageSendController,
  getMessagesController,
  getContactsWithMessagesController
} from "../controllers/message.controller.js";

const router = express.Router();

router.post("/send", messageSendController);
router.post("/multiple-send", multipleMessageSendController);
router.get("/:sessionId/chats", getContactsWithMessagesController);
router.get("/:sessionId/messages/:contactWhatsappId", getMessagesController);

export default router;
