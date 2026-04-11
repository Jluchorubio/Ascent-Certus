import { Response } from "express";

import { AuthRequest } from "../middleware/authMiddleware";
import { query } from "../db/pool";
import { isNonEmpty } from "../utils/validators";

export const listMaterias = async (req: AuthRequest, res: Response) => {
  try {
    const includeAll = req.user?.role === "ADMIN" && req.query.all === "true";

    const sql = includeAll
      ? "SELECT * FROM materias ORDER BY creado_en DESC"
      : "SELECT * FROM materias WHERE activa = TRUE ORDER BY creado_en DESC";

    const result = await query(sql);
    return res.json({ materias: result.rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error listando materias" });
  }
};

export const createMateria = async (req: AuthRequest, res: Response) => {
  try {
    const { nombre, descripcion, icono, color } = req.body as {
      nombre?: string;
      descripcion?: string;
      icono?: string;
      color?: string;
    };

    if (!isNonEmpty(nombre)) {
      return res.status(400).json({ message: "Nombre requerido" });
    }

    const result = await query(
      "INSERT INTO materias (nombre, descripcion, icono, color) VALUES ($1, $2, $3, $4) RETURNING *",
      [nombre, descripcion || null, icono || null, color || null]
    );

    return res.status(201).json({ materia: result.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error creando materia" });
  }
};

export const updateMateria = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, icono, color } = req.body as {
      nombre?: string;
      descripcion?: string;
      icono?: string;
      color?: string;
    };

    const fields: string[] = [];
    const values: unknown[] = [];

    if (nombre !== undefined) {
      fields.push(`nombre = $${values.length + 1}`);
      values.push(nombre);
    }
    if (descripcion !== undefined) {
      fields.push(`descripcion = $${values.length + 1}`);
      values.push(descripcion);
    }
    if (icono !== undefined) {
      fields.push(`icono = $${values.length + 1}`);
      values.push(icono);
    }
    if (color !== undefined) {
      fields.push(`color = $${values.length + 1}`);
      values.push(color);
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: "No hay campos para actualizar" });
    }

    values.push(id);
    const sql = `UPDATE materias SET ${fields.join(", ")} WHERE id = $${values.length} RETURNING *`;
    const result = await query(sql, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Materia no encontrada" });
    }

    return res.json({ materia: result.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error actualizando materia" });
  }
};

export const toggleMateria = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { activa } = req.body as { activa?: boolean };

    let result;
    if (typeof activa === "boolean") {
      result = await query("UPDATE materias SET activa = $2 WHERE id = $1 RETURNING *", [id, activa]);
    } else {
      result = await query("UPDATE materias SET activa = NOT activa WHERE id = $1 RETURNING *", [id]);
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Materia no encontrada" });
    }

    return res.json({ materia: result.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error actualizando materia" });
  }
};
