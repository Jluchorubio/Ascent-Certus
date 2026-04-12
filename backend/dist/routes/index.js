"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const materias_1 = __importDefault(require("./materias"));
const preguntas_1 = __importDefault(require("./preguntas"));
const cuestionarios_1 = __importDefault(require("./cuestionarios"));
const sesiones_1 = __importDefault(require("./sesiones"));
const admin_1 = __importDefault(require("./admin"));
const historial_1 = __importDefault(require("./historial"));
const pool_1 = require("../db/pool");
const router = (0, express_1.Router)();
router.get("/", (_req, res) => {
    res.json({
        version: "v1",
        endpoints: {
            auth: "/api/v1/auth",
            materias: "/api/v1/materias",
            preguntas: "/api/v1/preguntas",
            cuestionarios: "/api/v1/cuestionarios",
            sesiones: "/api/v1/sesiones",
            admin: "/api/v1/admin",
            historial: "/api/v1/historial",
            health: "/health",
            db: "/api/v1/health/db",
        },
    });
});
router.get("/health/db", async (_req, res) => {
    try {
        await (0, pool_1.query)("SELECT 1");
        res.json({ ok: true });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: "DB no disponible" });
    }
});
router.use("/auth", auth_1.default);
router.use("/materias", materias_1.default);
router.use("/preguntas", preguntas_1.default);
router.use("/cuestionarios", cuestionarios_1.default);
router.use("/sesiones", sesiones_1.default);
router.use("/admin", admin_1.default);
router.use("/historial", historial_1.default);
exports.default = router;
