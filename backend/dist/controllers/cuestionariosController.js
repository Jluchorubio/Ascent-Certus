"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleCuestionario = exports.updateCuestionario = exports.createCuestionario = exports.listCuestionarios = void 0;
const pool_1 = require("../db/pool");
const validators_1 = require("../utils/validators");
const listCuestionarios = async (req, res) => {
    try {
        const includeAll = req.user?.role === "ADMIN" && req.query.all === "true";
        const materiaId = req.query.materiaId;
        const conditions = [];
        const values = [];
        if (!includeAll) {
            conditions.push("activo = TRUE");
            conditions.push("(fecha_inicio IS NULL OR fecha_inicio <= NOW())");
            conditions.push("(fecha_fin IS NULL OR fecha_fin >= NOW())");
        }
        if (materiaId) {
            values.push(materiaId);
            conditions.push(`materia_id = $${values.length}`);
        }
        const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
        const result = await (0, pool_1.query)(`SELECT * FROM cuestionarios ${where} ORDER BY creado_en DESC`, values);
        return res.json({ cuestionarios: result.rows });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error listando cuestionarios" });
    }
};
exports.listCuestionarios = listCuestionarios;
const createCuestionario = async (req, res) => {
    try {
        const { materiaId, nombre, cantidadPreguntas, tiempoMinutos, fechaInicio, fechaFin } = req.body;
        if (!materiaId || !(0, validators_1.isNonEmpty)(nombre) || !cantidadPreguntas) {
            return res.status(400).json({ message: "Datos incompletos" });
        }
        const result = await (0, pool_1.query)("INSERT INTO cuestionarios (materia_id, nombre, cantidad_preguntas, tiempo_minutos, fecha_inicio, fecha_fin) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *", [
            materiaId,
            nombre,
            cantidadPreguntas,
            tiempoMinutos || 15,
            fechaInicio || null,
            fechaFin || null,
        ]);
        return res.status(201).json({ cuestionario: result.rows[0] });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error creando cuestionario" });
    }
};
exports.createCuestionario = createCuestionario;
const updateCuestionario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, cantidadPreguntas, tiempoMinutos, fechaInicio, fechaFin } = req.body;
        const fields = [];
        const values = [];
        if (nombre !== undefined) {
            fields.push(`nombre = $${values.length + 1}`);
            values.push(nombre);
        }
        if (cantidadPreguntas !== undefined) {
            fields.push(`cantidad_preguntas = $${values.length + 1}`);
            values.push(cantidadPreguntas);
        }
        if (tiempoMinutos !== undefined) {
            fields.push(`tiempo_minutos = $${values.length + 1}`);
            values.push(tiempoMinutos);
        }
        if (fechaInicio !== undefined) {
            fields.push(`fecha_inicio = $${values.length + 1}`);
            values.push(fechaInicio);
        }
        if (fechaFin !== undefined) {
            fields.push(`fecha_fin = $${values.length + 1}`);
            values.push(fechaFin);
        }
        if (fields.length === 0) {
            return res.status(400).json({ message: "No hay campos para actualizar" });
        }
        values.push(id);
        const sql = `UPDATE cuestionarios SET ${fields.join(", ")} WHERE id = $${values.length} RETURNING *`;
        const result = await (0, pool_1.query)(sql, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Cuestionario no encontrado" });
        }
        return res.json({ cuestionario: result.rows[0] });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error actualizando cuestionario" });
    }
};
exports.updateCuestionario = updateCuestionario;
const toggleCuestionario = async (req, res) => {
    try {
        const { id } = req.params;
        const { activo } = req.body;
        let result;
        if (typeof activo === "boolean") {
            result = await (0, pool_1.query)("UPDATE cuestionarios SET activo = $2 WHERE id = $1 RETURNING *", [id, activo]);
        }
        else {
            result = await (0, pool_1.query)("UPDATE cuestionarios SET activo = NOT activo WHERE id = $1 RETURNING *", [id]);
        }
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Cuestionario no encontrado" });
        }
        return res.json({ cuestionario: result.rows[0] });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error actualizando cuestionario" });
    }
};
exports.toggleCuestionario = toggleCuestionario;
