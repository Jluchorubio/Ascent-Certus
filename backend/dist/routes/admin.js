"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const roleGuard_1 = require("../middleware/roleGuard");
const router = (0, express_1.Router)();
router.post("/students", authMiddleware_1.authMiddleware, (0, roleGuard_1.roleGuard)("ADMIN"), adminController_1.createStudent);
exports.default = router;
