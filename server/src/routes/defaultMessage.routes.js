import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  addDefaultMessageController,
  getDefaultMessagesController,
  updateDefaultMessageController,
  deleteDefaultMessageController,
} from "../controllers/defaultMessage.controller.js";

const router = express.Router();

router.post("/add", authMiddleware, addDefaultMessageController);
router.get("/get-all", authMiddleware, getDefaultMessagesController);
router.put("/update/:id", authMiddleware, updateDefaultMessageController);
router.delete("/delete/:id", authMiddleware, deleteDefaultMessageController);

export default router;
