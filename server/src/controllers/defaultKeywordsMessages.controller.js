import { MESSAGES } from "../utils/Messages.js";
import AppError from "../utils/AppError.js";
import {
    getDefaultKeywordsMessagesServices,
    addDefaultKeywordsMessagesServices,
    updateDefaultKeywordsMessagesServices,
    deleteDefaultKeywordMessageServices,
    starDefaultKeywordMessageServices
} from "../services/defaultKeywordsMessages.service.js"

export const getDefaultKeywordsMessagesController = async (req, res, next) => {
    try {
        const sessionId = req.params.sessionId;
        const userId = req.userId || req.user?.id;
        console.log("get default keyword Message Called !!", sessionId);
        if (!sessionId) {
            return next(new AppError(MESSAGES.SESSIONID_REQURIED, 400));
        }
        if (!userId) {
            return next(new AppError(MESSAGES.USER_ID_REQURIED, 400));
        }
        const result = await getDefaultKeywordsMessagesServices(sessionId, userId);
        if (!result) {
            return next(new AppError(MESSAGES.DEFAULTKEYWORDSMESSAGENOTFOUND, 404));
        }
        console.log("get default keyword Message respondes !!", sessionId);
        res.status(200).json({
            success: true,
            message: MESSAGES.GETDEFAULTKEYWORDSMESSAGESERROR,
            result
        });
    } catch (error) {
        console.error("get default keywords mesasge error:", error);
        return next(new AppError(MESSAGES.GETDEFAULTKEYWORDSERROR, 500));
    }
}

export const addDefaultKeywordsMessageController = async (req, res, next) => {
    try {
        const sessionId = req.params.sessionId;
        const userId = req.userId || req.user?.id;
        const { defaulWordsMessages } = req.body;
        console.log("add default keyword Message Called !!", sessionId);
        if (!sessionId) {
            return next(new AppError(MESSAGES.SESSIONID_REQURIED, 400));
        }
        if (!userId) {
            return next(new AppError(MESSAGES.USER_ID_REQURIED, 400));
        }
        if (!defaulWordsMessages) {
            return next(new AppError(MESSAGES.MISSING_FIELDS, 400))
        }
        const result = await addDefaultKeywordsMessagesServices(sessionId, userId, defaulWordsMessages);
        if (!result) {
            return next(new AppError(MESSAGES.DEFAULTKEYWORDSMESSAGENOTFOUND, 404));
        }
        console.log("add default keyword Message Respondes !!", sessionId);
        res.status(200).json({
            success: true,
            message: MESSAGES.ADDDEFAULTKEYWORDSMESSAGESSUCCESS,
            result
        });
    } catch (error) {
        console.error("add default keywords mesasge error:", error);
        return next(new AppError(MESSAGES.ADDDEFAULTKEYWORDSMESSAGESERROR, 500));
    }
}

export const updateDefaultKeywordMessageController = async (req, res, next) => {
    try {
        const { sessionId, id } = req.params;
        const userId = req.userId || req.user?.id;
        const { defaulWordsMessages } = req.body;
        console.log("update default keyword Message Called !!", sessionId);
        if (!sessionId) {
            return next(new AppError(MESSAGES.SESSIONID_REQURIED, 400));
        }
        if (!userId) {
            return next(new AppError(MESSAGES.USER_ID_REQURIED, 400));
        }
        if (!defaulWordsMessages || !id) {
            return next(new AppError(MESSAGES.MISSING_FIELDS, 400))
        }
        const result = await updateDefaultKeywordsMessagesServices(sessionId, userId, defaulWordsMessages, id);
        if (!result) {
            return next(new AppError(MESSAGES.DEFAULTKEYWORDSMESSAGENOTFOUND, 404));
        }
        console.log("update default keyword Message Respondes !!", sessionId);
        res.status(200).json({
            success: true,
            message: MESSAGES.UPDATEDEFAULTKEYWORDSMESSAGESSUCCESS,
            result
        });
    } catch (error) {
        console.log("update default message error : ", error);
        return next(new AppError(MESSAGES.UPDATEDEFAULTKEYWORDSMESSAGESERROR, 500))

    }
}

export const deleteDefaultKeywordMessageController = async (req, res, next) => {
    try {
        const { sessionId, id } = req.params;
        const userId = req.userId || req.user?.id;
        console.log("delete default keyword Message Called !!", sessionId);
        if (!sessionId) {
            return next(new AppError(MESSAGES.SESSIONID_REQURIED, 400));
        }
        if (!userId) {
            return next(new AppError(MESSAGES.USER_ID_REQURIED, 400));
        }
        if (!id) {
            return next(new AppError(MESSAGES.MISSING_FIELDS, 400))
        }
        const result = await deleteDefaultKeywordMessageServices(sessionId, userId, id);
        if (!result) {
            return next(new AppError(MESSAGES.DEFAULTKEYWORDSMESSAGENOTFOUND, 404));
        }
        console.log("delete default keyword Message Respondes !!", sessionId);
        res.status(200).json({
            success: true,
            message: MESSAGES.DELETEDEFAULTKEYWORDSMESSAGESSUCCESS,
            result
        });
    } catch (error) {
        console.log("delete default keyword message error ");
        return next(new AppError(MESSAGES.DELETEDEFAULTKEYWORDSMESSAGESERROR, 500))
    }
}

export const starDefaultKeywordMessageController = async (req, res, next) => {
    try {
        const { sessionId, id } = req.params;
        const userId = req.userId || req.user?.id;;
        console.log("star default keyword Message Called !!", sessionId);
        if (!sessionId) {
            return next(new AppError(MESSAGES.SESSIONID_REQURIED, 400));
        }
        if (!userId) {
            return next(new AppError(MESSAGES.USER_ID_REQURIED, 400));
        }
        if (!id) {
            return next(new AppError(MESSAGES.MISSING_FIELDS, 400))
        }
        const result = await starDefaultKeywordMessageServices(sessionId, userId, id);
        if (!result) {
            return next(new AppError(MESSAGES.DEFAULTKEYWORDNOTFOUND, 404));
        }
        console.log("star default keyword Message Respondes !!", sessionId);
        res.status(200).json({
            success: true,
            message: MESSAGES.STARDEFAULTKEYWORDSMESSAGESSUCCESS,
            result
        });
    } catch (error) {
        console.log("star default keyword message error ");
        return next(new AppError(MESSAGES.STARDEFAULTKEYWORDSMESSAGESERROR, 500))
    }
}