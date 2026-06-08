import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  getDefaultKeywordsMessagesController,
  addDefaultKeywordsMessageController,
  updateDefaultKeywordMessageController,
  deleteDefaultKeywordMessageController,
  starDefaultKeywordMessageController
} from "../controllers/defaultKeywordsMessages.controller.js"
const router = express.Router();

router.get("/sessionId/:sessionId", authMiddleware, getDefaultKeywordsMessagesController);
router.post(
  "/sessionId/:sessionId/add",
  authMiddleware,
  addDefaultKeywordsMessageController,
);
router.put("/sessionId/:sessionId/update/:id", authMiddleware, updateDefaultKeywordMessageController);
router.delete(
  "/sessionId/:sessionId/delete/:id",
  authMiddleware,
  deleteDefaultKeywordMessageController,
);
router.put(
  "/sessionId/:sessionId/star/:id",
  authMiddleware,
  starDefaultKeywordMessageController
)

export default router;
