import express from 'express';
import userRoute from "./user.routes.js"
import messageRoute from "./message.routes.js"

const router = express.Router();

router.use("/user",userRoute)
router.use("/message",messageRoute)

export default router;