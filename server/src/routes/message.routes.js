import express from "express";
import { messageSendController, multipleMessageSendController } from "../controllers/message.controller.js";

const router = express.Router();

router.post("/send", messageSendController);
router.post("/multiple-send", multipleMessageSendController);

export default router;
