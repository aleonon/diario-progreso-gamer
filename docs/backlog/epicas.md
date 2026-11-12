# Catálogo de épicas · Diario de Progreso Gamer

- **Fuente de producto:** `docs/prd/diario-gamer.md`. Los IDs `A-`, `RO-`, `D-`, `S-` y `P-` se refieren a ese documento.
- **Estado del código:** `docs/diagnostico.md`.
- **Historias, criterios y tickets de E2:** `docs/backlog/E2-metas-y-rachas.md` (fase 4).

| Épica | Pregunta que responde | Estado |
|---|---|---|
| E1 · Biblioteca y progreso | ¿Qué estoy jugando, cuánto tiempo le dedico y qué tan avanzado voy? | Entregada (Proyecto 3) |
| E2 · Metas y rachas | ¿Estoy cumpliendo lo que me propuse esta semana y cuántos días seguidos llevo jugando? | En definición (Proyecto 4) |

---

## E1 · Biblioteca y progreso

**Objetivo.** Que la persona organice su biblioteca de videojuegos, registre sus sesiones de juego y conozca el tiempo dedicado y el avance de cada juego.

**Alcance que cubre** (funcionalidades existentes):

| Capacidad | Qué permite |
|---|---|
| Biblioteca | Crear, consultar, editar y eliminar videojuegos, con su nombre, plataforma, género y estado (jugando, pausado, completado o abandonado). |
| Filtro por estado | Ver solo los juegos que están en un estado concreto. |
| Logros | Definir los logros de cada juego y marcarlos como obtenidos o pendientes. |
| Partidas | Registrar sesiones con su fecha, duración y porcentaje de avance, y eliminarlas con confirmación. |
| Historial | Consultar todas las partidas, de la más reciente a la más antigua, y buscarlas por videojuego. |
| Resumen de progreso | Ver por juego la cantidad de partidas, las horas totales, la última sesión y el avance actual (el de la partida más reciente). |
| Integridad | No se puede eliminar un juego que tiene partidas. |

**Limitaciones conocidas** (detalle en `docs/diagnostico.md`):
- Las partidas no se pueden editar.
- Se aceptan partidas con fecha futura.
- No hay tests automatizados.
- Parte de la documentación no coincide con el comportamiento real.

**Relación con E2.** E2 se construye sobre E1 sin cambiar su comportamiento (RO-20), con dos excepciones decididas:
- D-07: la meta se desactiva al cerrar un juego.
- D-08: las metas se eliminan junto con su juego.

Las dos tienen que quedar registradas en el diagnóstico (P-02).

---

## E2 · Metas y rachas

**Objetivo.** Que la persona fije una meta semanal por videojuego y vea en el detalle del juego:
- Cómo va esta semana.
- Cuántos días seguidos lleva jugando.
- Qué hitos de avance ha alcanzado.

**Problema que resuelve.** Registra partidas, pero no sabe si juega lo que se propuso ni si es constante. Juega mucho un fin de semana y luego abandona el juego dos semanas.

**Métrica de éxito.** En un mes, la persona cumple su meta semanal al menos 3 de 4 semanas. Una semana se cumple si se alcanzan las horas y los días de la meta (D-09). Se mide fuera del producto (S-04, P-05).

**Alcance que cubre:**

| Capacidad | Alcance PRD | Reglas obligatorias | Decisiones |
|---|---|---|---|
| C-1 · Gestión de la meta: crear, consultar, listar, editar y desactivar la meta de un juego, con sus hitos | A-1, A-2, A-3, A-4 | RO-01, RO-02, RO-03, RO-04, RO-05, RO-06 | D-04, D-07, D-11 |
| C-2 · Progreso semanal: horas frente a la meta y días jugados frente a los días objetivo, actualizados tras cada partida | A-5, A-8 | RO-07, RO-08, RO-09, RO-10, RO-14, RO-15, RO-18, RO-19 | D-02, D-03, D-04, D-05, D-10 |
| C-3 · Rachas: racha actual y mejor racha del juego | A-6 | RO-11, RO-12, RO-15, RO-18 | D-01, D-02, D-03, D-10 |
| C-4 · Hitos: lista de hitos de la meta con su estado | A-7 | RO-13, RO-15, RO-18 | D-06 |
| C-5 · Integración con E1: coherencia de las metas al eliminar o cerrar un juego | A-9 | RO-16, RO-17, RO-20 | D-07, D-08, D-12 |

**No-alcance:**
- Notificaciones, recordatorios, metas compartidas entre usuarios, rankings y gráficos históricos.
- Metas que abarquen varios juegos.
- Vistas de semanas pasadas.
- Editar o reactivar metas desactivadas.
- Editar partidas.

**Dependencias:**
- **Depende de E1:** partidas (fecha y duración), resumen de E1 (avance actual) y estados del videojuego.
- **Antes de las specs:** resolver P-01 y P-02 en `docs/diagnostico.md`.

**Supuestos y pendientes que la afectan:** S-01 a S-05 y P-01 a P-06.

---

## Trazabilidad épica → PRD

| Épica | Secciones del PRD |
|---|---|
| E1 | §1 Contexto; RO-20; S-05 |
| E2 | §2 a §12 |
