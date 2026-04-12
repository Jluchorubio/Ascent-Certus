"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcularResultado = void 0;
const calcularResultado = (respuestas) => {
    if (respuestas.length === 0) {
        return {
            puntajeNumerico: 1,
            nivelFinal: "BAJO",
            proporcionPorNivel: { 1: 0, 2: 0, 3: 0 },
            tendencia: "plana",
        };
    }
    const total = respuestas.length;
    const counts = { 1: 0, 2: 0, 3: 0 };
    let correctSum = 0;
    let correctCount = 0;
    const levels = [];
    for (const respuesta of respuestas) {
        counts[respuesta.nivel] += 1;
        levels.push(respuesta.nivel);
        if (respuesta.correcta) {
            correctSum += respuesta.nivel;
            correctCount += 1;
        }
    }
    const avgCorrect = correctCount ? correctSum / correctCount : 1;
    const proporcionPorNivel = {
        1: counts[1] / total,
        2: counts[2] / total,
        3: counts[3] / total,
    };
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;
    const n = levels.length;
    for (let i = 0; i < n; i += 1) {
        const x = i + 1;
        const y = levels[i];
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumXX += x * x;
    }
    const denominator = n * sumXX - sumX * sumX;
    const slope = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator;
    let tendencia = "plana";
    if (slope > 0.05)
        tendencia = "ascendente";
    if (slope < -0.05)
        tendencia = "descendente";
    const puntajeNumerico = avgCorrect >= 2.5 ? 3 : avgCorrect <= 1.5 ? 1 : 2;
    let nivelFinal = "MEDIO";
    if (puntajeNumerico === 3 && tendencia === "ascendente" && proporcionPorNivel[3] >= 0.3) {
        nivelFinal = "ALTO";
    }
    else if (puntajeNumerico === 1 && proporcionPorNivel[1] >= 0.5) {
        nivelFinal = "BAJO";
    }
    return {
        puntajeNumerico,
        nivelFinal,
        proporcionPorNivel,
        tendencia,
    };
};
exports.calcularResultado = calcularResultado;
