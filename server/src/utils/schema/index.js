import jwt from "jsonwebtoken";
import { MESSAGES } from "../Messages.js";
import bcrypt from "bcryptjs";

export const COOKIESSCHEMA = {
  ACCESSTOKEN: "accessToken",
  REFRESHTOKEN: "refreshToken",
  MAXAGE: {
    ACCESSTOKEN: 15 * 60 * 1000,
    REFRESHTOKEN: 7 * 24 * 60 * 60 * 1000,
  },
  PRODUCTION: "production",
};


export const JWTSCHEMA = {
  expiresIn: {
    ACCESS_TOKEN: "15m",
    REFRESH_TOKEN: "7d",
  },
}

export const createPassword = async (password) => {
  return bcrypt.hash(password, Number(process.env.BCRYPT));
};

export const comparePassword = async (password, mainPassword) => {
  return bcrypt.compare(password, mainPassword);
};

// Token genrate and verify
export const genrateRefreshToken = async ({ email, id }) => {
  return jwt.sign({ email, id }, process.env.REFRESHTOKEN_SECRET, {
    expiresIn: JWTSCHEMA.expiresIn.REFRESH_TOKEN,
  });
};

export const genrateAccessToken = async ({ email, id }) => {
  return jwt.sign({ email, id }, process.env.ACCESSTOKEN_SECRET, {
    expiresIn: JWTSCHEMA.expiresIn.ACCESS_TOKEN,
  });
};

export const verifyRefreshToken = async (refreshToken) => {
  try {
    return jwt.verify(refreshToken, process.env.REFRESHTOKEN_SECRET);
  } catch (err) {
    throw new Error(MESSAGES.REFRESH_TOKEN_EXPIRED);
  }
};

// Cookies
export const setCookies = async ({ type, token, maxAge, res }) => {
  res.cookie(type, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === COOKIESSCHEMA.PRODUCTION,
    sameSite: "lax",
    maxAge: maxAge,
  });
};

export const clearAuthCookies = async (res) => {
  res.clearCookie(COOKIESSCHEMA.ACCESSTOKEN);
  res.clearCookie(COOKIESSCHEMA.REFRESHTOKEN);
};
