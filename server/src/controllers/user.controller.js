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
  verifyRefreshToken,
} from "../utils/schema/index.js";
import { startWhatsAppSession } from "../socket.js";
import { clients } from "../socket.js";
import fs from "fs";
import path from "path";

export const addUser = async (req, res) => {
  try {
    const io = req.app.get("io");

    const { name, phone, socketId } = req.body;

    if (!name || !phone || !socketId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const sessionId = phone;

    await startWhatsAppSession({ sessionId, socketId, io });

    return res.json({
      success: true,
      message: "Session started",
      user: {
        name,
        phone,
      },
    });
  } catch (error) {
    console.log("addUser error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// export const removeUser = async (req, res) => {
//   const io = req.app.get("io");
//   const { phone, socketId } = req.body;

//   const sessionId = phone;

//   if (!sessionId) {
//     return res.status(400).json({
//       success: false,
//       message: "Session ID required",
//     });
//   }

//   const client = clients[sessionId];

//   try {
//     if (client) {
//       console.log("🗑 Removing session:", sessionId);

//       try {
//         await client.destroy();
//         await client.pupBrowser?.close();
//       } catch (err) {
//         console.warn("Destroy issue:", err.message);
//       }

//       delete clients[sessionId];
//       delete initializing[sessionId];
//     }

//     // ✅ Always notify frontend
//     if (socketId) {
//       io.to(socketId).emit("session-removed", { sessionId });
//     } else {
//       io.emit("session-removed", { sessionId });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Session removed successfully",
//     });
//   } catch (error) {
//     console.error("❌ Remove error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Error removing session",
//       error: error.message,
//     });
//   }
// };

export const removeUser = async (req, res) => {
  const io = req.app.get("io");
  const phone = req.params.phone;
  const socketId = req.query.socketId;

  console.log("PHONE:", phone);
  console.log("SOCKET:", socketId);

  if (!phone) {
    return res.status(400).json({ error: "Phone is required" });
  }

  const sessionId = phone;
  const sessionPath = path.join(
    process.cwd(),
    `.wwebjs_auth/session-${sessionId}`,
  );

  try {
    const client = clients[sessionId];

    // ✅ If client exists → destroy properly
    if (client) {
      try {
        await client.destroy();
      } catch (err) {
        console.warn("Client destroy error:", err.message);
      }

      delete clients[sessionId];
    }

    // ✅ FORCE CLEAN SESSION FILE (VERY IMPORTANT)
    if (fs.existsSync(sessionPath)) {
      fs.rmSync(sessionPath, { recursive: true, force: true });
      console.log("🧹 Session folder deleted:", sessionId);
    }

    // ✅ EMIT EVENT
    io.emit("session-removed", { sessionId });

    return res.status(200).json({
      success: true,
      message: "Session removed completely",
    });
  } catch (error) {
    console.error("Remove error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllUsers = async (req, res) => {
  res.json({ users: Object.keys(clients) });
};

export const signUpController = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    if (!name || !email || !password || !confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: MESSAGES.MISSING_FIELDS });
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: MESSAGES.PASSWORDS_DO_NOT_MATCH });
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
    const token = req.cookies.refreshToken;
    if (!token)
      return res.status(401).json({ message: MESSAGES.ACCESS_DENIED });

    const userRefresh = await verifyRefreshToken(token);
    if (!userRefresh)
      return res
        .status(403)
        .json({ success: true, message: MESSAGES.REFRESH_TOKEN_INVALID });

    console.log("Refrensh Called ", userRefresh.id);

    const user = await User.findById(userRefresh.id);

    const newAccessToken = await genrateAccessToken({
      email: user.email,
      id: user.id,
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
    res.status(500).json({
      success: false,
      message: MESSAGES.REFRESH_TOKEN_ERROR,
      error: error.message,
    });
  }
};
