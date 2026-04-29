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


export const sendMultipleGroupMessageController = async (req, res) => {
  try {
    // 1. Extract multipleGroup (the array of objects) from body
    const { sessionId, multipleGroup, message } = req.body;

    // 2. Validate that it's an array and not empty
    if (!Array.isArray(multipleGroup) || multipleGroup.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Selection is empty. Please select at least one group.",
      });
    }

    const client = clients[sessionId];
    if (!client) {
      return res.status(400).json({
        success: false,
        message: "WhatsApp client not found. Please re-login.",
      });
    }

    // 3. Loop through the objects and extract the 'id'
    // Using Promise.all with map is faster than a standard for-loop for message sending
    const sendPromises = multipleGroup.map((group) => {
      // Each group in your array looks like { id: "...", name: "..." }
      return client.sendMessage(group.id, message);
    });

    await Promise.all(sendPromises);

    return res.status(200).json({
      success: true,
      message: `Messages sent to ${multipleGroup.length} groups successfully.`,
    });
  } catch (error) {
    console.error("Bulk Group Send Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send bulk group messages.",
    });
  }
};