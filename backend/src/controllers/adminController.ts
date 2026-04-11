import { Response } from "express";
import bcrypt from "bcryptjs";

import { AuthRequest } from "../middleware/authMiddleware";
import { query } from "../db/pool";
import { isEmail, isNonEmpty } from "../utils/validators";

export const createStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { nombre, email, password } = req.body as {
      nombre?: string;
      email?: string;
      password?: string;
    };

    if (!isNonEmpty(nombre) || !isEmail(email || "") || !isNonEmpty(password)) {
      return res.status(400).json({ message: "Datos inválidos" });
    }

    const exists = await query("SELECT id FROM usuarios WHERE email = $1", [email]);
    if (exists.rows.length > 0) {
      return res.status(409).json({ message: "El email ya existe" });
    }

    const hash = await bcrypt.hash(password || "", 10);

    const result = await query(
      "INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES ($1, $2, $3, 'STUDENT') RETURNING id, nombre, email, rol",
      [nombre, email, hash]
    );

    return res.status(201).json({ user: result.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error creando estudiante" });
  }
};
