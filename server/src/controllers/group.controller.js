import { clients } from "../socket.js";
import { MESSAGES } from "../utils/Messages.js";

export const getGroupsController = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const client = clients[sessionId];

    if (!client) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.CLIENT_NOT_FOUND,
      });
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

    return res.status(500).json({
      success: false,
      message: "Failed to fetch groups",
    });
  }
};

export const sendGroupMessageController = async (req, res) => {
  try {
    const { sessionId, groupId, message } = req.body;

    if (!groupId || !message) {
      return res.status(400).json({
        success: false,
        message: "groupId and message required",
      });
    }

    const client = clients[sessionId];

    if (!client) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.CLIENT_NOT_FOUND,
      });
    }

    await client.sendMessage(groupId, message);

    return res.status(200).json({
      success: true,
      message: "Message sent to group",
    });
  } catch (error) {
    console.error("Group send error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
};


export const sendMultipleGroupMessageController = async (req, res) => {
  try {
    const { sessionId, groupIds, message } = req.body;

    if (!Array.isArray(groupIds) || groupIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "groupIds array required",
      });
    }

    const client = clients[sessionId];

    if (!client) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.CLIENT_NOT_FOUND,
      });
    }

    for (const id of groupIds) {
      await client.sendMessage(id, message);
    }

    return res.status(200).json({
      success: true,
      message: "Messages sent to all groups",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Bulk group send failed",
    });
  }
};