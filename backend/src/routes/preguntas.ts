import { Router } from "express";
import { listPreguntas, createPregunta, updatePregunta, togglePregunta } from "../controllers/preguntasController";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleGuard } from "../middleware/roleGuard";

const router = Router();

router.get("/materia/:materiaId", authMiddleware, listPreguntas);
router.post("/", authMiddleware, roleGuard("ADMIN"), createPregunta);
router.patch("/:id", authMiddleware, roleGuard("ADMIN"), updatePregunta);
router.patch("/:id/toggle", authMiddleware, roleGuard("ADMIN"), togglePregunta);

export default router;
