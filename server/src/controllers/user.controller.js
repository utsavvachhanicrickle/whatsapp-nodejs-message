import { createUser, getUserByEmail, getUserById, updateUserRefreshToken, getAllRegisteredUsers } from "../services/user.service.js";
import { 
  createWhatsappSection, 
  getWhatsappSectionsByUserId, 
  getWhatsappSectionByNumber,
  deleteWhatsappSectionByNumberAndUserId 
} from "../services/whatsappSection.service.js";
import { MESSAGES } from "../utils/Messages.js";
import AppError from "../utils/AppError.js";
import {
  createPassword,
  comparePassword,
  genrateRefreshToken,
  genrateAccessToken,
  COOKIESSCHEMA,
  setCookies,
  clearAuthCookies,
  verifyRefreshToken,
} from "../utils/schema/index.js";
import { startWhatsAppSession, clients } from "../socket.js";
import fs from "fs";
import path from "path";

export const addUser = async (req, res, next) => {
  try {
    const io = req.app.get("io");
    const { name, phone, socketId } = req.body;

    if (!name || !phone || !socketId) {
      return next(new AppError("Missing required fields", 400));
    }

    const sessionId = phone;
    const userId = req.userId;

    // Save to DB if not already exists
    const existingSection = await getWhatsappSectionByNumber(sessionId);
    if (!existingSection) {
      await createWhatsappSection(sessionId, userId);
    }

    await startWhatsAppSession({ sessionId, socketId, io });

    return res.json({
      success: true,
      message: "Session started",
      user: sessionId,
    });
  } catch (error) {
    console.log("addUser error:", error.message);
    return next(new AppError("Something went wrong", 500));
  }
};

export const removeUser = async (req, res, next) => {
  try {
    const io = req.app.get("io");
    const phone = req.params.phone;

    if (!phone) {
      return next(new AppError("Phone is required", 400));
    }

    const sessionId = phone;
    const userId = req.userId;

    // Remove from DB (Section and all associated contacts)
    await deleteWhatsappSectionByNumberAndUserId(sessionId, userId);
    
    try {
      const { deleteContactsByUserIdAndSessionId } = await import("../services/contact.service.js");
      await deleteContactsByUserIdAndSessionId(userId, sessionId);
      console.log(`🧹 Contacts cleared for session ${sessionId} of user ${userId}`);
    } catch (err) {
      console.warn("Contact deletion error:", err.message);
    }

    const sessionPath = path.join(process.cwd(), `.wwebjs_auth/session-${sessionId}`);

    const client = clients[sessionId];
    if (client) {
      try {
        await client.destroy();
      } catch (err) {
        console.warn("Client destroy error:", err.message);
      }
      delete clients[sessionId];
    }

    if (fs.existsSync(sessionPath)) {
      fs.rmSync(sessionPath, { recursive: true, force: true });
      console.log("🧹 Session folder deleted:", sessionId);
    }

    io.emit("session-removed", { sessionId });

    return res.status(200).json({
      success: true,
      message: "Session removed completely",
    });
  } catch (error) {
    console.error("Remove error:", error);
    return next(new AppError(error.message, 500));
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const userId = req.userId;
    const sections = await getWhatsappSectionsByUserId(userId);
    res.json({ users: sections.map(s => s.number) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const signUpController = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    
    if (!name || !email || !password || !confirmPassword) {
      return next(new AppError(MESSAGES.MISSING_FIELDS, 400));
    }

    if (password !== confirmPassword) {
      return next(new AppError(MESSAGES.PASSWORDS_DO_NOT_MATCH, 400));
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return next(new AppError("Email already exists", 400));
    }

    const hashedPassword = await createPassword(password);
    await createUser({ name, email, password: hashedPassword });

    res.status(201).json({
      success: true,
      message: MESSAGES.SIGNUP_SUCCESS,
    });
  } catch (error) {
    console.error("Sign-up error:", error);
    return next(new AppError(MESSAGES.SIGNUP_ERROR, 500));
  }
};

export const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new AppError(MESSAGES.MISSING_FIELDS, 400));
    }

    const user = await getUserByEmail(email);
    if (!user || !(await comparePassword(password, user.password))) {
      return next(new AppError(MESSAGES.INVALID_CREDENTIALS, 401));
    }

    const accessToken = await genrateAccessToken({
      email: user.email,
      id: user._id,
    });

    const refreshToken = await genrateRefreshToken({
      email: user.email,
      id: user._id,
    });

    await updateUserRefreshToken(user._id, refreshToken);

    setCookies({
      type: COOKIESSCHEMA.ACCESSTOKEN,
      token: accessToken,
      maxAge: COOKIESSCHEMA.MAXAGE.ACCESSTOKEN,
      res,
    });

    setCookies({
      type: COOKIESSCHEMA.REFRESHTOKEN,
      token: refreshToken,
      maxAge: COOKIESSCHEMA.MAXAGE.REFRESHTOKEN,
      res,
    });

    res.status(201).json({
      success: true,
      message: MESSAGES.LOGIN_SUCCESS,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return next(new AppError(MESSAGES.LOGIN_ERROR, 500));
  }
};

export const logoutController = async (req, res, next) => {
  try {
    const user = await getUserById(req.userId);

    if (!user) {
      return next(new AppError(MESSAGES.USER_NOT_FOUND, 404));
    }

    await updateUserRefreshToken(user._id, null);
    clearAuthCookies(res);

    res.status(200).json({ success: true, message: MESSAGES.LOGOUT_SUCCESS });
  } catch (error) {
    console.error("Logout error:", error);
    return next(new AppError(MESSAGES.LOGOUT_ERROR, 500));
  }
};

export const refreshTokenController = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ message: MESSAGES.ACCESS_DENIED });
    }

    const userRefresh = await verifyRefreshToken(token);
    if (!userRefresh) {
      return next(new AppError(MESSAGES.REFRESH_TOKEN_INVALID, 403));
    }

    const user = await getUserById(userRefresh.id);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const newAccessToken = await genrateAccessToken({
      email: user.email,
      id: user._id,
    });

    await setCookies({
      type: COOKIESSCHEMA.ACCESSTOKEN,
      token: newAccessToken,
      maxAge: COOKIESSCHEMA.MAXAGE.ACCESSTOKEN,
      res,
    });

    res.status(200).json({ success: true, message: MESSAGES.REFRESH_TOKEN });
  } catch (error) {
    console.error("Refresh token error:", error);
    return next(new AppError(MESSAGES.REFRESH_TOKEN_ERROR, 500));
  }
};

export const getTeammatesController = async (req, res, next) => {
  try {
    const teammates = await getAllRegisteredUsers();
    // Exclude current user from teammates list
    const filtered = teammates.filter(u => u._id !== req.userId);
    res.json({ success: true, teammates: filtered });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const changePasswordController = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.userId;

    if (!oldPassword || !newPassword) {
      return next(new AppError("Missing old or new password fields", 400));
    }

    const user = await getUserById(userId);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const isMatch = await comparePassword(oldPassword, user.password);
    if (!isMatch) {
      return next(new AppError("Current password is incorrect", 400));
    }

    const newHashedPassword = await createPassword(newPassword);
    const pool = (await import("../../config/db.js")).default;
    await pool.query('UPDATE users SET password = $1 WHERE _id = $2', [newHashedPassword, userId]);

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    return next(new AppError("Failed to update password", 500));
  }
};
