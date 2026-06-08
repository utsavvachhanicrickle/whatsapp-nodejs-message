import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  getGroupsController,
  sendMultipleGroupMessageController,
} from "../controllers/group.controller.js";

const router = express.Router();

router.get("/list/:sessionId", authMiddleware, getGroupsController);
router.post(
  "/send/multiples",
  authMiddleware,
  sendMultipleGroupMessageController,
);

export default router;
