import { Router } from "express";

import authRoutes from "./auth";
import materiasRoutes from "./materias";
import preguntasRoutes from "./preguntas";
import cuestionariosRoutes from "./cuestionarios";
import sesionesRoutes from "./sesiones";
import adminRoutes from "./admin";
import historialRoutes from "./historial";
import { query } from "../db/pool";

const router = Router();

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
    await query("SELECT 1");
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: "DB no disponible" });
  }
});

router.use("/auth", authRoutes);
router.use("/materias", materiasRoutes);
router.use("/preguntas", preguntasRoutes);
router.use("/cuestionarios", cuestionariosRoutes);
router.use("/sesiones", sesionesRoutes);
router.use("/admin", adminRoutes);
router.use("/historial", historialRoutes);

export default router;
