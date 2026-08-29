import jwt from "jsonwebtoken";

export function auth(req, res, next) {
  const authorization = req.headers.authorization || "";

  if (!authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Authentication required",
    });
  }

  const token = authorization.slice(7);

  try {
    req.user = jwt.verify(
      token,
      process.env.JWT_SECRET || "dev-secret"
    );

    next();
  } catch {
    return res.status(401).json({
      error: "Invalid token",
    });
  }
}