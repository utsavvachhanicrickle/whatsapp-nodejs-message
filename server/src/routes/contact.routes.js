import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  addContectController,
  deleteContectController,
  getContectController,
  updateContectController,
  addMultipleContectController,
} from "../controllers/contact.controller.js";

const router = express.Router();

router.post("/add", authMiddleware, addContectController);
router.post(
  "/bulk-upload",
  authMiddleware,
  addMultipleContectController,
);
router.get("/get-all", authMiddleware, getContectController);
router.put("/update/:id", authMiddleware, updateContectController);
router.delete("/delete/:id", authMiddleware, deleteContectController);

export default router;
