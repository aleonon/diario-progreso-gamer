# AGENTS.md — Diario de Progreso Gamer

## Proyecto
App para registrar videojuegos, partidas y logros (E1, Proyecto 3). Épica en curso: **E2 · Metas y rachas**.
E2 responde «¿cumplo mi meta semanal y cuántos días seguidos llevo jugando?».
Proceso SDD: diagnóstico → harness → PRD → épica → historias → criterios → tickets → specs → código con tests → auditoría.

## Stack
- Backend: Node 20+, Express 5, TypeScript (NodeNext, CommonJS), Mongoose 9, MongoDB Atlas.
- Frontend: React 19, TypeScript, Vite 8, React Router 7, CSS propio (sin librerías de UI).
- Tests: Vitest en `backend/` (se configura en el primer ticket de backend). Despliegue: Render.

## Estructura
- `backend/src/`: `models/`, `services/` (lógica y errores), `controllers/`, `routes/`, `middlewares/`, `config/`.
- `backend/src/dominio/`: funciones puras de E2 (semana, días jugados, rachas, hitos), sin Mongoose.
- `frontend/src/`: `api/` (un servicio por recurso), `pages/`, `components/`, `types/`, `index.css` (tokens).
- `docs/`: `diagnostico.md`, `prd/`, `backlog/`, `specs/`, `AUDITORIA.md`, `bitacora-agente.md`.

## Comandos
- Backend: `cd backend && npm run dev` · `npm run build` · `npm test`.
- Frontend: `cd frontend && npm run dev` · `npm run build` · `npm run lint`.
- Mientras `npm test` no exista: `npm run build` en backend, y `npm run build` y `npm run lint` en frontend.

## Convenciones
- Código y textos en español. Imports del backend con extensión `.js`.
- Capas: ruta → controlador (try/catch y `next(error)`) → servicio (valida y lanza errores de dominio).
- Los errores se traducen a 400/404/409/500 solo en `middlewares/errorHandler.ts`.
- Los cálculos de E2 viven en `dominio/`. El servicio consulta datos y llama a esas funciones.
- Fechas de partida en formato `YYYY-MM-DD`. Semana de lunes a domingo en `America/Guayaquil`.
- Rama `feature/e2-metas-rachas`. Commits: `docs(E2): …` para documentación y `feat(E2): T-03 …` o `fix(E2): T-07 …` para código.
- Cada spec se commitea antes que el código que la implementa.

## Reglas
1. **Nunca leer ni modificar `.env`** (ni `.env.*`). `.env.example` se puede editar, sin secretos reales.
2. **Ninguna funcionalidad sin una spec en `docs/specs/`.** Si falta, se crea con `/nueva-spec` y se detiene la implementación.
3. **Ejecutar los tests antes de dar una tarea por terminada** y reportar el resultado real, aunque falle.
4. Primero los tests de dominio y después el código. Al menos un test por criterio verificable sin BD.
5. No cambiar `Videojuego`, `Partida` ni `GET /api/videojuegos/:id/resumen` salvo una decisión registrada en `docs/diagnostico.md`.
6. No hacer commit, push ni deploy sin que la persona lo pida. Para cambios en varios archivos, usar plan mode primero.
7. No inventar producto: lo que no está en la ficha de hechos ni en el PRD es un supuesto y se documenta.
8. No agregar dependencias sin justificarlas en la spec.

## Frontend
- La identidad visual está en `DESIGN.md`: léelo antes de tocar UI.
- Usa solo las variables CSS de `frontend/src/index.css` definidas a partir de DESIGN.md.
- Cada pantalla tiene estados de carga, error y vacío.
- Las llamadas HTTP van en `src/api/` (por ejemplo `metasApi.ts`), nunca dentro de componentes.
- Tras crear, editar o eliminar una partida, se vuelve a consultar el progreso semanal.

## Documentos clave
- Problemas y decisiones: `docs/diagnostico.md`.
- Producto: `docs/prd/`.
- Historias, tickets y deuda técnica: `docs/backlog/`.
- Verificación: `docs/AUDITORIA.md`.
