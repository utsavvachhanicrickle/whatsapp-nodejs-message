import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { addContectController } from "../controllers/contact.controller.js";

const router = express.Router();

router.get("/sessionId/:id", authMiddleware, addContectController);
router.post(
  "/addsessionId/sessionId/:id",
  authMiddleware,
  addContectController,
);
router.put("/sessionId/:id/update/:id", authMiddleware, addContectController);
router.delete(
  "/sessionId/:id/delete/:id",
  authMiddleware,
  addContectController,
);
router.put(
  "/sessionId/:id/star/:id",
  authMiddleware,
  addContectController,
);

export default router;
