import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  getDefaultKeywordsController,
  addDefaultKeywordsController,
  updateDefaultKeywordController,
  deleteDefaultKeywordController
} from "../controllers/defaultKeywords.controller.js"

const router = express.Router();

router.get("/sessionId/:sessionId", authMiddleware, getDefaultKeywordsController);
router.post(
  "/sessionId/:sessionId/add",
  authMiddleware,
  addDefaultKeywordsController,
);
router.put("/sessionId/:sessionId/update/:id", authMiddleware, updateDefaultKeywordController);
router.delete(
  "/sessionId/:sessionId/delete/:id",
  authMiddleware,
  deleteDefaultKeywordController,
);

export default router;
