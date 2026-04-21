import express from "express";
import { addUser,getAllUsers, removeUser } from "../controllers/user.controller.js";

const router = express.Router();
router.post("/add", addUser);
router.get("/getAllUsers", getAllUsers);
router.delete("/remove", removeUser);
export default router;
