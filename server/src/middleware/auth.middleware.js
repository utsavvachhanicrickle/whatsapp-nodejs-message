import { MESSAGES } from "../utils/Messages.js";
import { verifyRefreshToken} from "../utils/schema/index.js"

export const authMiddleware = async(req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) return res.status(401).json({ message: MESSAGES.ACCESS_DENIED});

  try {
    const decoded = await verifyRefreshToken(token);
    req.userId = decoded?.id;
    
    if (!req.userId) {
      return res.status(402).json({ message: MESSAGES.USER_UNVERIFIED });
    }

    next();
  } catch (err) {
    return res.status(403).json({ message: MESSAGES.REFRESH_TOKEN_EXPIRED });
  }
};