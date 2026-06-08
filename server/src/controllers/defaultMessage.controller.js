import {
  createDefaultMessage,
  getDefaultMessagesByUserId,
  deleteDefaultMessageByIdAndUserId,
  updateDefaultMessageByIdAndUserId
} from "../services/defaultMessage.service.js";
import { MESSAGES } from "../utils/Messages.js";
import AppError from "../utils/AppError.js";

export const addDefaultMessageController = async (req, res, next) => {
  try {
    const { title, message } = req.body;
    const userId = req.userId || req.user?.id;

    if (!title || !message) {
      return next(new AppError(MESSAGES.MISSING_FIELDS, 400));
    }

    const defaultMessage = await createDefaultMessage(title, message, userId);

    res.status(201).json({
      success: true,
      message: MESSAGES.ADDDEFAULTMESSAGESUCCESS,
      defaultMessage,
    });
  } catch (error) {
    console.error("Error adding default message:", error);
    return next(new AppError(MESSAGES.ADDDEFAULTMESSAGEERROR, 500));
  }
};

export const getDefaultMessagesController = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?.id;
    const defaultMessages = await getDefaultMessagesByUserId(userId);
    
    res.status(200).json({
      success: true,
      message: MESSAGES.GETDEFAULTMESSAGESUCCESS,
      defaultMessage: defaultMessages,
    });
  } catch (error) {
    console.error("Error fetching default messages:", error);
    return next(new AppError(MESSAGES.GETDEFAULTMESSAGEERROR, 500));
  }
};

export const deleteDefaultMessageController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId || req.user?.id;
    
    const defaultMessage = await deleteDefaultMessageByIdAndUserId(id, userId);
    
    if (!defaultMessage) {
      return next(new AppError(MESSAGES.DEFAULTMESSAGENOTFOUND, 404));
    }
    
    res.status(200).json({
      success: true,
      message: MESSAGES.DELETEDEFAULTMESSAGESUCCESS,
      defaultMessage,
    });
  } catch (error) {
    console.error("Error deleting default message:", error);
    return next(new AppError(MESSAGES.DELETEDEFAULTMESSAGEERROR, 500));
  }
};

export const updateDefaultMessageController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, message } = req.body;
    const userId = req.userId || req.user?.id;
    
    const defaultMessage = await updateDefaultMessageByIdAndUserId(id, userId, title, message);
    
    if (!defaultMessage) {
      return next(new AppError(MESSAGES.DEFAULTMESSAGENOTFOUND, 404));
    }
    
    res.status(200).json({
      success: true,
      message: MESSAGES.UPDATEDEFAULTMESSAGESUCCESS,
      defaultMessage,
    });
  } catch (error) {
    console.error("Error updating default message:", error);
    return next(new AppError(MESSAGES.UPDATEDEFAULTMESSAGEERROR, 500));
  }
};
