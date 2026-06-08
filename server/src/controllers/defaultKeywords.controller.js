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
        const userId  = req.userId || req.user?.id;
        console.log("get default keyword Called !!",sessionId);
        
        if (!sessionId) {
            return next(new AppError(MESSAGES.SESSIONID_REQURIED, 400));
        }
        if (!userId) {
            return next(new AppError(MESSAGES.USER_ID_REQURIED, 400));
        }
        const result = await getDefaultKeywordsServices(sessionId, userId);
        if (!result) {
            return next(new AppError(MESSAGES.DEFAULTKEYWORDNOTFOUND, 404));
        }
        console.log("get default keyword respondes !!",sessionId);
        res.status(200).json({
            success: true,
            message: MESSAGES.GETDEFAULTKEYWORDSSUCCESS,
            result,
        });
    } catch (error) {
        console.error("get default keywords error:", error);
        return next(new AppError(MESSAGES.GETDEFAULTKEYWORDSERROR, 500));
    }
}

export const addDefaultKeywordsController = async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const userId  = req.userId || req.user?.id;
        const { defaultKeyword } = req.body;
        console.log("add default keyword Called !!",sessionId);
        if (!sessionId) {
            return next(new AppError(MESSAGES.SESSIONID_REQURIED, 400));
        }
        if (!userId) {
            return next(new AppError(MESSAGES.USER_ID_REQURIED, 400));
        }
        if (!defaultKeyword) {
            return next(new AppError(MESSAGES.MISSING_FIELDS, 400))
        }
        const result = await addDefaultKeywordsServices(sessionId, userId, defaultKeyword);
        if (!result) {
            return next(new AppError(MESSAGES.DEFAULTKEYWORDNOTFOUND, 404));
        }
        console.log("add default keyword Respondes !!",sessionId);
        res.status(200).json({
            success: true,
            message: MESSAGES.ADDDEFAULTKEYWORDSSUCCESS,
            result
        });
    } catch (error) {
        console.error("add default keywords error:", error);
        return next(new AppError(MESSAGES.ADDDEFAULTKEYWORDSERROR, 500));
    }
}

export const updateDefaultKeywordController = async (req, res, next) => {
    try {
        const { sessionId, id } = req.params;
        const userId  = req.userId || req.user?.id;
        const { defaultKeyword } = req.body;
        console.log("update default keyword Called !!",sessionId);
        if (!sessionId) {
            return next(new AppError(MESSAGES.SESSIONID_REQURIED, 400));
        }
        if (!userId) {
            return next(new AppError(MESSAGES.USER_ID_REQURIED, 400));
        }
        if (!defaultKeyword || !id) {
            return next(new AppError(MESSAGES.MISSING_FIELDS, 400))
        }
        const result = await updateDefaultKeywordServices(sessionId, userId, defaultKeyword, id);
        if (!result) {
            return next(new AppError(MESSAGES.DEFAULTKEYWORDNOTFOUND, 404));
        }
        console.log("update default keyword respondes !!",sessionId);
        res.status(200).json({
            success: true,
            message: MESSAGES.UPDATEDEFAULTKEYWORDSSUCCESS,
            result
        });
    } catch (error) {
        console.error("update default keywords error:", error);
        return next(new AppError(MESSAGES.UPDATEDEFAULTKEYWORDSERROR, 500));
    }
}

export const deleteDefaultKeywordController = async (req, res, next) => {
    try {
        const { sessionId, id } = req.params;
        const userId  = req.userId || req.user?.id;
        console.log("delte default keyword Called !!",sessionId);
        if (!sessionId) {
            return next(new AppError(MESSAGES.SESSIONID_REQURIED, 400));
        }
        if (!userId) {
            return next(new AppError(MESSAGES.USER_ID_REQURIED, 400));
        }
        if (!id) {
            return next(new AppError(MESSAGES.MISSING_FIELDS, 400))
        }
        const result = await deleteDefaultKeywordServices(sessionId, userId, id);
        if (!result) {
            return next(new AppError(MESSAGES.DEFAULTKEYWORDNOTFOUND, 404));
        }
        console.log("delte default keyword Respondes !!",sessionId);
        res.status(200).json({
            success: true,
            message: MESSAGES.DELETEDEFAULTKEYWORDSSUCCESS,
           result
        });
    } catch (error) {
        console.error("delete default keywords error:", error);
        return next(new AppError(MESSAGES.DELETEDEFAULTKEYWORDSERROR, 500));
    }
}