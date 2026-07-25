import jwt from "jsonwebtoken";

const getToken = (req) => {
  const authorization = req.get("authorization") || "";

  if (authorization.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length);
  }

  return req.cookies?.access_token || req.cookies?.token || "";
};

const protect = (req, res, next) => {
  const token = getToken(req);

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default protect;

