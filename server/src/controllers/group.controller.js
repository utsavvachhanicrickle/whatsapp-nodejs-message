import { clients } from "../socket.js";
import { MESSAGES } from "../utils/Messages.js";
import AppError from "../utils/AppError.js";

export const getGroupsController = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const client = clients[sessionId];

    if (!client) {
      return next(new AppError(MESSAGES.CLIENT_NOT_FOUND, 400));
    }

    const chats = await client.getChats();

    const groups = chats

    
      .filter((chat) => chat.isGroup)
      .map((g) => ({
        id: g.id._serialized,
        name: g.name,
      }));

    return res.status(200).json({
      success: true,
      groups,
    });
  } catch (error) {
    console.error("Get groups error:", error);
    return next(new AppError("Failed to fetch groups", 500));
  }
};

export const sendMultipleGroupMessageController = async (req, res, next) => {
  try {
    const { sessionId, multipleGroup, message } = req.body;

    if (!Array.isArray(multipleGroup) || multipleGroup.length === 0) {
      return next(new AppError("Selection is empty. Please select at least one group.", 400));
    }

    const client = clients[sessionId];
    if (!client) {
      return next(new AppError("WhatsApp client not found. Please re-login.", 400));
    }

    const sendPromises = multipleGroup.map((group) => {
      return client.sendMessage(group.id, message);
    });

    await Promise.all(sendPromises);

    return res.status(200).json({
      success: true,
      message: `Messages sent to ${multipleGroup.length} groups successfully.`,
    });
  } catch (error) {
    console.error("Bulk Group Send Error:", error);
    return next(new AppError("Failed to send bulk group messages.", 500));
  }
};