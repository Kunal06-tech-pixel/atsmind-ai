import crypto from "crypto";

const isProduction = process.env.NODE_ENV === "production";

export const CSRF_COOKIE_NAME = "csrf_token";
export const CSRF_HEADER_NAME = "x-csrf-token";

const cookieOptions = {
  httpOnly: false,
  secure: isProduction,
  sameSite: isProduction ? "none" : "strict",
  maxAge: 24 * 60 * 60 * 1000,
};

export const setCsrfCookie = (res) => {
  const token = crypto.randomBytes(32).toString("hex");
  res.cookie(CSRF_COOKIE_NAME, token, cookieOptions);
  return token;
};

export const getCsrfToken = (req, res) => {
  const token = req.cookies?.[CSRF_COOKIE_NAME] || setCsrfCookie(res);
  return res.json({ csrfToken: token });
};

export const requireCsrf = (req, res, next) => {
  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.get(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({ message: "Invalid CSRF token" });
  }

  return next();
};

