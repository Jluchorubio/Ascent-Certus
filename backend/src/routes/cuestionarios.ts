import { Router } from "express";
import { listCuestionarios, createCuestionario, updateCuestionario, toggleCuestionario } from "../controllers/cuestionariosController";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleGuard } from "../middleware/roleGuard";

const router = Router();

router.get("/", authMiddleware, listCuestionarios);
router.post("/", authMiddleware, roleGuard("ADMIN"), createCuestionario);
router.patch("/:id", authMiddleware, roleGuard("ADMIN"), updateCuestionario);
router.patch("/:id/toggle", authMiddleware, roleGuard("ADMIN"), toggleCuestionario);

export default router;
