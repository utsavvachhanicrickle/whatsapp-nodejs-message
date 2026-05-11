import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  addContectController,
  deleteContactController,
  getContactController,
  updateContactController,
  addMultipleContactController,
  deleteMultipleContactController
} from "../controllers/contact.controller.js";

const router = express.Router();

router.post("/add", authMiddleware, addContectController);
router.post("/bulk-upload", authMiddleware, addMultipleContactController);
router.post("/bulk-delete", authMiddleware, deleteMultipleContactController);

router.get("/get-all", authMiddleware, getContactController);
router.put("/update/:id", authMiddleware, updateContactController);
router.delete("/delete/:id", authMiddleware, deleteContactController);

export default router;
