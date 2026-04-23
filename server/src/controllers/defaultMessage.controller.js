import DefaultMessage from "../modules/defaultMessage.module.js";
import { MESSAGES } from "../utils/Messages.js";

export const addDefaultMessageController = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.userId;

    const defaultMessage = new DefaultMessage({
      message,
      userId,
    });

    await defaultMessage.save();

    res.status(201).json({
      success: true,
      message: MESSAGES.ADDDEFAULTMESSAGESUCCESS,
      defaultMessage,
    });
  } catch (error) {
    console.error("Error adding default message:", error);
    res.status(500).json({
      success: false,
      message: MESSAGES.ADDDEFAULTMESSAGEERROR,
      error: error.message,
    });
  }
};

export const getDefaultMessagesController = async (req, res) => {
  try {
    const userId = req.userId;
    const defaultMessages = await DefaultMessage.find({ userId }).sort({
      createdAt: -1,
    });
    res.status(200).json({
      success: true,
      message: MESSAGES.GETDEFAULTMESSAGESUCCESS,
      defaultMessage: defaultMessages,
    });    
  } catch (error) {
    console.error("Error fetching default messages:", error);
    res.status(500).json({
      success: false,
      message: MESSAGES.GETDEFAULTMESSAGEERROR,
      error: error.message,
    });
  }
};

export const deleteDefaultMessageController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const defaultMessage = await DefaultMessage.findOneAndDelete({
      _id: id,
      userId,
    });
    if (!defaultMessage) {
      return res.status(404).json({
        success: false,
        message: MESSAGES.DEFAULTMESSAGENOTFOUND,
      });
    }
    res.status(200).json({
      success: true,
      message: MESSAGES.DELETEDEFAULTMESSAGESUCCESS,
    });
  } catch (error) {
    console.error("Error deleting default message:", error);
    res.status(500).json({
      success: false,
      message: MESSAGES.DELETEDEFAULTMESSAGEERROR,
      error: error.message,
    });
  }
};

export const updateDefaultMessageController = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.userId;
    const defaultMessage = await DefaultMessage.findOneAndUpdate(
      { _id: id, userId },
      { message },
      { new: true },
    );
    if (!defaultMessage) {
      return res.status(404).json({
        success: false,
        message: MESSAGES.DEFAULTMESSAGENOTFOUND,
      });
    }
    res.status(200).json({
      success: true,
      message: MESSAGES.UPDATEDEFAULTMESSAGESUCCESS,
      defaultMessage,
    });
  } catch (error) {
    console.error("Error updating default message:", error);
    res.status(500).json({
      success: false,
      message: MESSAGES.UPDATEDEFAULTMESSAGEERROR,
      error: error.message,
    });
  }
};
