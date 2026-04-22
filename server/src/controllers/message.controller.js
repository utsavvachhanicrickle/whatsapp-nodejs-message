import { clients } from "./user.controller.js";


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
