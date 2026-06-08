import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  assignChat,
  getChatAssignment,
  getAssignedChats,
  getChatNotes,
  saveChatNotes,
  getChatNotesUsers
} from "../controllers/assignment.controller.js";

const router = express.Router();

router.post("/assign", authMiddleware, assignChat);
router.get("/assignment/:sessionId/:chatId", authMiddleware, getChatAssignment);
router.get("/assignments/me", authMiddleware, getAssignedChats);
router.get("/notes/:sessionId/:chatId", authMiddleware, getChatNotes);
router.get("/notes/users/:sessionId/:chatId", authMiddleware, getChatNotesUsers);
router.post("/notes", authMiddleware, saveChatNotes);

export default router;
