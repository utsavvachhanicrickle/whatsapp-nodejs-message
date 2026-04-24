import { clients } from "../socket.js";
import { MESSAGES } from "../utils/Messages.js";

export const messageSendController = async (req, res) => {
  const { sessionId, number, message } = req.body;

  const client = clients[sessionId];

  if (!client) {
    return res.status(400).json({ error: MESSAGES.CLIENT_NOT_FOUND });
  }

  const formatted = number.includes("@c.us") ? number : `91${number}@c.us`;

  try {
    await client.sendMessage(formatted, message);
    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: MESSAGES.WHATSAPP_MESSAGE_ERROR });
  }
};


export const multipleMessageSendController = async (req, res) => {
  try {
    const { sessionId, multipleNumber, message } = req.body;

    if (!multipleNumber || !Array.isArray(multipleNumber)) {
      return res.status(400).json({ error: "multipleNumber not present" });
    }

    const client = clients[sessionId];

    if (!client) {
      return res.status(400).json({ error: MESSAGES.CLIENT_NOT_FOUND });
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

    return res.status(500).json({
      error: MESSAGES.WHATSAPP_MESSAGE_ERROR,
    });
  }
};