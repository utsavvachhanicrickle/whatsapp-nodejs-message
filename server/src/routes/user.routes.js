import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  addUser,
  getAllUsers,
  removeUser,
  signUpController,
  loginController,
  logoutController,
  refreshTokenController,
} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/signup", signUpController);
router.post("/login", loginController);
router.delete("/logout", authMiddleware, logoutController);
router.get("/refresh", refreshTokenController);

router.post("/add", authMiddleware, addUser);
router.get("/getAllUsers", authMiddleware, getAllUsers);
router.delete("/remove/:phone", authMiddleware, removeUser);

export default router;
