# Ascent Certus - Plataforma de Evaluación Adaptativa

Plataforma fullstack para evaluaciones adaptativas con dashboard en tiempo real y panel de administración para gestionar módulos, preguntas y configuración de cuestionarios.

## Qué se implementó
1. Conexión del frontend con la API y Supabase.
2. Cuestionarios con tiempo máximo, contador visible y cierre automático al expirar.
3. Motor adaptativo con flujo de puntuación y vista de resultados.
4. Gráfico histórico con filtro por materia y refresco periódico.
5. Panel de administración (UI) con CRUD de:
   - Materias (módulos)
   - Preguntas con opciones y respuesta correcta
   - Cuestionarios con tiempo y cantidad configurables
6. Mejoras en la landing (contenido adicional + carrusel infinito de certificaciones).
7. Eliminación de “Prueba demo” y del botón “Crear cuenta” (no hay registro público).
8. Footer renovado manteniendo la identidad visual.

## Funcionalidades principales
1. Autenticación con JWT (2FA opcional; puede desactivarse en dev).
2. Landing + login + dashboard + módulos + cuestionario + resultados.
3. Motor adaptativo:
   - Inicia en MEDIO.
   - Respuesta correcta sube nivel (máx ALTO).
   - Dos incorrectas seguidas bajan nivel (mín FACIL).
4. Cuestionarios con indicador de progreso (“Pregunta N de M”).
5. Resumen final sin mostrar aciertos/errores por pregunta.
6. Gráfico histórico (Recharts) con filtro por materia.

## Panel de administración (UI)
Disponible solo para usuarios con rol `ADMIN`.

1. Materias:
   - Crear, editar, activar/desactivar.
   - Campos: nombre, descripción, ícono, color.
2. Preguntas:
   - Crear, editar, activar/desactivar.
   - Definir nivel, subtema, opciones (3-5) y una sola correcta.
3. Cuestionarios:
   - Crear, editar, activar/desactivar.
   - Configurar cantidad de preguntas y tiempo (minutos).
   - Ventana de fechas opcional.

## Stack tecnológico
1. Frontend: React + Tailwind + Recharts
2. Backend: Node.js + Express + TypeScript
3. Base de datos: PostgreSQL (Supabase) con `pg` (sin ORM)
4. Auth: JWT en cookie httpOnly

## Estructura del proyecto
1. `backend/` API y acceso a BD
2. `frontend/` App React
3. `db.psql` Esquema y datos seed

## Instalación
### 1) Base de datos
Ejecutar `db.psql` en el SQL Editor de Supabase.

### 2) Backend
Crear `backend/.env` (ver ejemplo en `backend/.env.example`).

Variables requeridas:
1. `DATABASE_URL` conexión a Supabase
2. `PG_SSL=true` para Supabase
3. `JWT_SECRET` secreto fuerte
4. `CORS_ORIGIN` URL del frontend
5. `DISABLE_2FA=true` en dev (poner en false para activar 2FA)
6. `MAIL_USER` y `MAIL_PASS` solo si 2FA está activo

Comandos:
1. `cd backend`
2. `npm install`
3. `npm run dev`

### 3) Frontend
Crear `frontend/.env` (ver ejemplo en `frontend/.env.example`).

Variables requeridas:
1. `VITE_API_URL=http://localhost:3000/api/v1`

Comandos:
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Cuentas de prueba (Dev)
1. Admin: `admin@test.com` / `123456`
2. Estudiante: `estudiante@test.com` / `123456`

Las contraseñas están almacenadas hasheadas en la base de datos. Uso solo para pruebas locales/dev.

## Notas
1. El gráfico refresca cada 15 segundos. Puedes ajustar el intervalo en `frontend/src/App.tsx`.
2. Si hay múltiples cuestionarios por materia, el flujo del estudiante usa el primero retornado. Se puede agregar selector si se requiere.

## Scripts
### Backend
1. `npm run dev`
2. `npm run build`
3. `npm start`

### Frontend
1. `npm run dev`
2. `npm run build`
3. `npm run preview`
