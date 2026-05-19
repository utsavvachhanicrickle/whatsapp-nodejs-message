import express from "express";
import userRoute from "./user.routes.js";
import messageRoute from "./message.routes.js";
import contactRoute from "./contact.routes.js";
import defaultMessageRoute from "./defaultMessage.routes.js";
import defaultKeywordsRoute from "./defaultKeywords.routes.js";
import defaultKeywordsMessagesRoute from "./defaultKeywordsMessages.routes.js";
import groupRoute from "./group.routes.js";

const router = express.Router();

router.use("/user", userRoute);
router.use("/message", messageRoute);
router.use("/contact", contactRoute);
router.use("/default-message", defaultMessageRoute);
router.use("/default-keywords", defaultKeywordsRoute);
router.use("/default-keywords-messages", defaultKeywordsMessagesRoute);
router.use("/group", groupRoute);

export default router;
