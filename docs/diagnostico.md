# Diagnóstico del repositorio — Diario Gamer

**Proyecto 4 · E2: Metas y Rachas**
Fecha del diagnóstico: 11 de noviembre de 2026

## Alcance y método

Este diagnóstico se hizo antes de comenzar E2. Se revisaron en modo de solo lectura el backend, el frontend, los modelos, las rutas, los servicios, los tests y la documentación. No se leyeron archivos `.env` y no se modificó código.

**Estado del repositorio al revisar**
- Rama activa: `feature/frontend-redesign`. Otras ramas: `main` y `feature/videojuegos`.
- `README.md` tenía cambios sin commit (filas de los códigos 413 y 415).
- Historial: 21 commits.

**Verificaciones ejecutadas**

| Verificación | Resultado |
|---|---|
| `backend`: `tsc --noEmit` | Sin errores |
| `frontend`: `tsc -b` | Sin errores |
| `frontend`: `oxlint` | 0 errores y 2 avisos en `frontend/src/pages/PartidaFormPage.tsx` |
| Tests | No hay tests que ejecutar |

Los dos avisos de `oxlint` son:
- Línea 35: se llama a `new Date()` durante el render.
- Línea 85: se llama a `setState` de forma síncrona dentro de un efecto.

---

## 1. Funcionalidades implementadas

### Backend

Tecnologías: Express 5, Mongoose 9 y TypeScript. El código sigue una arquitectura por capas: modelo → servicio → controlador → ruta.

| Recurso | Endpoints |
|---|---|
| Servidor | `GET /` (comprobación de que la API funciona) |
| Videojuegos | `GET /api/videojuegos` y `POST /api/videojuegos`; `GET`, `PUT` y `DELETE /api/videojuegos/:id`; filtro `?estado=` |
| Partidas | `GET /api/partidas` y `POST /api/partidas`; `DELETE /api/partidas/:id`; `GET /api/videojuegos/:id/partidas` |
| Resumen | `GET /api/videojuegos/:id/resumen`: cantidad de partidas, horas totales, última sesión y avance actual |
| Logros | `PATCH /api/videojuegos/:id/logros/:logroId`: solo acepta el campo `obtenido` |

**Modelos** (`backend/src/models/`)
- `Videojuego`: `nombre`, `plataforma` (enum), `genero` (enum), `estado` (enum, por defecto `jugando`) y `logros` como subdocumentos con `nombre` y `obtenido`.
- `Partida`: referencia a `videojuego`, `fecha`, `duracionMinutos` (entero ≥ 1) y `porcentajeAvance` (entre 0 y 100).

**Validación e integridad**
- `validarDatosPartida` (`backend/src/services/partidas.service.ts:107`) es estricta: rechaza campos extra, exige una fecha real con formato `YYYY-MM-DD` y la guarda como medianoche UTC.
- Al crear una partida se comprueba que el videojuego exista.
- No se puede borrar un videojuego que tiene partidas: la API responde 409.
- Los IDs inválidos responden 400.

**Middlewares** (`backend/src/middlewares/`)
- `requestId`: genera un UUID por solicitud y lo envía en la cabecera `X-Request-ID`.
- `logger`: registra método, ruta, código de respuesta y duración.
- `errorHandler`: maneja los errores de forma centralizada (400, 404, 409 y 500), e incluye el `requestId` en la respuesta.

**Otros**
- `app.ts` está separado de `server.ts`, así que la app se puede probar sin levantar el servidor ni conectarse a la base de datos.
- `backend/src/scripts/repararLogros.ts` asigna `_id` a logros antiguos que no lo tienen.

### Frontend

Tecnologías: React 19, Vite 8 y React Router 7.

| Ruta | Pantalla |
|---|---|
| `/` | Catálogo filtrable por estado, con el progreso de logros de cada videojuego |
| `/videojuegos/nuevo` y `/videojuegos/:id/editar` | Formulario para crear o editar un videojuego y sus logros |
| `/videojuegos/:id` | Detalle: resumen de progreso, logros con checkbox e historial de partidas |
| `/partidas/nueva` | Registro de una partida; acepta `?videojuego=ID` para preseleccionar el videojuego |
| `/partidas` | Historial global con búsqueda por videojuego y eliminación con confirmación |

Todas las pantallas tienen estados de carga, error y contenido vacío. El diseño es responsive.

### Despliegue

El README lista las URLs de Render del backend y del frontend.

---

## 2. Problemas que bloquean o condicionan E2

> **Suposición:** E2 incluye *metas* (objetivos medibles, por ejemplo minutos o sesiones por semana) y *rachas* (días consecutivos con al menos una partida), ambas calculadas a partir de `Partida`. Si el enunciado oficial define otra cosa, los puntos B2 y B3 se ajustan.

| # | Problema | Evidencia | Por qué bloquea E2 |
|---|---|---|---|
| B1 | **No hay tests ni infraestructura de pruebas** | No existen archivos de test ni un script `test` en `backend/package.json` ni en `frontend/package.json` | Las rachas son lógica de fechas con muchos casos borde: varias partidas el mismo día, días sin jugar, cambio de mes y de año, racha que sigue viva si la última partida fue ayer. Sin tests no se puede demostrar que el cálculo es correcto. Hace falta Vitest + Supertest (con una base de datos en memoria o mocks) antes de escribir esa lógica |
| B2 | **No está definido qué es un "día"** | `fecha` se guarda como `T00:00:00.000Z` (`backend/src/services/partidas.service.ts:159`). El formulario propone por defecto la fecha local (`frontend/src/pages/PartidaFormPage.tsx:35`). Las vistas formatean las fechas en `timeZone: "UTC"` | Una racha cuenta días consecutivos respecto de "hoy". Hay que decidir si "hoy" se calcula en UTC o en `America/Guayaquil` (UTC−5). Si no se decide, entre las 19:00 y las 24:00 hora local la racha puede salir rota o desplazada un día |
| B3 | **No hay modelo de usuario** | Ningún modelo tiene autenticación ni un campo de propietario; todos los datos son globales | Hay que decidir si las metas y rachas son globales (un único jugador) o por videojuego. Esa decisión define el esquema del modelo `Meta` y sus rutas |
| B4 | **Los errores de dominio están acoplados a cada servicio** | `backend/src/middlewares/errorHandler.ts:10-21` importa las clases de error desde `videojuegos.service` y `partidas.service`. Además, `partidas.service` importa `IdInvalido` y `VideojuegoNoEncontrado` desde `videojuegos.service` | Cada servicio nuevo (metas, rachas) obligaría a editar `errorHandler` y sumaría dependencias cruzadas entre servicios. Conviene crear antes un módulo común `errors/` |
| B5 | **No hay un cliente HTTP compartido en el frontend** | La función `procesarRespuesta` está duplicada en `frontend/src/api/partidasApi.ts` y `frontend/src/api/videojuegosApi.ts`, y las dos copias comprueban el 204 y el `!ok` en distinto orden | Un `metasApi` sería la tercera copia. Conviene extraer antes `frontend/src/api/http.ts` |
| B6 | **El README no coincide con el código** | El README documenta respuestas 413 y 415, pero `errorHandler` no las maneja: los errores de body-parser terminan respondiendo **500**. Además, la sección "Despliegue" dice que está pendiente, mientras el inicio del README lista las URLs de Render | La documentación de E2 partiría de un README inexacto. Antes de documentar endpoints nuevos hay que corregir el código o el README |

---

## 3. Deuda técnica que puede diferirse

### Backend

- **Sin lista blanca de campos en videojuegos.** `crearVideojuego` y `actualizarVideojuego` reciben el `req.body` directamente (`backend/src/services/videojuegos.service.ts:54` y `:95`). El modo strict de Mongoose descarta los campos desconocidos, pero un `PUT` puede reemplazar el arreglo `logros` completo.
- **Código y valores duplicados.** `validarId` está repetido en los dos servicios. Los valores de `estado` aparecen en el modelo, en el tipo del servicio y en el controlador (`backend/src/controllers/videojuegos.controller.ts:44`).
- **Respuesta 400 inconsistente.** El error del filtro `estado` se responde directamente en el controlador, sin `requestId`, en lugar de pasar por `errorHandler`.
- **Log engañoso al arrancar.** `backend/src/server.ts:21-32` imprime `Videojuego.db.name` y el nombre de la colección al cargar el módulo, **antes** de conectar a la base de datos.
- **`FRONTEND_URL` se lee demasiado pronto.** `backend/src/app.ts:26` lee `process.env.FRONTEND_URL` antes de que se ejecute `dotenv.config()`, por el orden de los imports en `server.ts`. En local se ignora el valor del `.env`; en Render funciona porque la plataforma inyecta la variable.
- **Sin índice para consultas por videojuego y fecha.** `Partida` no tiene un índice `{ videojuego: 1, fecha: -1 }`. Será útil para las rachas, pero con el volumen actual no hace falta.
- **Consultas que crecen sin límite.** `calcularResumen` carga todas las partidas en memoria (se podría usar una agregación). `GET /api/partidas` no tiene paginación.
- **Las partidas no se pueden editar.** No existe un endpoint `PUT` ni `PATCH` para `Partida`.
- **El avance puede retroceder.** `porcentajeAvance` puede bajar de una sesión a otra sin ningún aviso.
- **Script sin atajo.** `repararLogros.ts` no tiene un script en `package.json`.
- **Metadatos incompletos.** En `backend/package.json`, `main` apunta a `index.js` y `description` está vacío.

### Frontend

- Los 2 avisos de `oxlint` en `PartidaFormPage.tsx` (líneas 35 y 85).
- En el formulario de partida, "Cancelar" lleva a `/` y "Volver" lleva a `/partidas`.
- El tipo `ResumenProgreso` está definido en `api/videojuegosApi.ts` en lugar de `types/`, y los enums están duplicados respecto del backend.
- Queda un `console.log` de depuración en `frontend/src/pages/VideojuegosPage.tsx:114`.
- La función `formatearFecha` está repetida en 3 componentes.
- La lista de logros del formulario de videojuego usa el índice como `key`.

### Repositorio y proceso

- Antes de crear la rama de E2 hay que commitear o descartar el cambio pendiente del `README.md`. Se sugiere crear `feature/metas-rachas` a partir de `main` actualizado.
- No hay integración continua (CI).

---

## 4. Orden recomendado antes de implementar E2

1. Definir el alcance y las reglas de dominio de E2: zona horaria del "día" (B2) y si las metas son globales o por videojuego (B3).
2. Preparar la infraestructura de tests y escribir tests de caracterización de los endpoints actuales (B1).
3. Extraer el módulo `errors/` en el backend y `api/http.ts` en el frontend (B4 y B5).
4. Alinear `errorHandler` con el README (B6).
5. Después, implementar el modelo `Meta` y el cálculo de rachas.
