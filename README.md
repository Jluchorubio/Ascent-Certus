# Ascent Certus - Adaptive Evaluation Platform

Fullstack platform for adaptive student evaluations with a real-time progress dashboard and an admin panel to manage modules, questions, and quiz configuration.

## What Was Implemented
1. Connected the frontend to the backend API and Supabase data.
2. Enforced timed quizzes with a visible countdown and automatic finish on timeout.
3. Adaptive question engine and scoring flow with final results view.
4. Historical progress chart with per-subject filtering and periodic refresh.
5. Admin visual panel for CRUD of:
   - Materias (modules)
   - Preguntas with options and correct answer
   - Cuestionarios with configurable time and question count
6. Landing page improvements (extra content + infinite certifications carousel).
7. Removed "Prueba demo" and removed the "Crear cuenta" button (no public registration).
8. Redesigned footer while preserving the existing visual identity.

## Core Features
1. Auth with JWT (2FA optional; can be disabled for dev).
2. Landing page + login + dashboard + module view + quiz flow + results.
3. Adaptive engine:
   - Starts at MEDIO.
   - Correct answer increases level (max ALTO).
   - Two incorrect in a row decreases level (min FACIL).
4. Timed quizzes with progress indicator ("Pregunta N de M").
5. Results summary without exposing correct/incorrect per question.
6. Historical chart (Recharts) with filter by subject.

## Admin Panel (UI)
Available only for users with role `ADMIN`.

1. Materias:
   - Create, edit, activate/deactivate.
   - Fields: name, description, icon, color.
2. Preguntas:
   - Create, edit, activate/deactivate.
   - Set level, subtema, options (3-5), and exactly one correct.
3. Cuestionarios:
   - Create, edit, activate/deactivate.
   - Configure number of questions and time (minutes).
   - Optional date window.

## Tech Stack
1. Frontend: React + Tailwind + Recharts
2. Backend: Node.js + Express + TypeScript
3. DB: PostgreSQL (Supabase) with `pg` driver (no ORM)
4. Auth: JWT in httpOnly cookie

## Project Structure
1. `backend/` API and DB access
2. `frontend/` React app
3. `db.psql` DB schema + seed data

## Setup
### 1) Database
Run `db.psql` inside Supabase SQL Editor to create schema and seed data.

### 2) Backend
Create `backend/.env` (example: `backend/.env.example`).

Required keys:
1. `DATABASE_URL` Supabase connection string
2. `PG_SSL=true` for Supabase
3. `JWT_SECRET` any strong secret
4. `CORS_ORIGIN` frontend URL
5. `DISABLE_2FA=true` for dev (set to false to enable)
6. `MAIL_USER` and `MAIL_PASS` only if 2FA is enabled

Run:
1. `cd backend`
2. `npm install`
3. `npm run dev`

### 3) Frontend
Create `frontend/.env` (example: `frontend/.env.example`).

Required keys:
1. `VITE_API_URL=http://localhost:3000/api/v1`

Run:
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Test Accounts (Dev)
1. Admin: `admin@test.com` / `123456`
2. Student: `estudiante@test.com` / `123456`

The passwords are stored hashed in the database. These are for local/dev only.

## Notes
1. The chart refreshes every 15 seconds. Adjust in `frontend/src/App.tsx` if you need a different interval.
2. For multiple cuestionarios per materia, the student flow currently uses the first returned. Add a selector if needed.

## Scripts
### Backend
1. `npm run dev`
2. `npm run build`
3. `npm start`

### Frontend
1. `npm run dev`
2. `npm run build`
3. `npm run preview`
