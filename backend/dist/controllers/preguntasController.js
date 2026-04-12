"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.togglePregunta = exports.updatePregunta = exports.createPregunta = exports.listPreguntas = void 0;
const pool_1 = require("../db/pool");
const validators_1 = require("../utils/validators");
const defaultPeso = (nivel) => {
    if (nivel === "FACIL")
        return 1;
    if (nivel === "MEDIO")
        return 2;
    return 3;
};
const parsePeso = (peso) => {
    if (peso === undefined || peso === null || peso === "") {
        return undefined;
    }
    const parsed = typeof peso === "number" ? peso : Number(peso);
    if (!Number.isFinite(parsed))
        return null;
    const rounded = Math.round(parsed);
    if (rounded < 1 || rounded > 5)
        return null;
    return rounded;
};
const sanitizeOpciones = (opciones) => {
    if (typeof opciones === "string") {
        try {
            opciones = JSON.parse(opciones);
        }
        catch {
            return [];
        }
    }
    if (!Array.isArray(opciones))
        return [];
    return opciones.map((opcion) => ({
        id: opcion.id,
        texto: opcion.texto,
    }));
};
const listPreguntas = async (req, res) => {
    try {
        const { materiaId } = req.params;
        const nivel = req.query.nivel;
        const includeAll = req.user?.role === "ADMIN" && req.query.all === "true";
        const conditions = ["materia_id = $1"];
        const values = [materiaId];
        if (!includeAll) {
            conditions.push("activa = TRUE");
        }
        if (nivel) {
            if (!(0, validators_1.isNivel)(nivel)) {
                return res.status(400).json({ message: "Nivel inválido" });
            }
            values.push(nivel);
            conditions.push(`nivel = $${values.length}`);
        }
        const sql = `SELECT * FROM preguntas WHERE ${conditions.join(" AND ")} ORDER BY creado_en DESC`;
        const result = await (0, pool_1.query)(sql, values);
        const preguntas = result.rows.map((row) => {
            if (req.user?.role === "ADMIN")
                return row;
            return {
                ...row,
                opciones: sanitizeOpciones(row.opciones),
            };
        });
        return res.json({ preguntas });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error listando preguntas" });
    }
};
exports.listPreguntas = listPreguntas;
const createPregunta = async (req, res) => {
    try {
        const { materiaId, nivel, enunciado, opciones, subtema, peso } = req.body;
        if (!materiaId || !nivel || !enunciado) {
            return res.status(400).json({ message: "Datos incompletos" });
        }
        if (!(0, validators_1.isNivel)(nivel)) {
            return res.status(400).json({ message: "Nivel inválido" });
        }
        const parsedPeso = parsePeso(peso);
        if (parsedPeso === null) {
            return res.status(400).json({ message: "Peso inválido (1 a 5)" });
        }
        const resolvedPeso = parsedPeso ?? defaultPeso(nivel);
        const validation = (0, validators_1.validateOpciones)(opciones);
        if (!validation.valid) {
            return res.status(400).json({ message: validation.message });
        }
        const result = await (0, pool_1.query)("INSERT INTO preguntas (materia_id, nivel, enunciado, subtema, opciones, peso) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *", [materiaId, nivel, enunciado, subtema || null, JSON.stringify(opciones), resolvedPeso]);
        return res.status(201).json({ pregunta: result.rows[0] });
    }
    catch (error) {
        console.error(error);
        const code = error.code;
        if (code === "42703") {
            return res.status(500).json({
                message: "Falta la columna peso en la tabla preguntas. Ejecuta la migración en Supabase.",
            });
        }
        return res.status(500).json({ message: "Error creando pregunta" });
    }
};
exports.createPregunta = createPregunta;
const updatePregunta = async (req, res) => {
    try {
        const { id } = req.params;
        const { nivel, enunciado, opciones, subtema, peso } = req.body;
        const fields = [];
        const values = [];
        if (nivel !== undefined) {
            if (!(0, validators_1.isNivel)(nivel)) {
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
            const validation = (0, validators_1.validateOpciones)(opciones);
            if (!validation.valid) {
                return res.status(400).json({ message: validation.message });
            }
            fields.push(`opciones = $${values.length + 1}`);
            values.push(JSON.stringify(opciones));
        }
        if (peso !== undefined) {
            const parsedPeso = parsePeso(peso);
            if (parsedPeso === null) {
                return res.status(400).json({ message: "Peso inválido (1 a 5)" });
            }
            fields.push(`peso = $${values.length + 1}`);
            values.push(parsedPeso);
        }
        if (fields.length === 0) {
            return res.status(400).json({ message: "No hay campos para actualizar" });
        }
        values.push(id);
        const sql = `UPDATE preguntas SET ${fields.join(", ")} WHERE id = $${values.length} RETURNING *`;
        const result = await (0, pool_1.query)(sql, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Pregunta no encontrada" });
        }
        return res.json({ pregunta: result.rows[0] });
    }
    catch (error) {
        console.error(error);
        const code = error.code;
        if (code === "42703") {
            return res.status(500).json({
                message: "Falta la columna peso en la tabla preguntas. Ejecuta la migración en Supabase.",
            });
        }
        return res.status(500).json({ message: "Error actualizando pregunta" });
    }
};
exports.updatePregunta = updatePregunta;
const togglePregunta = async (req, res) => {
    try {
        const { id } = req.params;
        const { activa } = req.body;
        let result;
        if (typeof activa === "boolean") {
            result = await (0, pool_1.query)("UPDATE preguntas SET activa = $2 WHERE id = $1 RETURNING *", [id, activa]);
        }
        else {
            result = await (0, pool_1.query)("UPDATE preguntas SET activa = NOT activa WHERE id = $1 RETURNING *", [id]);
        }
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Pregunta no encontrada" });
        }
        return res.json({ pregunta: result.rows[0] });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error actualizando pregunta" });
    }
};
exports.togglePregunta = togglePregunta;
