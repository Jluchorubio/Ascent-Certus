const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

type RequestOptions = Omit<RequestInit, 'body'> & { body?: unknown };

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method || 'GET',
    credentials: 'include',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      typeof data === 'object' && data && 'message' in data
        ? String((data as { message?: string }).message)
        : 'Error en la solicitud';
    throw new Error(message);
  }

  return data as T;
};

export const api = {
  login: (email: string, password: string) =>
    request<{ ok: boolean; requires2FA?: boolean; userId?: string; email?: string; user?: unknown }>(
      '/auth/login',
      {
        method: 'POST',
        body: { email, password },
      }
    ),
  verify2FA: (userId: string, code: string) =>
    request<{ ok: boolean; user: unknown }>('/auth/verify-2fa', {
      method: 'POST',
      body: { userId, code },
    }),
  logout: () => request<{ ok: boolean }>('/auth/logout', { method: 'POST' }),
  me: () => request<{ user: unknown }>('/auth/me'),
  listMaterias: (all?: boolean) => {
    const param = all ? '?all=true' : '';
    return request<{ materias: unknown[] }>(`/materias${param}`);
  },
  createMateria: (payload: { nombre: string; descripcion?: string; icono?: string; color?: string }) =>
    request<{ materia: unknown }>('/materias', { method: 'POST', body: payload }),
  updateMateria: (
    id: string,
    payload: { nombre?: string; descripcion?: string; icono?: string; color?: string }
  ) => request<{ materia: unknown }>(`/materias/${encodeURIComponent(id)}`, { method: 'PATCH', body: payload }),
  toggleMateria: (id: string, activa?: boolean) =>
    request<{ materia: unknown }>(`/materias/${encodeURIComponent(id)}/toggle`, {
      method: 'PATCH',
      body: typeof activa === 'boolean' ? { activa } : undefined,
    }),
  listCuestionarios: (materiaId: string, all?: boolean) => {
    const params = new URLSearchParams();
    params.set('materiaId', materiaId);
    if (all) params.set('all', 'true');
    return request<{ cuestionarios: unknown[] }>(`/cuestionarios?${params.toString()}`);
  },
  createCuestionario: (payload: {
    materiaId: string;
    nombre: string;
    cantidadPreguntas: number;
    tiempoMinutos?: number;
    fechaInicio?: string | null;
    fechaFin?: string | null;
  }) => request<{ cuestionario: unknown }>('/cuestionarios', { method: 'POST', body: payload }),
  updateCuestionario: (
    id: string,
    payload: {
      nombre?: string;
      cantidadPreguntas?: number;
      tiempoMinutos?: number;
      fechaInicio?: string | null;
      fechaFin?: string | null;
    }
  ) => request<{ cuestionario: unknown }>(`/cuestionarios/${encodeURIComponent(id)}`, { method: 'PATCH', body: payload }),
  toggleCuestionario: (id: string, activo?: boolean) =>
    request<{ cuestionario: unknown }>(`/cuestionarios/${encodeURIComponent(id)}/toggle`, {
      method: 'PATCH',
      body: typeof activo === 'boolean' ? { activo } : undefined,
    }),
  listPreguntas: (materiaId: string, all?: boolean) => {
    const params = new URLSearchParams();
    if (all) params.set('all', 'true');
    const qs = params.toString();
    const suffix = qs ? `?${qs}` : '';
    return request<{ preguntas: unknown[] }>(`/preguntas/materia/${encodeURIComponent(materiaId)}${suffix}`);
  },
  createPregunta: (payload: {
    materiaId: string;
    nivel: 'FACIL' | 'MEDIO' | 'ALTO';
    enunciado: string;
    subtema?: string;
    opciones: { id: number; texto: string; correcta: boolean }[];
  }) => request<{ pregunta: unknown }>('/preguntas', { method: 'POST', body: payload }),
  updatePregunta: (
    id: string,
    payload: {
      nivel?: 'FACIL' | 'MEDIO' | 'ALTO';
      enunciado?: string;
      subtema?: string;
      opciones?: { id: number; texto: string; correcta: boolean }[];
    }
  ) => request<{ pregunta: unknown }>(`/preguntas/${encodeURIComponent(id)}`, { method: 'PATCH', body: payload }),
  togglePregunta: (id: string, activa?: boolean) =>
    request<{ pregunta: unknown }>(`/preguntas/${encodeURIComponent(id)}/toggle`, {
      method: 'PATCH',
      body: typeof activa === 'boolean' ? { activa } : undefined,
    }),
  startSesion: (cuestionarioId: string) =>
    request<{
      sesion: unknown;
      cuestionario: {
        id: string;
        nombre: string;
        cantidadPreguntas: number;
        tiempoMinutos: number;
      };
      pregunta: unknown;
    }>('/sesiones/start', {
      method: 'POST',
      body: { cuestionarioId },
    }),
  answerPregunta: (sesionId: string, preguntaId: string, opcionId: number) =>
    request<unknown>(`/sesiones/${encodeURIComponent(sesionId)}/answer`, {
      method: 'POST',
      body: { preguntaId, opcionId },
    }),
  finishSesion: (sesionId: string) =>
    request<unknown>(`/sesiones/${encodeURIComponent(sesionId)}/finish`, { method: 'POST' }),
  listHistorial: (since?: string) => {
    const param = since ? `?since=${encodeURIComponent(since)}` : '';
    return request<{ historial: unknown[] }>(`/historial${param}`);
  },
};
