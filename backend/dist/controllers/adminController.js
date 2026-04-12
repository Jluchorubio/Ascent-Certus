"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStudent = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const pool_1 = require("../db/pool");
const validators_1 = require("../utils/validators");
const createStudent = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;
        if (!(0, validators_1.isNonEmpty)(nombre) || !(0, validators_1.isEmail)(email || "") || !(0, validators_1.isNonEmpty)(password)) {
            return res.status(400).json({ message: "Datos inválidos" });
        }
        const exists = await (0, pool_1.query)("SELECT id FROM usuarios WHERE email = $1", [email]);
        if (exists.rows.length > 0) {
            return res.status(409).json({ message: "El email ya existe" });
        }
        const hash = await bcryptjs_1.default.hash(password || "", 10);
        const result = await (0, pool_1.query)("INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES ($1, $2, $3, 'STUDENT') RETURNING id, nombre, email, rol", [nombre, email, hash]);
        return res.status(201).json({ user: result.rows[0] });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error creando estudiante" });
    }
};
exports.createStudent = createStudent;
