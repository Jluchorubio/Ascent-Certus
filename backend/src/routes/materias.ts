import { Router } from "express";
import { listMaterias, createMateria, updateMateria, toggleMateria } from "../controllers/materiasController";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleGuard } from "../middleware/roleGuard";

const router = Router();

router.get("/", authMiddleware, listMaterias);
router.post("/", authMiddleware, roleGuard("ADMIN"), createMateria);
router.patch("/:id", authMiddleware, roleGuard("ADMIN"), updateMateria);
router.patch("/:id/toggle", authMiddleware, roleGuard("ADMIN"), toggleMateria);

export default router;
