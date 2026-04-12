import { Response } from "express";

import { AuthRequest } from "../middleware/authMiddleware";
import { query } from "../db/pool";
import { inicialState, siguienteNivel, Nivel } from "../services/adaptiveEngine";
import { calcularResultado } from "../services/scoring";

interface OpcionPregunta {
  id: number;
  texto: string;
  correcta: boolean;
}

const nivelDbMap: Record<Nivel, "FACIL" | "MEDIO" | "ALTO"> = {
  1: "FACIL",
  2: "MEDIO",
  3: "ALTO",
};

const parseOpciones = (opciones: unknown): OpcionPregunta[] => {
  if (Array.isArray(opciones)) return opciones as OpcionPregunta[];
  if (typeof opciones === "string") return JSON.parse(opciones) as OpcionPregunta[];
  return [];
};

const sanitizeQuestion = (question: { id: string; enunciado: string; nivel: string; subtema?: string; opciones: unknown }) => {
  const opciones = parseOpciones(question.opciones).map((opcion) => ({
    id: opcion.id,
    texto: opcion.texto,
  }));

  return {
    id: question.id,
    enunciado: question.enunciado,
    nivel: question.nivel,
    subtema: question.subtema || null,
    opciones,
  };
};

const pickQuestion = async (
  materiaId: string,
  nivel: "FACIL" | "MEDIO" | "ALTO",
  excludeIds: string[]
) => {
  const exclude = excludeIds.length ? excludeIds : [];

  const result = await query(
    "SELECT id, enunciado, nivel, opciones, subtema FROM preguntas WHERE materia_id = $1 AND activa = TRUE AND nivel = $2 AND NOT (id = ANY($3::uuid[])) ORDER BY random() LIMIT 1",
    [materiaId, nivel, exclude]
  );

  if (result.rows.length > 0) return result.rows[0];

  const fallback = await query(
    "SELECT id, enunciado, nivel, opciones, subtema FROM preguntas WHERE materia_id = $1 AND activa = TRUE AND NOT (id = ANY($2::uuid[])) ORDER BY random() LIMIT 1",
    [materiaId, exclude]
  );

  return fallback.rows[0] || null;
};

const buildState = (respuestas: { es_correcta: boolean }[]) => {
  let state = inicialState();
  for (const respuesta of respuestas) {
    state = siguienteNivel(state, respuesta.es_correcta);
  }
  return state;
};

const finishSession = async (sessionId: string, userId: string) => {
  const sessionResult = await query(
    "SELECT s.id, s.iniciada_en, s.finalizada_en, s.tiempo_empleado_segundos, c.materia_id, c.id as cuestionario_id FROM sesiones s JOIN cuestionarios c ON c.id = s.cuestionario_id WHERE s.id = $1 AND s.user_id = $2",
    [sessionId, userId]
  );

  if (sessionResult.rows.length === 0) {
    return null;
  }

  const session = sessionResult.rows[0];

  const respuestasResult = await query(
    "SELECT es_correcta, nivel_pregunta FROM respuestas_sesion WHERE sesion_id = $1 ORDER BY orden ASC",
    [sessionId]
  );

  const respuestas = respuestasResult.rows.map((row) => ({
    correcta: row.es_correcta,
    nivel: row.nivel_pregunta === "FACIL" ? 1 : row.nivel_pregunta === "MEDIO" ? 2 : 3,
  })) as { correcta: boolean; nivel: Nivel }[];

  const resultado = calcularResultado(respuestas);

  const startedAt = new Date(session.iniciada_en);
  const elapsedSeconds = session.tiempo_empleado_segundos
    ? Number(session.tiempo_empleado_segundos)
    : Math.max(0, Math.floor((Date.now() - startedAt.getTime()) / 1000));

  if (!session.finalizada_en) {
    await query(
      "UPDATE sesiones SET finalizada_en = NOW(), nivel_final = $2, puntaje = $3, tiempo_empleado_segundos = $4 WHERE id = $1",
      [sessionId, resultado.nivelFinal, resultado.puntajeNumerico, elapsedSeconds]
    );

    await query(
      "INSERT INTO historial_resultados (user_id, cuestionario_id, materia_id, nivel_obtenido, puntaje_numerico, completado_en, tiempo_empleado_segundos) VALUES ($1, $2, $3, $4, $5, NOW(), $6)",
      [userId, session.cuestionario_id, session.materia_id, resultado.nivelFinal, resultado.puntajeNumerico, elapsedSeconds]
    );
  }

  const subtemaResult = await query(
    "SELECT p.subtema, COUNT(*)::int as total, SUM(CASE WHEN r.es_correcta THEN 1 ELSE 0 END)::int as correctas FROM respuestas_sesion r JOIN preguntas p ON p.id = r.pregunta_id WHERE r.sesion_id = $1 AND p.subtema IS NOT NULL AND p.subtema <> '' GROUP BY p.subtema ORDER BY p.subtema ASC",
    [sessionId]
  );

  const desgloseSubtemas = subtemaResult.rows.map((row) => ({
    subtema: row.subtema as string,
    total: Number(row.total),
    correctas: Number(row.correctas),
    porcentaje: row.total ? Math.round((Number(row.correctas) / Number(row.total)) * 100) : 0,
  }));

  const nivelResult = await query(
    "SELECT nivel_pregunta, COUNT(*)::int as total, SUM(CASE WHEN es_correcta THEN 1 ELSE 0 END)::int as correctas FROM respuestas_sesion WHERE sesion_id = $1 GROUP BY nivel_pregunta ORDER BY nivel_pregunta",
    [sessionId]
  );

  const desglosePorNivel = nivelResult.rows.map((row) => {
    const total = Number(row.total);
    const correctas = Number(row.correctas);
    return {
      nivel: row.nivel_pregunta as "FACIL" | "MEDIO" | "ALTO",
      total,
      correctas,
      porcentaje: total ? Math.round((correctas / total) * 100) : 0,
    };
  });

  return {
    resultado,
    tiempoEmpleadoSegundos: elapsedSeconds,
    desgloseSubtemas,
    desglosePorNivel,
  };
};

export const startSesion = async (req: AuthRequest, res: Response) => {
  try {
    const { cuestionarioId } = req.body as { cuestionarioId?: string };

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!cuestionarioId) {
      return res.status(400).json({ message: "Cuestionario requerido" });
    }

    const cuestionarioResult = await query(
      "SELECT * FROM cuestionarios WHERE id = $1 LIMIT 1",
      [cuestionarioId]
    );

    if (cuestionarioResult.rows.length === 0) {
      return res.status(404).json({ message: "Cuestionario no encontrado" });
    }

    const cuestionario = cuestionarioResult.rows[0];

    if (!cuestionario.activo) {
      return res.status(400).json({ message: "Cuestionario inactivo" });
    }

    const now = new Date();
    if (cuestionario.fecha_inicio && new Date(cuestionario.fecha_inicio) > now) {
      return res.status(400).json({ message: "Cuestionario fuera de fecha" });
    }
    if (cuestionario.fecha_fin && new Date(cuestionario.fecha_fin) < now) {
      return res.status(400).json({ message: "Cuestionario fuera de fecha" });
    }

    const sessionResult = await query(
      "INSERT INTO sesiones (user_id, cuestionario_id) VALUES ($1, $2) RETURNING *",
      [req.user.id, cuestionarioId]
    );

    const session = sessionResult.rows[0];

    const question = await pickQuestion(cuestionario.materia_id, "MEDIO", []);
    if (!question) {
      return res.status(400).json({ message: "No hay preguntas disponibles" });
    }

    return res.status(201).json({
      sesion: session,
      cuestionario: {
        id: cuestionario.id,
        nombre: cuestionario.nombre,
        cantidadPreguntas: cuestionario.cantidad_preguntas,
        tiempoMinutos: cuestionario.tiempo_minutos,
      },
      pregunta: sanitizeQuestion(question),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error iniciando sesión" });
  }
};

export const answerPregunta = async (req: AuthRequest, res: Response) => {
  try {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    const { preguntaId, opcionId } = req.body as { preguntaId?: string; opcionId?: number };

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!id) {
      return res.status(400).json({ message: "Sesión requerida" });
    }

    if (!preguntaId || typeof opcionId !== "number") {
      return res.status(400).json({ message: "Datos incompletos" });
    }

    const sessionResult = await query(
      "SELECT s.id, s.iniciada_en, s.finalizada_en, c.id as cuestionario_id, c.cantidad_preguntas, c.materia_id, c.tiempo_minutos FROM sesiones s JOIN cuestionarios c ON c.id = s.cuestionario_id WHERE s.id = $1 AND s.user_id = $2",
      [id, req.user.id]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ message: "Sesión no encontrada" });
    }

    const session = sessionResult.rows[0];

    if (session.finalizada_en) {
      return res.status(400).json({ message: "La sesión ya finalizó" });
    }

    const startedAt = new Date(session.iniciada_en);
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - startedAt.getTime()) / 1000));
    const maxSeconds = session.tiempo_minutos ? Number(session.tiempo_minutos) * 60 : null;

    if (maxSeconds !== null && elapsedSeconds >= maxSeconds) {
      await query("UPDATE sesiones SET tiempo_empleado_segundos = $2 WHERE id = $1", [id, maxSeconds]);
      const finish = await finishSession(id, req.user.id);
      if (!finish) {
        return res.status(500).json({ message: "Error finalizando sesión" });
      }

      return res.json({
        completed: true,
        timeout: true,
        resultado: finish.resultado,
        tiempoEmpleadoSegundos: finish.tiempoEmpleadoSegundos,
        desgloseSubtemas: finish.desgloseSubtemas,
        desglosePorNivel: finish.desglosePorNivel,
      });
    }

    const alreadyAnswered = await query(
      "SELECT 1 FROM respuestas_sesion WHERE sesion_id = $1 AND pregunta_id = $2 LIMIT 1",
      [id, preguntaId]
    );

    if (alreadyAnswered.rows.length > 0) {
      return res.status(409).json({ message: "La pregunta ya fue respondida" });
    }

    const countResult = await query(
      "SELECT COUNT(*)::int as total FROM respuestas_sesion WHERE sesion_id = $1",
      [id]
    );

    const currentCount = countResult.rows[0].total as number;

    const questionResult = await query(
      "SELECT id, nivel, opciones, materia_id FROM preguntas WHERE id = $1 AND activa = TRUE",
      [preguntaId]
    );

    if (questionResult.rows.length === 0) {
      return res.status(404).json({ message: "Pregunta no encontrada" });
    }

    const question = questionResult.rows[0];
    if (question.materia_id !== session.materia_id) {
      return res.status(400).json({ message: "La pregunta no pertenece a este cuestionario" });
    }

    const opciones = parseOpciones(question.opciones);
    const opcion = opciones.find((item) => item.id === opcionId);
    const esCorrecta = opcion ? Boolean(opcion.correcta) : false;

    await query(
      "INSERT INTO respuestas_sesion (sesion_id, pregunta_id, opcion_elegida_id, es_correcta, nivel_pregunta, orden) VALUES ($1, $2, $3, $4, $5, $6)",
      [id, preguntaId, opcionId, esCorrecta, question.nivel, currentCount + 1]
    );

    const newCount = currentCount + 1;

    if (newCount >= session.cantidad_preguntas) {
      const finish = await finishSession(id, req.user.id);
      if (!finish) {
        return res.status(500).json({ message: "Error finalizando sesión" });
      }

      return res.json({
        completed: true,
        resultado: finish.resultado,
        tiempoEmpleadoSegundos: finish.tiempoEmpleadoSegundos,
        desgloseSubtemas: finish.desgloseSubtemas,
        desglosePorNivel: finish.desglosePorNivel,
      });
    }

    const respuestasResult = await query(
      "SELECT pregunta_id, es_correcta, nivel_pregunta FROM respuestas_sesion WHERE sesion_id = $1 ORDER BY orden ASC",
      [id]
    );

    const state = buildState(respuestasResult.rows);
    const nextLevel = nivelDbMap[state.nivelActual];
    const answeredIds = respuestasResult.rows.map((row) => row.pregunta_id as string);

    const nextQuestion = await pickQuestion(session.materia_id, nextLevel, answeredIds);

    if (!nextQuestion) {
      const finish = await finishSession(id, req.user.id);
      if (!finish) {
        return res.status(500).json({ message: "Error finalizando sesión" });
      }

      return res.json({
        completed: true,
        resultado: finish.resultado,
        tiempoEmpleadoSegundos: finish.tiempoEmpleadoSegundos,
        desgloseSubtemas: finish.desgloseSubtemas,
        desglosePorNivel: finish.desglosePorNivel,
      });
    }

    return res.json({
      completed: false,
      progreso: {
        respondidas: newCount,
        total: session.cantidad_preguntas,
      },
      pregunta: sanitizeQuestion(nextQuestion),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error respondiendo pregunta" });
  }
};

export const finishSesion = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    if (!id) {
      return res.status(400).json({ message: "Sesión requerida" });
    }
    const finish = await finishSession(id, req.user.id);

    if (!finish) {
      return res.status(404).json({ message: "Sesión no encontrada" });
    }

    return res.json({
      completed: true,
      resultado: finish.resultado,
      tiempoEmpleadoSegundos: finish.tiempoEmpleadoSegundos,
      desgloseSubtemas: finish.desgloseSubtemas,
      desglosePorNivel: finish.desglosePorNivel,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error finalizando sesión" });
  }
};

export const getSesion = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    if (!id) {
      return res.status(400).json({ message: "Sesión requerida" });
    }
    const sessionResult = await query(
      "SELECT s.*, c.nombre as cuestionario_nombre, c.cantidad_preguntas, c.tiempo_minutos FROM sesiones s JOIN cuestionarios c ON c.id = s.cuestionario_id WHERE s.id = $1 AND s.user_id = $2",
      [id, req.user.id]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ message: "Sesión no encontrada" });
    }

    const respuestasResult = await query(
      "SELECT COUNT(*)::int as total FROM respuestas_sesion WHERE sesion_id = $1",
      [id]
    );

    return res.json({
      sesion: sessionResult.rows[0],
      respondidas: respuestasResult.rows[0].total,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error obteniendo sesión" });
  }
};
