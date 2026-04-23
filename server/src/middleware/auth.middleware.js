import { MESSAGES } from "../utils/Messages.js";
import { verifyAccessToken } from "../utils/schema/index.js";

export const authMiddleware = async (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) return res.status(401).json({ message: MESSAGES.ACCESS_DENIED });

  try {
    const decoded = await verifyAccessToken(token);
    req.userId = decoded?.id;

    // console.log(":middle : ",decoded);
    if (!req.userId) {
      return res.status(402).json({ message: MESSAGES.USER_UNVERIFIED });
    }

    next();
  } catch (err) {
    console.log("middleware : ", err);

    return res.status(403).json({ message: MESSAGES.REFRESH_TOKEN_EXPIRED });
  }
};
