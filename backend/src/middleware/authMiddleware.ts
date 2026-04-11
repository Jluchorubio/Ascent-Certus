import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

type Role = "ADMIN" | "STUDENT";

export interface AuthRequest extends Request {
  user?: { id: string; role: Role };
}

const parseCookies = (cookieHeader?: string) => {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;

  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const [key, ...rest] = trimmed.split("=");
    if (!key) continue;
    cookies[key] = decodeURIComponent(rest.join("="));
  }

  return cookies;
};

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const cookieName = process.env.COOKIE_NAME || "access_token";
  const cookies = parseCookies(req.headers.cookie);
  const tokenFromCookie = cookies[cookieName];

  const authHeader = req.headers.authorization;
  const tokenFromHeader = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

  const token = tokenFromCookie || tokenFromHeader;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const secret = process.env.JWT_SECRET || "dev-secret";
    const payload = jwt.verify(token, secret) as { sub?: string; role?: Role };

    if (!payload.sub) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = { id: payload.sub, role: payload.role ?? "STUDENT" };
    return next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
