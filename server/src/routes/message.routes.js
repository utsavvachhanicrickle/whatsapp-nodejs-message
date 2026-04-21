import express from "express";
import { messageSendController } from "../controllers/message.controller.js";

const router = express.Router();

router.post("/send", messageSendController);
export default router;
