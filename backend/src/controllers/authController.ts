import { Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { AuthRequest } from "../middleware/authMiddleware";
import { query } from "../db/pool";
import { generate6DigitCode } from "../utils/codeGenerator";
import { send2FACode } from "../services/mailer";
import { isEmail, isNonEmpty } from "../utils/validators";

const cookieName = process.env.COOKIE_NAME || "access_token";
const isProd = process.env.NODE_ENV === "production";
const cookieSameSite = (process.env.COOKIE_SAMESITE as "lax" | "strict" | "none") || (isProd ? "none" : "lax");
const cookieSecure = process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === "true" : isProd;

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!isEmail(email || "") || !isNonEmpty(password)) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    const { rows } = await query(
      "SELECT id, nombre, email, password_hash, rol, activo FROM usuarios WHERE email = $1 LIMIT 1",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const user = rows[0];

    if (!user.activo) {
      return res.status(403).json({ message: "Usuario inactivo" });
    }

    const ok = await bcrypt.compare(password || "", user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const disable2FA = process.env.DISABLE_2FA === "true";
    if (disable2FA) {
      const secret = process.env.JWT_SECRET || "dev-secret";
      const token = jwt.sign(
        { role: user.rol, email: user.email },
        secret,
        { subject: user.id, expiresIn: "2h" }
      );

      res.cookie(cookieName, token, {
        httpOnly: true,
        sameSite: cookieSameSite,
        secure: cookieSecure,
        maxAge: 2 * 60 * 60 * 1000,
      });

      return res.json({
        ok: true,
        requires2FA: false,
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol,
        },
      });
    }

    const code = generate6DigitCode();
    await query(
      "INSERT INTO codigos_2fa (user_id, codigo, expira_en) VALUES ($1, $2, NOW() + interval '10 minutes')",
      [user.id, code]
    );

    await send2FACode(user.email, code);

    return res.json({
      ok: true,
      requires2FA: true,
      message: "Código enviado al correo",
      userId: user.id,
      email: user.email,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al iniciar sesión" });
  }
};

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { nombre, email, password } = req.body as { nombre?: string; email?: string; password?: string };

    if (!isNonEmpty(nombre)) {
      return res.status(400).json({ message: "Nombre requerido" });
    }
    if (!isEmail(email || "")) {
      return res.status(400).json({ message: "Email inválido" });
    }
    if (!isNonEmpty(password) || (password || "").length < 6) {
      return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
    }

    const exists = await query("SELECT id FROM usuarios WHERE email = $1 LIMIT 1", [email]);
    if (exists.rows.length > 0) {
      return res.status(409).json({ message: "El email ya está registrado" });
    }

    const hash = await bcrypt.hash(password as string, 10);
    const result = await query(
      "INSERT INTO usuarios (nombre, email, password_hash, rol, activo) VALUES ($1, $2, $3, 'STUDENT', TRUE) RETURNING id, nombre, email, rol",
      [nombre, email, hash]
    );

    return res.status(201).json({ ok: true, user: result.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error creando usuario" });
  }
};

export const verify2FA = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, code } = req.body as { userId?: string; code?: string };

    if (!isNonEmpty(userId) || !isNonEmpty(code)) {
      return res.status(400).json({ message: "Código inválido" });
    }

    const codeResult = await query(
      "SELECT id, expira_en, usado FROM codigos_2fa WHERE user_id = $1 AND codigo = $2 ORDER BY creado_en DESC LIMIT 1",
      [userId, code]
    );

    if (codeResult.rows.length === 0) {
      return res.status(400).json({ message: "Código inválido" });
    }

    const record = codeResult.rows[0];
    if (record.usado) {
      return res.status(400).json({ message: "Código ya usado" });
    }

    const expiraEn = new Date(record.expira_en);
    if (expiraEn.getTime() < Date.now()) {
      return res.status(400).json({ message: "Código expirado" });
    }

    await query("UPDATE codigos_2fa SET usado = TRUE WHERE id = $1", [record.id]);

    const userResult = await query(
      "SELECT id, nombre, email, rol, activo FROM usuarios WHERE id = $1 LIMIT 1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = userResult.rows[0];

    if (!user.activo) {
      return res.status(403).json({ message: "Usuario inactivo" });
    }

    const secret = process.env.JWT_SECRET || "dev-secret";
    const token = jwt.sign(
      { role: user.rol, email: user.email },
      secret,
      { subject: user.id, expiresIn: "2h" }
    );

    res.cookie(cookieName, token, {
      httpOnly: true,
      sameSite: cookieSameSite,
      secure: cookieSecure,
      maxAge: 2 * 60 * 60 * 1000,
    });

    return res.json({
      ok: true,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al verificar código" });
  }
};

export const logout = async (_req: AuthRequest, res: Response) => {
  res.clearCookie(cookieName, { httpOnly: true, sameSite: cookieSameSite, secure: cookieSecure });
  return res.json({ ok: true });
};

export const me = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const result = await query(
    "SELECT id, nombre, email, rol FROM usuarios WHERE id = $1 LIMIT 1",
    [req.user.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }

  return res.json({ user: result.rows[0] });
};
