"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleMateria = exports.updateMateria = exports.createMateria = exports.listMaterias = void 0;
const pool_1 = require("../db/pool");
const validators_1 = require("../utils/validators");
const listMaterias = async (req, res) => {
    try {
        const includeAll = req.user?.role === "ADMIN" && req.query.all === "true";
        const sql = includeAll
            ? "SELECT * FROM materias ORDER BY creado_en DESC"
            : "SELECT * FROM materias WHERE activa = TRUE ORDER BY creado_en DESC";
        const result = await (0, pool_1.query)(sql);
        return res.json({ materias: result.rows });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error listando materias" });
    }
};
exports.listMaterias = listMaterias;
const createMateria = async (req, res) => {
    try {
        const { nombre, descripcion, icono, color } = req.body;
        if (!(0, validators_1.isNonEmpty)(nombre)) {
            return res.status(400).json({ message: "Nombre requerido" });
        }
        const result = await (0, pool_1.query)("INSERT INTO materias (nombre, descripcion, icono, color) VALUES ($1, $2, $3, $4) RETURNING *", [nombre, descripcion || null, icono || null, color || null]);
        return res.status(201).json({ materia: result.rows[0] });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error creando materia" });
    }
};
exports.createMateria = createMateria;
const updateMateria = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, icono, color } = req.body;
        const fields = [];
        const values = [];
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
        const result = await (0, pool_1.query)(sql, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Materia no encontrada" });
        }
        return res.json({ materia: result.rows[0] });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error actualizando materia" });
    }
};
exports.updateMateria = updateMateria;
const toggleMateria = async (req, res) => {
    try {
        const { id } = req.params;
        const { activa } = req.body;
        let result;
        if (typeof activa === "boolean") {
            result = await (0, pool_1.query)("UPDATE materias SET activa = $2 WHERE id = $1 RETURNING *", [id, activa]);
        }
        else {
            result = await (0, pool_1.query)("UPDATE materias SET activa = NOT activa WHERE id = $1 RETURNING *", [id]);
        }
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Materia no encontrada" });
        }
        return res.json({ materia: result.rows[0] });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error actualizando materia" });
    }
};
exports.toggleMateria = toggleMateria;
