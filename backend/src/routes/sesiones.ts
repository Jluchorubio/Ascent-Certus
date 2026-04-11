import { Router } from "express";
import { startSesion, answerPregunta, finishSesion, getSesion } from "../controllers/sesionesController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/start", authMiddleware, startSesion);
router.post("/:id/answer", authMiddleware, answerPregunta);
router.post("/:id/finish", authMiddleware, finishSesion);
router.get("/:id", authMiddleware, getSesion);

export default router;
