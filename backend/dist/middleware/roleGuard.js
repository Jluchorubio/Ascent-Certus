"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleGuard = void 0;
const roleGuard = (requiredRole) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (req.user.role !== requiredRole) {
            return res.status(403).json({ message: "Forbidden" });
        }
        return next();
    };
};
exports.roleGuard = roleGuard;
