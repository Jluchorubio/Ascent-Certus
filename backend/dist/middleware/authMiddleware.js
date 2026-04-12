"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const parseCookies = (cookieHeader) => {
    const cookies = {};
    if (!cookieHeader)
        return cookies;
    const parts = cookieHeader.split(";");
    for (const part of parts) {
        const trimmed = part.trim();
        if (!trimmed)
            continue;
        const [key, ...rest] = trimmed.split("=");
        if (!key)
            continue;
        cookies[key] = decodeURIComponent(rest.join("="));
    }
    return cookies;
};
const authMiddleware = (req, res, next) => {
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
        const payload = jsonwebtoken_1.default.verify(token, secret);
        if (!payload.sub) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        req.user = { id: payload.sub, role: payload.role ?? "STUDENT" };
        return next();
    }
    catch {
        return res.status(401).json({ message: "Unauthorized" });
    }
};
exports.authMiddleware = authMiddleware;
