import { MESSAGES } from "../utils/Messages.js";
import AppError from "../utils/AppError.js";


export const getDefaultKeywordsMessagesController = async (req, res, next) => {
    try {
        const sessionId = req.params.sessionId;
        const { userId } = req.userId
        if (!sessionId) {
            return next(new AppError(MESSAGES.SESSIONID_REQURIED, 400));
        }
        if (!userId) {
            return next(new AppError(MESSAGES.USER_ID_REQURIED, 400));
        }
        const res = await getDefaultKeywordsMessagesServices(sessionId, userId);
        if (!res) {
            return next(new AppError(MESSAGES.DEFAULTKEYWORDSMESSAGENOTFOUND, 404));
        }
        return res.status(200).json({
            success: true,
            message: MESSAGES.GETDEFAULTKEYWORDSMESSAGESERROR,
            data: res,
        });
    } catch (error) {
        console.error("get default keywords mesasge error:", error);
        return next(new AppError(MESSAGES.GETDEFAULTKEYWORDSERROR, 500));
    }
}

export const addDefaultKeywordsMessageController = async (req, res, next) => {
    try {
        const sessionId = req.params.sessionId;
        const { userId } = req.userId
        const { defaulWordsMessages } = req.body;

        if (!sessionId) {
            return next(new AppError(MESSAGES.SESSIONID_REQURIED, 400));
        }
        if (!userId) {
            return next(new AppError(MESSAGES.USER_ID_REQURIED, 400));
        }
        if (!defaulWordsMessages) {
            return next(new AppError(MESSAGES.MISSING_FIELDS, 400))
        }
        const res = await addDefaultKeywordsMessagesServices(sessionId, userId, defaulWordsMessages);
        if (!res) {
            return next(new AppError(MESSAGES.DEFAULTKEYWORDSMESSAGENOTFOUND, 404));
        }
        return res.status(200).json({
            success: true,
            message: MESSAGES.ADDDEFAULTKEYWORDSMESSAGESSUCCESS,
            data: res,
        });
    } catch (error) {
        console.error("add default keywords mesasge error:", error);
        return next(new AppError(MESSAGES.ADDDEFAULTKEYWORDSMESSAGESERROR, 500));
    }
}

export const updateDefaultKeywordMessageController = async (req, res, next) => {
    try {
        const { sessionId, id } = req.params;
        const { userId } = req.userId
        const { defaulWordsMessages } = req.body;

        if (!sessionId) {
            return next(new AppError(MESSAGES.SESSIONID_REQURIED, 400));
        }
        if (!userId) {
            return next(new AppError(MESSAGES.USER_ID_REQURIED, 400));
        }
        if (!defaulWordsMessages || !id) {
            return next(new AppError(MESSAGES.MISSING_FIELDS, 400))
        }
        const res = await updateDefaultKeywordsMessagesServices(sessionId, userId, defaulWordsMessages, id);
        if (!res) {
            return next(new AppError(MESSAGES.DEFAULTKEYWORDSMESSAGENOTFOUND, 404));
        }
        return res.status(200).json({
            success: true,
            message: MESSAGES.UPDATEDEFAULTKEYWORDSMESSAGESSUCCESS,
            data: res,
        });
    } catch (error) {
        console.log("update default message error : ", error);
        return next(new AppError(MESSAGES.UPDATEDEFAULTKEYWORDSMESSAGESERROR, 500))

    }
}

export const deleteDefaultKeywordMessageController = async (req, res, next) => {
    try {
        const { sessionId, id } = req.params;
        const { userId } = req.userId

        if (!sessionId) {
            return next(new AppError(MESSAGES.SESSIONID_REQURIED, 400));
        }
        if (!userId) {
            return next(new AppError(MESSAGES.USER_ID_REQURIED, 400));
        }
        if (!id) {
            return next(new AppError(MESSAGES.MISSING_FIELDS, 400))
        }
        const res = await deleteDefaultKeywordMessageServices(sessionId, userId, id);
        if (!res) {
            return next(new AppError(MESSAGES.DEFAULTKEYWORDSMESSAGENOTFOUND, 404));
        }
        return res.status(200).json({
            success: true,
            message: MESSAGES.DELETEDEFAULTKEYWORDSMESSAGESSUCCESS,
            data: res,
        });
    } catch (error) {
        console.log("delete default keyword message error ");
        return next(new AppError(MESSAGES.DELETEDEFAULTKEYWORDSMESSAGESERROR, 500))
    }
}

export const starDefaultKeywordMessageController = async (req, res, next) => {
    try {
        const { sessionId, id } = req.params;
        const { userId } = req.userId;
        if (!sessionId) {
            return next(new AppError(MESSAGES.SESSIONID_REQURIED, 400));
        }
        if (!userId) {
            return next(new AppError(MESSAGES.USER_ID_REQURIED, 400));
        }
        if (!id) {
            return next(new AppError(MESSAGES.MISSING_FIELDS, 400))
        }
        const res = await starDefaultKeywordMessageServices(sessionId, userId, id);
        if (!res) {
            return next(new AppError(MESSAGES.DEFAULTKEYWORDNOTFOUND, 404));
        }
        return res.status(200).json({
            success: true,
            message: MESSAGES.STARDEFAULTKEYWORDSMESSAGESSUCCESS,
            data: res,
        });
    } catch (error) {
        console.log("star default keyword message error ");
        return next(new AppError(MESSAGES.STARDEFAULTKEYWORDSMESSAGESERROR, 500))
    }
}