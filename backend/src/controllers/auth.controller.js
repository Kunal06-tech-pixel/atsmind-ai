import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import { setCsrfCookie } from "../middleware/csrf.middleware.js";
import RefreshToken from "../models/RefreshToken.js";
import User from "../models/User.js";

const isProduction = process.env.NODE_ENV === "production";
const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL_DAYS = 7;

const accessCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "strict",
  maxAge: 15 * 60 * 1000,
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "strict",
  maxAge: REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
};

const clearCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "strict",
};

const USER_ROLES = new Set(["job_seeker", "recruiter", "admin"]);

const cleanString = (value) => String(value || "").trim();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
  });

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const serializeUser = (user) => ({
  id: user._id?.toString?.() || user.id,
  name: user.name,
  email: user.email,
  role: user.role || "job_seeker",
  plan: user.plan || "free",
  companyProfile: user.companyProfile || {},
  recruiterVerified: Boolean(user.recruiterVerified),
});

const issueTokens = async (res, user) => {
  const accessToken = generateToken(user._id);
  const refreshToken = crypto.randomBytes(40).toString("hex");

  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000),
  });

  res.cookie("access_token", accessToken, accessCookieOptions);
  res.cookie("token", accessToken, accessCookieOptions);
  res.cookie("refresh_token", refreshToken, refreshCookieOptions);
  const csrfToken = setCsrfCookie(res);

  return { accessToken, csrfToken };
};

export const signup = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = "job_seeker",
      companyProfile = {},
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!USER_ROLES.has(role) || role === "admin") {
      return res.status(400).json({ message: "Invalid account role" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      name: cleanString(name),
      email: cleanString(email),
      password: hashedPassword,
      role,
      companyProfile:
        role === "recruiter"
          ? {
              companyName: cleanString(companyProfile.companyName),
              designation: cleanString(companyProfile.designation),
              companyWebsite: cleanString(companyProfile.companyWebsite),
            }
          : undefined,
    });
    const { accessToken, csrfToken } = await issueTokens(res, user);

    return res.status(201).json({
      message: "Signup successful",
      accessToken,
      csrfToken,
      user: serializeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const { accessToken, csrfToken } = await issueTokens(res, user);

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      csrfToken,
      user: serializeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token is required" });
    }

    const existing = await RefreshToken.findOne({
      tokenHash: hashToken(refreshToken),
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    }).populate("user");

    if (!existing?.user) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    existing.revokedAt = new Date();
    await existing.save();

    const { accessToken, csrfToken } = await issueTokens(res, existing.user);

    return res.json({
      message: "Token refreshed",
      accessToken,
      csrfToken,
      user: serializeUser(existing.user),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  const refreshToken = req.cookies?.refresh_token;

  if (refreshToken) {
    await RefreshToken.updateOne(
      { tokenHash: hashToken(refreshToken) },
      { revokedAt: new Date() }
    ).catch(() => {});
  }

  res.clearCookie("access_token", clearCookieOptions);
  res.clearCookie("token", clearCookieOptions);
  res.clearCookie("refresh_token", clearCookieOptions);

  return res.status(200).json({ message: "Logged out successfully" });
};
