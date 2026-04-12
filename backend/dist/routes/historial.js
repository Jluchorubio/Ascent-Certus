"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const historialController_1 = require("../controllers/historialController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get("/", authMiddleware_1.authMiddleware, historialController_1.listHistorial);
exports.default = router;
