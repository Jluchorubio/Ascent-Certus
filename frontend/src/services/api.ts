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
  listMaterias: () => request<{ materias: unknown[] }>('/materias'),
  listCuestionarios: (materiaId: string) =>
    request<{ cuestionarios: unknown[] }>(`/cuestionarios?materiaId=${encodeURIComponent(materiaId)}`),
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
