import pkg from "whatsapp-web.js";
import qrcode from "qrcode";
import User from "../modules/user.module.js";
import { MESSAGES } from "../utils/Messages.js";
import {
  createPassword,
  comparePassword,
  genrateRefreshToken,
  genrateAccessToken,
  COOKIESSCHEMA,
  setCookies,
  clearAuthCookies,
} from "../utils/schema/index.js";
import { set } from "mongoose";

const { Client, LocalAuth } = pkg;
export const clients = {};

export const addUser = async (req, res) => {
  const io = req.app.get("io");

  const { name, phone, socketId } = req.body;

  if (!name || !phone || !socketId) {
    return res.status(400).json({ error: MESSAGES.MISSING_FIELDS });
  }

  const sessionId = phone;

  if (clients[sessionId]) {
    return res.json({ message: MESSAGES.USER_ALRADY_EXISTS });
  }

  const client = new Client({
    authStrategy: new LocalAuth({ clientId: sessionId }),
    puppeteer: {
      headless: false,
      args: ["--no-sandbox"],
    },
  });

  clients[sessionId] = client;

  // 🔥 STEP 1: QR
  client.on("qr", async (qr) => {
    const qrImage = await qrcode.toDataURL(qr);

    io.to(socketId).emit("qr", {
      sessionId,
      qr: qrImage,
    });
  });

  // 🔥 STEP 2: AUTHENTICATED
  client.on("authenticated", () => {
    io.to(socketId).emit("authenticated", { sessionId });
  });

  // 🔥 STEP 3: READY
  client.on("ready", () => {
    io.to(socketId).emit("ready", {
      sessionId,
      message: MESSAGES.WHATSAPP_CONNEXTED,
    });
  });

  // 🔥 STEP 4: DISCONNECTED
  client.on("disconnected", async (reason) => {
    console.log("Client was logged out or disconnected. Reason:", reason);
    delete clients[sessionId];
    try {
      await client.destroy();
    } catch (e) {
      console.log("Error destroying client:", e.message);
    }

    // Notify frontend to remove the session so they get the sign-in option again
    io.emit("session-removed", { sessionId });
  });

  // 🔥 STEP 5: AUTH FAILURE
  client.on("auth_failure", async (msg) => {
    console.log("Auth failure:", msg);
    delete clients[sessionId];
    try {
      await client.destroy();
    } catch (e) {
      console.log("Error destroying client on auth failure:", e.message);
    }

    // Notify frontend
    io.emit("session-removed", { sessionId });
  });

  try {
    await client.initialize();
  } catch (err) {
    console.log("Error initializing client:", err.message);
    delete clients[sessionId];
    io.emit("session-removed", { sessionId });
  }

  res.json({ message: "Session started", users: { name, phone, socketId } });
};

export const getAllUsers = async (req, res) => {
  res.json({ users: Object.keys(clients) });
};

export const removeUser = async (req, res) => {
  const io = req.app.get("io");

  const { phone, socketId } = req.body;

  const sessionId = phone;

  if (!sessionId) {
    return res.status(400).json({ error: MESSAGES.SESSIONID_IS_REQUIRED });
  }

  const client = clients[sessionId];

  if (!client) {
    return res.status(404).json({ error: MESSAGES.CLIENT_NOT_FOUND });
  }

  try {
    // 🔥 Destroy WhatsApp session
    await client.destroy();

    // 🔥 Remove from memory
    delete clients[sessionId];

    // 🔥 Notify frontend
    if (socketId) {
      io.to(socketId).emit("session-removed", { sessionId });
    } else {
      io.emit("session-removed", { sessionId });
    }

    res.json({ success: true, message: MESSAGES.SESSION_REMOVED });
  } catch (error) {
    console.error("Error removing session:", error);
    res.status(500).json({
      success: false,
      message: MESSAGES.ERROR_REMOVING_SESSION,
      error: error.message,
    });
  }
};

export const signUpController = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: MESSAGES.MISSING_FIELDS });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: USER_ALRADY_EXISTS });
    }

    const newUser = new User({
      name,
      email,
      password: await createPassword(password),
    });
    await newUser.save();

    res.status(201).json({
      success: true,
      message: MESSAGES.SIGNUP_SUCCESS,
    });
  } catch (error) {
    console.error("Sign-up error:", error);
    res.status(500).json({
      success: false,
      message: MESSAGES.SIGNUP_ERROR,
      error: error.message,
    });
  }
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: MESSAGES.MISSING_FIELDS });
    }

    const user = await User.findOne({ email });
    if (!user || !(await comparePassword(password, user.password))) {
      return res
        .status(401)
        .json({ success: false, message: MESSAGES.INVALID_CREDENTIALS });
    }

    const accessToken = await genrateAccessToken({
      email: user.email,
      id: user._id,
    });

    const refreshToken = await genrateRefreshToken({
      email: user.email,
      id: user._id,
    });

    user.refreshToken = refreshToken;
    await user.save();

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

    res.json({
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
    res.status(500).json({
      success: false,
      message: MESSAGES.LOGIN_ERROR,
      error: error.message,
    });
  }
};

export const logoutController = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: MESSAGES.USER_NOT_FOUND });
    }

    user.refreshToken = undefined;
    await user.save();

    clearAuthCookies(res);

    res.status(200).json({ success: true, message: MESSAGES.LOGOUT_SUCCESS });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: MESSAGES.LOGOUT_ERROR,
      error: error.message,
    });
  }
};

export const refreshTokenController = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findOne({ refreshToken });

    if (!user)
      return res
        .status(403)
        .json({ success: true, message: MESSAGES.REFRESH_TOKEN_INVALID });

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

    res.status(200).json({ message: MESSAGES.REFRESH_TOKEN });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({
      success: false,
      message: MESSAGES.REFRESH_TOKEN_ERROR,
      error: error.message,
    });
  }
};
