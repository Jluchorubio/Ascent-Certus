"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.logout = exports.verify2FA = exports.register = exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const pool_1 = require("../db/pool");
const codeGenerator_1 = require("../utils/codeGenerator");
const mailer_1 = require("../services/mailer");
const validators_1 = require("../utils/validators");
const cookieName = process.env.COOKIE_NAME || "access_token";
const isProd = process.env.NODE_ENV === "production";
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!(0, validators_1.isEmail)(email || "") || !(0, validators_1.isNonEmpty)(password)) {
            return res.status(400).json({ message: "Credenciales inválidas" });
        }
        const { rows } = await (0, pool_1.query)("SELECT id, nombre, email, password_hash, rol, activo FROM usuarios WHERE email = $1 LIMIT 1", [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }
        const user = rows[0];
        if (!user.activo) {
            return res.status(403).json({ message: "Usuario inactivo" });
        }
        const ok = await bcryptjs_1.default.compare(password || "", user.password_hash);
        if (!ok) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }
        const disable2FA = process.env.DISABLE_2FA === "true";
        if (disable2FA) {
            const secret = process.env.JWT_SECRET || "dev-secret";
            const token = jsonwebtoken_1.default.sign({ role: user.rol, email: user.email }, secret, { subject: user.id, expiresIn: "2h" });
            res.cookie(cookieName, token, {
                httpOnly: true,
                sameSite: "lax",
                secure: isProd,
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
        const code = (0, codeGenerator_1.generate6DigitCode)();
        await (0, pool_1.query)("INSERT INTO codigos_2fa (user_id, codigo, expira_en) VALUES ($1, $2, NOW() + interval '10 minutes')", [user.id, code]);
        await (0, mailer_1.send2FACode)(user.email, code);
        return res.json({
            ok: true,
            requires2FA: true,
            message: "Código enviado al correo",
            userId: user.id,
            email: user.email,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al iniciar sesión" });
    }
};
exports.login = login;
const register = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;
        if (!(0, validators_1.isNonEmpty)(nombre)) {
            return res.status(400).json({ message: "Nombre requerido" });
        }
        if (!(0, validators_1.isEmail)(email || "")) {
            return res.status(400).json({ message: "Email inválido" });
        }
        if (!(0, validators_1.isNonEmpty)(password) || (password || "").length < 6) {
            return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
        }
        const exists = await (0, pool_1.query)("SELECT id FROM usuarios WHERE email = $1 LIMIT 1", [email]);
        if (exists.rows.length > 0) {
            return res.status(409).json({ message: "El email ya está registrado" });
        }
        const hash = await bcryptjs_1.default.hash(password, 10);
        const result = await (0, pool_1.query)("INSERT INTO usuarios (nombre, email, password_hash, rol, activo) VALUES ($1, $2, $3, 'STUDENT', TRUE) RETURNING id, nombre, email, rol", [nombre, email, hash]);
        return res.status(201).json({ ok: true, user: result.rows[0] });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error creando usuario" });
    }
};
exports.register = register;
const verify2FA = async (req, res) => {
    try {
        const { userId, code } = req.body;
        if (!(0, validators_1.isNonEmpty)(userId) || !(0, validators_1.isNonEmpty)(code)) {
            return res.status(400).json({ message: "Código inválido" });
        }
        const codeResult = await (0, pool_1.query)("SELECT id, expira_en, usado FROM codigos_2fa WHERE user_id = $1 AND codigo = $2 ORDER BY creado_en DESC LIMIT 1", [userId, code]);
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
        await (0, pool_1.query)("UPDATE codigos_2fa SET usado = TRUE WHERE id = $1", [record.id]);
        const userResult = await (0, pool_1.query)("SELECT id, nombre, email, rol, activo FROM usuarios WHERE id = $1 LIMIT 1", [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        const user = userResult.rows[0];
        if (!user.activo) {
            return res.status(403).json({ message: "Usuario inactivo" });
        }
        const secret = process.env.JWT_SECRET || "dev-secret";
        const token = jsonwebtoken_1.default.sign({ role: user.rol, email: user.email }, secret, { subject: user.id, expiresIn: "2h" });
        res.cookie(cookieName, token, {
            httpOnly: true,
            sameSite: "lax",
            secure: isProd,
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
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al verificar código" });
    }
};
exports.verify2FA = verify2FA;
const logout = async (_req, res) => {
    res.clearCookie(cookieName, { httpOnly: true, sameSite: "lax", secure: isProd });
    return res.json({ ok: true });
};
exports.logout = logout;
const me = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const result = await (0, pool_1.query)("SELECT id, nombre, email, rol FROM usuarios WHERE id = $1 LIMIT 1", [req.user.id]);
    if (result.rows.length === 0) {
        return res.status(404).json({ message: "Usuario no encontrado" });
    }
    return res.json({ user: result.rows[0] });
};
exports.me = me;
