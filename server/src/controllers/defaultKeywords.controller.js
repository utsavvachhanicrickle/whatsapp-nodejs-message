import { MESSAGES } from "../utils/Messages.js";
import AppError from "../utils/AppError.js";
import {
    getDefaultKeywordsServices,
    addDefaultKeywordsServices,
    updateDefaultKeywordServices,
    deleteDefaultKeywordServices
} from "../services/defaultKeywords.service.js"


export const getDefaultKeywordsController = async (req, res, next) => {
    try {
        const sessionId = req.params.sessionId;
        const { userId } = req.userId;
        if (!sessionId) {
            return next(new AppError(MESSAGES.SESSIONID_REQURIED, 400));
        }
        if (!userId) {
            return next(new AppError(MESSAGES.USER_ID_REQURIED, 400));
        }
        const res = await getDefaultKeywordsServices(sessionId, userId);
        if (!res) {
            return next(new AppError(MESSAGES.DEFAULTKEYWORDNOTFOUND, 404));
        }
        return res.status(200).json({
            success: true,
            message: MESSAGES.GETDEFAULTKEYWORDSSUCCESS,
            data: res,
        });
    } catch (error) {
        console.error("get default keywords error:", error);
        return next(new AppError(MESSAGES.GETDEFAULTKEYWORDSERROR, 500));
    }
}

export const addDefaultKeywordsController = async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const { userId } = req.userId;
        const { defaultKeyword } = req.body;
        if (!sessionId) {
            return next(new AppError(MESSAGES.SESSIONID_REQURIED, 400));
        }
        if (!userId) {
            return next(new AppError(MESSAGES.USER_ID_REQURIED, 400));
        }
        if (!defaultKeyword) {
            return next(new AppError(MESSAGES.MISSING_FIELDS, 400))
        }
        const res = await addDefaultKeywordsServices(sessionId, userId, defaultKeyword);
        if (!res) {
            return next(new AppError(MESSAGES.DEFAULTKEYWORDNOTFOUND, 404));
        }
        return res.status(200).json({
            success: true,
            message: MESSAGES.ADDDEFAULTKEYWORDSSUCCESS,
            data: res,
        });
    } catch (error) {
        console.error("add default keywords error:", error);
        return next(new AppError(MESSAGES.ADDDEFAULTKEYWORDSERROR, 500));
    }
}

export const updateDefaultKeywordController = async (req, res, next) => {
    try {
        const { sessionId, id } = req.params;
        const { userId } = req.userId;
        const { defaultKeyword } = req.body;
        if (!sessionId) {
            return next(new AppError(MESSAGES.SESSIONID_REQURIED, 400));
        }
        if (!userId) {
            return next(new AppError(MESSAGES.USER_ID_REQURIED, 400));
        }
        if (!defaultKeyword || !id) {
            return next(new AppError(MESSAGES.MISSING_FIELDS, 400))
        }
        const res = await updateDefaultKeywordServices(sessionId, userId, defaultKeyword, id);
        if (!res) {
            return next(new AppError(MESSAGES.DEFAULTKEYWORDNOTFOUND, 404));
        }
        return res.status(200).json({
            success: true,
            message: MESSAGES.UPDATEDEFAULTKEYWORDSSUCCESS,
            data: res,
        });
    } catch (error) {
        console.error("update default keywords error:", error);
        return next(new AppError(MESSAGES.UPDATEDEFAULTKEYWORDSERROR, 500));
    }
}

export const deleteDefaultKeywordController = async (req, res, next) => {
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
        const res = await deleteDefaultKeywordServices(sessionId, userId, id);
        if (!res) {
            return next(new AppError(MESSAGES.DEFAULTKEYWORDNOTFOUND, 404));
        }
        return res.status(200).json({
            success: true,
            message: MESSAGES.DELETEDEFAULTKEYWORDSSUCCESS,
            data: res,
        });
    } catch (error) {
        console.error("delete default keywords error:", error);
        return next(new AppError(MESSAGES.DELETEDEFAULTKEYWORDSERROR, 500));
    }
}