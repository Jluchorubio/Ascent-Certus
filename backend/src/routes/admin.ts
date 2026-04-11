import { Router } from "express";
import { createStudent } from "../controllers/adminController";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleGuard } from "../middleware/roleGuard";

const router = Router();

router.post("/students", authMiddleware, roleGuard("ADMIN"), createStudent);

export default router;
