import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  addContectController,
  deleteContectController,
  getContectController,
  updateContectController,
  addMultipleContectController,
  deleteMultipleContactController
} from "../controllers/contact.controller.js";

const router = express.Router();

router.post("/add", authMiddleware, addContectController);
router.post("/bulk-upload", authMiddleware, addMultipleContectController);
router.post("/bulk-delete", authMiddleware, deleteMultipleContactController);

router.get("/get-all", authMiddleware, getContectController);
router.put("/update/:id", authMiddleware, updateContectController);
router.delete("/delete/:id", authMiddleware, deleteContectController);

export default router;
