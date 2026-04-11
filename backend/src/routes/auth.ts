import { Router } from "express";
import { login, verify2FA, logout, me } from "../controllers/authController";

const router = Router();

router.post("/login", login);
router.post("/verify-2fa", verify2FA);
router.post("/logout", logout);
router.get("/me", me);

export default router;
