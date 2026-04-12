"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.siguienteNivel = exports.inicialState = void 0;
const inicialState = () => ({
    nivelActual: 2,
    incorrectasConsecutivas: 0,
});
exports.inicialState = inicialState;
const siguienteNivel = (state, fueCorrecta) => {
    if (fueCorrecta) {
        return {
            nivelActual: Math.min(3, state.nivelActual + 1),
            incorrectasConsecutivas: 0,
        };
    }
    const nuevasIncorrectas = state.incorrectasConsecutivas + 1;
    if (nuevasIncorrectas >= 2) {
        return {
            nivelActual: Math.max(1, state.nivelActual - 1),
            incorrectasConsecutivas: 0,
        };
    }
    return {
        nivelActual: state.nivelActual,
        incorrectasConsecutivas: nuevasIncorrectas,
    };
};
exports.siguienteNivel = siguienteNivel;
