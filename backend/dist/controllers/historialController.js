"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listHistorial = void 0;
const pool_1 = require("../db/pool");
const listHistorial = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const materiaId = req.query.materiaId;
        const since = req.query.since;
        const conditions = ["h.user_id = $1"];
        const values = [req.user.id];
        if (materiaId) {
            values.push(materiaId);
            conditions.push(`h.materia_id = $${values.length}`);
        }
        if (since) {
            const parsed = new Date(since);
            if (Number.isNaN(parsed.getTime())) {
                return res.status(400).json({ message: "Fecha inválida" });
            }
            values.push(parsed.toISOString());
            conditions.push(`h.completado_en > $${values.length}`);
        }
        const sql = `
      SELECT h.*,
             m.nombre as materia_nombre,
             m.color as materia_color
      FROM historial_resultados h
      JOIN materias m ON m.id = h.materia_id
      WHERE ${conditions.join(" AND ")}
      ORDER BY h.completado_en ASC
    `;
        const result = await (0, pool_1.query)(sql, values);
        return res.json({ historial: result.rows });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error obteniendo historial" });
    }
};
exports.listHistorial = listHistorial;
