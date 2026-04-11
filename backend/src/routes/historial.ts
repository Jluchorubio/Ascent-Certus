import { Router } from "express";
import { listHistorial } from "../controllers/historialController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/", authMiddleware, listHistorial);

export default router;
