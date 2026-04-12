"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOpciones = exports.isNivel = exports.isNonEmpty = exports.isEmail = void 0;
const isEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};
exports.isEmail = isEmail;
const isNonEmpty = (value) => {
    return typeof value === "string" && value.trim().length > 0;
};
exports.isNonEmpty = isNonEmpty;
const isNivel = (value) => {
    return value === "FACIL" || value === "MEDIO" || value === "ALTO";
};
exports.isNivel = isNivel;
const validateOpciones = (opciones) => {
    if (!Array.isArray(opciones)) {
        return { valid: false, message: "Opciones debe ser un arreglo" };
    }
    if (opciones.length < 3 || opciones.length > 5) {
        return { valid: false, message: "Opciones debe tener entre 3 y 5 elementos" };
    }
    let correctas = 0;
    for (const opcion of opciones) {
        if (typeof opcion !== "object" || opcion === null) {
            return { valid: false, message: "Cada opción debe ser un objeto" };
        }
        const { id, texto, correcta } = opcion;
        if (typeof id !== "number" || !Number.isInteger(id)) {
            return { valid: false, message: "Cada opción debe tener un id numérico" };
        }
        if (typeof texto !== "string" || texto.trim().length === 0) {
            return { valid: false, message: "Cada opción debe tener texto" };
        }
        if (typeof correcta !== "boolean") {
            return { valid: false, message: "Cada opción debe indicar si es correcta" };
        }
        if (correcta) {
            correctas += 1;
        }
    }
    if (correctas !== 1) {
        return { valid: false, message: "Debe existir exactamente una opción correcta" };
    }
    return { valid: true };
};
exports.validateOpciones = validateOpciones;
