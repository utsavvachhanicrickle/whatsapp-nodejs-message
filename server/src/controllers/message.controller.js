import { clients } from "../socket.js";
import { MESSAGES } from "../utils/Messages.js";
import AppError from "../utils/AppError.js";

export const messageSendController = async (req, res, next) => {
  try {
    const { sessionId, number, message } = req.body;

    const client = clients[sessionId];

    if (!client) {
      return next(new AppError(MESSAGES.CLIENT_NOT_FOUND, 400));
    }

    const formatted = number.includes("@c.us") ? number : `91${number}@c.us`;

    await client.sendMessage(formatted, message);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    return next(new AppError(MESSAGES.WHATSAPP_MESSAGE_ERROR, 500));
  }
};

export const multipleMessageSendController = async (req, res, next) => {
  try {
    const { sessionId, multipleNumber, message } = req.body;

    if (!multipleNumber || !Array.isArray(multipleNumber)) {
      return next(new AppError("multipleNumber not present", 400));
    }

    const client = clients[sessionId];

    if (!client) {
      return next(new AppError(MESSAGES.CLIENT_NOT_FOUND, 400));
    }

    let success = 0;
    let failed = 0;

    for (const number of multipleNumber) {
      const formatted = number.phoneNumber.includes("@c.us")
        ? number.phoneNumber
        : `91${number.phoneNumber}@c.us`;

      try {
        await client.sendMessage(formatted, message);
        success++;
      } catch (err) {
        console.log("❌ Failed:", formatted, err.message);
        failed++;
      }
    }

    return res.status(200).json({
      success: true,
      sent: success,
      failed: failed,
    });

  } catch (error) {
    console.error("Bulk message error:", error);
    return next(new AppError(MESSAGES.WHATSAPP_MESSAGE_ERROR, 500));
  }
};