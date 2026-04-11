import { Response } from "express";

import { AuthRequest } from "../middleware/authMiddleware";
import { query } from "../db/pool";
import { isNivel, validateOpciones } from "../utils/validators";

const sanitizeOpciones = (opciones: unknown) => {
  if (typeof opciones === "string") {
    try {
      opciones = JSON.parse(opciones);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(opciones)) return [];

  return opciones.map((opcion) => ({
    id: opcion.id,
    texto: opcion.texto,
  }));
};

export const listPreguntas = async (req: AuthRequest, res: Response) => {
  try {
    const { materiaId } = req.params;
    const nivel = req.query.nivel as string | undefined;
    const includeAll = req.user?.role === "ADMIN" && req.query.all === "true";

    const conditions: string[] = ["materia_id = $1"];
    const values: unknown[] = [materiaId];

    if (!includeAll) {
      conditions.push("activa = TRUE");
    }

    if (nivel) {
      if (!isNivel(nivel)) {
        return res.status(400).json({ message: "Nivel inválido" });
      }
      values.push(nivel);
      conditions.push(`nivel = $${values.length}`);
    }

    const sql = `SELECT * FROM preguntas WHERE ${conditions.join(" AND ")} ORDER BY creado_en DESC`;
    const result = await query(sql, values);

    const preguntas = result.rows.map((row) => {
      if (req.user?.role === "ADMIN") return row;
      return {
        ...row,
        opciones: sanitizeOpciones(row.opciones),
      };
    });

    return res.json({ preguntas });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error listando preguntas" });
  }
};

export const createPregunta = async (req: AuthRequest, res: Response) => {
  try {
    const { materiaId, nivel, enunciado, opciones, subtema } = req.body as {
      materiaId?: string;
      nivel?: string;
      enunciado?: string;
      opciones?: unknown;
      subtema?: string;
    };

    if (!materiaId || !nivel || !enunciado) {
      return res.status(400).json({ message: "Datos incompletos" });
    }

    if (!isNivel(nivel)) {
      return res.status(400).json({ message: "Nivel inválido" });
    }

    const validation = validateOpciones(opciones);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }

    const result = await query(
      "INSERT INTO preguntas (materia_id, nivel, enunciado, subtema, opciones) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [materiaId, nivel, enunciado, subtema || null, JSON.stringify(opciones)]
    );

    return res.status(201).json({ pregunta: result.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error creando pregunta" });
  }
};

export const updatePregunta = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { nivel, enunciado, opciones, subtema } = req.body as {
      nivel?: string;
      enunciado?: string;
      opciones?: unknown;
      subtema?: string;
    };

    const fields: string[] = [];
    const values: unknown[] = [];

    if (nivel !== undefined) {
      if (!isNivel(nivel)) {
        return res.status(400).json({ message: "Nivel inválido" });
      }
      fields.push(`nivel = $${values.length + 1}`);
      values.push(nivel);
    }

    if (enunciado !== undefined) {
      fields.push(`enunciado = $${values.length + 1}`);
      values.push(enunciado);
    }

    if (subtema !== undefined) {
      fields.push(`subtema = $${values.length + 1}`);
      values.push(subtema);
    }

    if (opciones !== undefined) {
      const validation = validateOpciones(opciones);
      if (!validation.valid) {
        return res.status(400).json({ message: validation.message });
      }
      fields.push(`opciones = $${values.length + 1}`);
      values.push(JSON.stringify(opciones));
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: "No hay campos para actualizar" });
    }

    values.push(id);
    const sql = `UPDATE preguntas SET ${fields.join(", ")} WHERE id = $${values.length} RETURNING *`;
    const result = await query(sql, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Pregunta no encontrada" });
    }

    return res.json({ pregunta: result.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error actualizando pregunta" });
  }
};

export const togglePregunta = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { activa } = req.body as { activa?: boolean };

    let result;
    if (typeof activa === "boolean") {
      result = await query("UPDATE preguntas SET activa = $2 WHERE id = $1 RETURNING *", [id, activa]);
    } else {
      result = await query("UPDATE preguntas SET activa = NOT activa WHERE id = $1 RETURNING *", [id]);
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Pregunta no encontrada" });
    }

    return res.json({ pregunta: result.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error actualizando pregunta" });
  }
};
