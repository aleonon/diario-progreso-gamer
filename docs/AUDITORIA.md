# Auditoría · E2 Metas y rachas (T-29)

- **Fecha:** 12 de noviembre de 2026.
- **Rama:** `feature/e2-metas-rachas`, commit `f0ce83c`.
- **Fuentes auditadas:**
  - `docs/prd/diario-gamer.md`.
  - `docs/backlog/E2-metas-y-rachas.md`.
  - `docs/specs/E2-backend-metas-progreso.md` y `docs/specs/E2-frontend-metas-rachas.md`.
  - `DESIGN.md`.
  - El código y los tests de `backend/` y `frontend/`.
- **Regla de esta auditoría:** cada resultado sale de una ejecución real (el reporter JSON de Vitest, curl contra la app real o los scripts de integración). Nada se marca como aprobado sin evidencia.

---

## 1. Resumen

### Comandos ejecutados

| Verificación | Comando | Resultado real |
|---|---|---|
| Tests del backend | `cd backend && npm test` (con `--reporter=json`) | ✅ **177 de 177** en 9 archivos: humo 3, errores 22, metas 45, progreso (API) 20, hitos 9, progreso (dominio) 10, rachas 22, semana 21, validador 25 |
| Build del backend | `cd backend && npm run build` | ✅ Sin errores (código 0) |
| Build del frontend | `cd frontend && npm run build` | ✅ Sin errores (`tsc -b` + `vite build`) |
| Lint del frontend | `cd frontend && npm run lint` | ✅ 0 errores. 2 avisos **anteriores a E2** en `PartidaFormPage.tsx` (deuda diferida) |
| Tests del frontend | — | ⚠️ **No existen** (PA-F1, B5 diferido). La interfaz se verifica con build, lint, integración y revisión manual |
| Integración frontend ↔ backend | Script que repite las llamadas de `metasApi.ts` contra la app real sobre MongoDB en memoria | ✅ **22 de 22** comprobaciones |
| Pruebas manuales de la API (T-21) | curl contra la app real sobre MongoDB en memoria | ⚠️ **36 de 41** cumplen. Las 5 que fallan son de T-19 y T-20. Ver `docs/evidencias/pruebas-api-E2.md` |
| Coherencia documental | Verificadores de backlog, olas y specs | ✅ 0 fallos |

### Criterios

| Resultado | Criterios | Significado |
|---|---|---|
| ✅ Aprobado | **49** | Verificado con un test automatizado en verde o con una respuesta HTTP real |
| ✅/⏳ Aprobado en el sistema, pendiente en la interfaz | **30** | La lógica y la API pasan; la parte visual de la spec frontend necesita captura |
| ❌ Fallido | **4** | CA-10.1, CA-11.1, CA-11.2 y CA-11.4: **T-19 y T-20 no están implementados** |
| ⏳ Pendiente | **4** | CA-01.11, CA-05.1, CA-05.3 y CA-06.12: solo de interfaz, sin captura |
| **Total** | **87** | 79 criterios de historias y 8 de deuda técnica |

### Veredicto

**E2 todavía no está lista para el merge ni para el deploy.** Hay dos motivos:
1. **RO-17, D-07 y D-08 no se cumplen.** Al eliminar un juego quedan metas huérfanas, y al cerrarlo su meta sigue activa. El plan de corrección está en §5 y no se implementó en esta fase.
2. **Faltan las capturas** de las partes visuales: 34 criterios y 4 reglas de DESIGN.md.

El resto del alcance de E2 (CRUD de metas, progreso semanal, rachas, hitos, errores y deuda técnica) está verificado.

---

## 2. Resultado por criterio

| Criterio | Ticket(s) | Requisito verificado (ENTONCES) | Método | Resultado | Evidencia | Observaciones / acción |
|---|---|---|---|---|---|---|
| CA-01.1 | T-14, T-25 | la meta queda activa y el detalle del juego muestra «5 h» y «4 días» como objetivo | Test automatizado + HTTP real | ✅ Aprobado (sistema) · ⏳ Pendiente (interfaz) | 1 test(s) en verde: `tests/api/metas.test.ts` · curl: A2, B2 | La parte visual de la spec frontend necesita captura |
| CA-01.2 | T-14 | la meta queda activa | Test automatizado | ✅ Aprobado | 1 test(s) en verde: `tests/api/metas.test.ts` |  |
| CA-01.3 | T-13 | la meta se acepta en los dos casos | Test automatizado | ✅ Aprobado | 2 test(s) en verde: `tests/api/metas.test.ts`, `tests/dominio/validarDatosMeta.test.ts` |  |
| CA-01.4 | T-13, T-25 | la meta no se crea y se indica que las horas deben ser mayores que 0 y como máximo 100 | Test automatizado + HTTP real | ✅ Aprobado (sistema) · ⏳ Pendiente (interfaz) | 2 test(s) en verde: `tests/api/metas.test.ts`, `tests/dominio/validarDatosMeta.test.ts` · curl: E5 | La parte visual de la spec frontend necesita captura |
| CA-01.5 | T-13 | la meta se acepta en los dos casos | Test automatizado | ✅ Aprobado | 2 test(s) en verde: `tests/api/metas.test.ts`, `tests/dominio/validarDatosMeta.test.ts` |  |
| CA-01.6 | T-13, T-25 | la meta no se crea y se indica que los días deben ser un número entero entre 1 y 7 | Test automatizado | ✅ Aprobado (sistema) · ⏳ Pendiente (interfaz) | 2 test(s) en verde: `tests/api/metas.test.ts`, `tests/dominio/validarDatosMeta.test.ts` | La parte visual de la spec frontend necesita captura |
| CA-01.7 | T-13 | la meta no se crea y se indica qué dato falta | Test automatizado | ✅ Aprobado | 3 test(s) en verde: `tests/api/metas.test.ts`, `tests/dominio/validarDatosMeta.test.ts` |  |
| CA-01.8 | T-14, T-21, T-25, T-31 | la nueva meta no se crea, se muestra el mensaje «Este videojuego ya tiene una meta activa» y la meta existente no cambia | Test automatizado + HTTP real | ✅ Aprobado (sistema) · ⏳ Pendiente (interfaz) | 2 test(s) en verde: `tests/api/metas.test.ts` · curl: E6 | La parte visual de la spec frontend necesita captura |
| CA-01.9 | T-14 | la meta no se crea y se indica que solo los juegos en estado «jugando» o «pausado» pueden tener una meta activa | Test automatizado + HTTP real | ✅ Aprobado (sistema) · ⏳ Pendiente (interfaz) | 1 test(s) en verde: `tests/api/metas.test.ts` · curl: E7 | La parte visual de la spec frontend necesita captura |
| CA-01.10 | T-14 | la nueva queda activa y las dos anteriores siguen en el historial sin cambios | Test automatizado | ✅ Aprobado | 2 test(s) en verde: `tests/api/metas.test.ts` |  |
| CA-01.11 | T-25 | veo el mensaje junto al formulario y lo que escribí se conserva para corregirlo | Manual en el navegador (spec frontend §9) | ⏳ Pendiente | Implementado (revisión de código); sin captura | Verificar con `npm run dev` y adjuntar captura en `docs/evidencias/frontend-E2/` |
| CA-02.1 | T-14, T-25 | la meta guarda ese hito con su descripción y su porcentaje objetivo | Test automatizado + HTTP real | ✅ Aprobado (sistema) · ⏳ Pendiente (interfaz) | 1 test(s) en verde: `tests/api/metas.test.ts` · curl: A2 | La parte visual de la spec frontend necesita captura |
| CA-02.2 | T-13 | los dos se aceptan | Test automatizado | ✅ Aprobado | 1 test(s) en verde: `tests/dominio/validarDatosMeta.test.ts` |  |
| CA-02.3 | T-13, T-25 | la meta no se guarda y se indica que el objetivo debe estar entre 1 y 100 | Test automatizado | ✅ Aprobado (sistema) · ⏳ Pendiente (interfaz) | 2 test(s) en verde: `tests/api/metas.test.ts`, `tests/dominio/validarDatosMeta.test.ts` | La parte visual de la spec frontend necesita captura |
| CA-02.4 | T-13 | la meta se guarda con los 5 | Test automatizado | ✅ Aprobado | 2 test(s) en verde: `tests/api/metas.test.ts`, `tests/dominio/validarDatosMeta.test.ts` |  |
| CA-02.5 | T-13, T-25 | no se permite y se indica que el máximo es de 5 hitos | Test automatizado | ✅ Aprobado (sistema) · ⏳ Pendiente (interfaz) | 2 test(s) en verde: `tests/api/metas.test.ts`, `tests/dominio/validarDatosMeta.test.ts` | La parte visual de la spec frontend necesita captura |
| CA-02.6 | T-13, T-25 | la meta no se guarda y se indica que el hito necesita una descripción | Test automatizado | ✅ Aprobado (sistema) · ⏳ Pendiente (interfaz) | 2 test(s) en verde: `tests/api/metas.test.ts`, `tests/dominio/validarDatosMeta.test.ts` | La parte visual de la spec frontend necesita captura |
| CA-02.7 | T-13 | la meta se crea con su lista de hitos vacía | Test automatizado | ✅ Aprobado | 1 test(s) en verde: `tests/dominio/validarDatosMeta.test.ts` |  |
| CA-02.8 | T-13 | se aceptan los dos | Test automatizado | ✅ Aprobado | 1 test(s) en verde: `tests/dominio/validarDatosMeta.test.ts` |  |
| CA-03.1 | T-26 | veo las horas por semana, los días por semana y los hitos de esa meta | Test automatizado | ✅ Aprobado (sistema) · ⏳ Pendiente (interfaz) | 1 test(s) en verde: `tests/api/metas.test.ts` | La parte visual de la spec frontend necesita captura |
| CA-03.2 | T-15, T-26 | veo las tres, con la activa claramente distinguida de las anteriores | Test automatizado + HTTP real | ✅ Aprobado (sistema) · ⏳ Pendiente (interfaz) | 1 test(s) en verde: `tests/api/metas.test.ts` · curl: B4 | La parte visual de la spec frontend necesita captura |
| CA-03.3 | T-26 | veo que no tiene ninguna y una invitación a crear una. No se muestra como error | Test automatizado | ✅ Aprobado (sistema) · ⏳ Pendiente (interfaz) | 1 test(s) en verde: `tests/api/metas.test.ts` | La parte visual de la spec frontend necesita captura |
| CA-03.4 | T-15 | veo sus horas, días, hitos y si está activa o desactivada | Test automatizado | ✅ Aprobado | 1 test(s) en verde: `tests/api/metas.test.ts` |  |
| CA-03.5 | T-15 | no aparece ninguna meta del otro juego | Test automatizado | ✅ Aprobado | 1 test(s) en verde: `tests/api/metas.test.ts` |  |
| CA-04.1 | T-16, T-25 | la meta guarda los valores nuevos y el progreso de esta semana se compara con 8 h y 5 días | Test automatizado | ✅ Aprobado (sistema) · ⏳ Pendiente (interfaz) | 2 test(s) en verde: `tests/api/metas.test.ts`, `tests/api/progreso.test.ts` | La parte visual de la spec frontend necesita captura |
| CA-04.2 | T-18, T-24 | el progreso semanal muestra 50 % y la interfaz indica que se compara con la meta actual | Test automatizado | ✅ Aprobado (sistema) · ⏳ Pendiente (interfaz) | 2 test(s) en verde: `tests/dominio/progreso.test.ts`, `tests/dominio/semana.test.ts` | La parte visual de la spec frontend necesita captura |
| CA-04.3 | T-16, T-25 | la meta queda con exactamente los hitos resultantes | Test automatizado | ✅ Aprobado (sistema) · ⏳ Pendiente (interfaz) | 1 test(s) en verde: `tests/api/metas.test.ts` | La parte visual de la spec frontend necesita captura |
| CA-04.4 | T-16, T-25 | se rechaza con el mensaje correspondiente y la meta conserva sus valores anteriores | Test automatizado | ✅ Aprobado (sistema) · ⏳ Pendiente (interfaz) | 1 test(s) en verde: `tests/api/metas.test.ts` | La parte visual de la spec frontend necesita captura |
| CA-04.5 | T-16 | se rechaza con un mensaje que indica que las metas desactivadas no se pueden editar, y la meta no cambia | Test automatizado | ✅ Aprobado | 1 test(s) en verde: `tests/api/metas.test.ts` |  |
| CA-05.1 | T-26 | se me pide confirmar con el mensaje «¿Desactivar la meta de Hades?» | Manual en el navegador (spec frontend §9) | ⏳ Pendiente | Implementado (revisión de código); sin captura | Verificar con `npm run dev` y adjuntar captura en `docs/evidencias/frontend-E2/` |
| CA-05.2 | T-17, T-26 | la meta pasa a desactivada, aparece entre las metas anteriores y el progreso del juego muestra el caso «sin meta activa» (ver HU-09) | Test automatizado + HTTP real | ✅ Aprobado (sistema) · ⏳ Pendiente (interfaz) | 2 test(s) en verde: `tests/api/metas.test.ts`, `tests/api/progreso.test.ts` · curl: E9 | La parte visual de la spec frontend necesita captura |
| CA-05.3 | T-26 | la meta sigue activa y sin cambios | Manual en el navegador (spec frontend §9) | ⏳ Pendiente | Implementado (revisión de código); sin captura | Verificar con `npm run dev` y adjuntar captura en `docs/evidencias/frontend-E2/` |
| CA-05.4 | T-17 | se rechaza con un mensaje que indica que la meta ya está desactivada | Test automatizado + HTTP real | ✅ Aprobado | 1 test(s) en verde: `tests/api/metas.test.ts` · curl: E10 |  |
| CA-05.5 | T-17 | se rechaza y la meta sigue desactivada. Para tener una meta activa hay que crear una nueva | Test automatizado + HTTP real | ✅ Aprobado | 1 test(s) en verde: `tests/api/metas.test.ts` · curl: E8 |  |
| CA-06.1 | T-07, T-08, T-18, T-24, T-31 | veo la semana del 2 al 8 de noviembre, 3,5 h, 70 % y 3 de 4 días jugados | Test automatizado + HTTP real | ✅ Aprobado (sistema) · ⏳ Pendiente (interfaz) | 4 test(s) en verde: `tests/api/progreso.test.ts`, `tests/dominio/progreso.test.ts`, `tests/dominio/semana.test.ts` · curl: B3 | La parte visual de la spec frontend necesita captura |
| CA-06.2 | T-07, T-08, T-18 | veo 1,7 h y 57 %. El porcentaje se calcula sobre las horas ya redondeadas | Test automatizado | ✅ Aprobado | 1 test(s) en verde: `tests/dominio/semana.test.ts` |  |
| CA-06.3 | T-07, T-08, T-18 | veo 1 día jugado y 1,5 h | Test automatizado | ✅ Aprobado | 2 test(s) en verde: `tests/api/progreso.test.ts`, `tests/dominio/semana.test.ts` |  |
| CA-06.4 | T-07, T-08, T-18 | la partida cuenta completa en la semana del 2 al 8 de noviembre y no se reparte con la siguiente | Test automatizado | ✅ Aprobado | 1 test(s) en verde: `tests/dominio/semana.test.ts` |  |
| CA-06.5 | T-07, T-08, T-18 | solo la del lunes 2 cuenta en esta semana | Test automatizado | ✅ Aprobado | 2 test(s) en verde: `tests/api/progreso.test.ts`, `tests/dominio/semana.test.ts` |  |
| CA-06.6 | T-07, T-08, T-18 | la semana mostrada sigue siendo la del 2 al 8 de noviembre y las partidas del domingo 8 cuentan en ella | Test automatizado | ✅ Aprobado | 2 test(s) en verde: `tests/api/progreso.test.ts`, `tests/dominio/semana.test.ts` |  |
| CA-06.7 | T-07, T-08, T-18, T-22, T-24, T-28 | veo 140 % y la barra de horas aparece llena, sin desbordarse | Test automatizado + HTTP real | ✅ Aprobado (sistema) · ⏳ Pendiente (interfaz) | 3 test(s) en verde: `tests/api/progreso.test.ts`, `tests/dominio/progreso.test.ts`, `tests/dominio/semana.test.ts` · curl: B3 | La parte visual de la spec frontend necesita captura |
| CA-06.8 | T-07, T-08, T-18 | esa partida no suma horas ni días | Test automatizado | ✅ Aprobado | 2 test(s) en verde: `tests/api/progreso.test.ts`, `tests/dominio/semana.test.ts` |  |
| CA-06.9 | T-07, T-08, T-18 | esas partidas no suman horas ni días | Test automatizado | ✅ Aprobado | 1 test(s) en verde: `tests/api/progreso.test.ts` |  |
| CA-06.10 | T-27 | las horas, los días y la racha ya reflejan la partida nueva, sin recargar la página a mano | Test automatizado | ✅ Aprobado (sistema) · ⏳ Pendiente (interfaz) | 1 test(s) en verde: `tests/api/progreso.test.ts` | La parte visual de la spec frontend necesita captura |
| CA-06.11 | T-27 | el progreso ya no la cuenta | Test automatizado | ✅ Aprobado (sistema) · ⏳ Pendiente (interfaz) | 1 test(s) en verde: `tests/api/progreso.test.ts` | La parte visual de la spec frontend necesita captura |
| CA-06.12 | T-24 | veo un mensaje de error con la opción de intentar de nuevo, y el resto del detalle sigue visible. Mientras el progreso carga, veo un indicador de carg | Manual en el navegador (spec frontend §9) | ⏳ Pendiente | Integración: id inválido → 400 con mensaje (el bloque de error depende de esa respuesta). Falta la captura | Verificar con `npm run dev` y adjuntar captura en `docs/evidencias/frontend-E2/` |
| CA-07.1 | T-09, T-10, T-18 | la racha actual es 1 | Test automatizado | ✅ Aprobado | 1 test(s) en verde: `tests/dominio/rachas.test.ts` |  |
| CA-07.2 | T-09, T-10, T-18, T-27 | la racha actual pasa a 2 | Test automatizado | ✅ Aprobado (sistema) · ⏳ Pendiente (interfaz) | 1 test(s) en verde: `tests/dominio/rachas.test.ts` | La parte visual de la spec frontend necesita captura |
| CA-07.3 | T-09, T-10, T-18 | la racha actual es 0 y la mejor racha sigue siendo 6 | Test automatizado | ✅ Aprobado | 2 test(s) en verde: `tests/dominio/rachas.test.ts` |  |
| CA-07.4 | T-09, T-10, T-18, T-24 | la racha actual es 4 | Test automatizado | ✅ Aprobado (sistema) · ⏳ Pendiente (interfaz) | 1 test(s) en verde: `tests/dominio/rachas.test.ts` | La parte visual de la spec frontend necesita captura |
| CA-07.5 | T-09, T-10, T-18, T-21, T-24, T-31 | la racha actual es 4 y la mejor racha es 9 | Test automatizado + HTTP real | ✅ Aprobado (sistema) · ⏳ Pendiente (interfaz) | 3 test(s) en verde: `tests/api/progreso.test.ts`, `tests/dominio/rachas.test.ts` · curl: B1, B3 | La parte visual de la spec frontend necesita captura |
| CA-07.6 | T-09, T-10, T-18 | la racha actual es 2, porque el martes cuenta como un solo día | Test automatizado | ✅ Aprobado | 3 test(s) en verde: `tests/api/progreso.test.ts`, `tests/dominio/rachas.test.ts` |  |
| CA-07.7 | T-09, T-10, T-18 | la racha actual es 4, aunque cruce un cambio de mes y de semana | Test automatizado | ✅ Aprobado | 1 test(s) en verde: `tests/dominio/rachas.test.ts` |  |
| CA-07.8 | T-09, T-10, T-18 | la racha actual es 4, aunque cruce un cambio de año | Test automatizado | ✅ Aprobado | 3 test(s) en verde: `tests/api/progreso.test.ts`, `tests/dominio/rachas.test.ts` |  |
| CA-07.9 | T-09, T-10, T-18 | la racha actual es 1: las partidas de otros juegos no cuentan | Test automatizado | ✅ Aprobado | 1 test(s) en verde: `tests/api/progreso.test.ts` |  |
| CA-07.10 | T-09, T-10, T-18 | la racha actual es 2 y la partida de mañana no la extiende | Test automatizado | ✅ Aprobado | 3 test(s) en verde: `tests/api/progreso.test.ts`, `tests/dominio/rachas.test.ts` |  |
| CA-07.11 | T-09, T-10, T-18 | la mejor racha también es 5 | Test automatizado | ✅ Aprobado | 1 test(s) en verde: `tests/dominio/rachas.test.ts` |  |
| CA-08.1 | T-11, T-12, T-18, T-22, T-24, T-28 | los hitos de 25 % y 50 % aparecen como «Alcanzado» y el de 100 % como «Pendiente». Cada estado se indica con texto, no solo con color | Test automatizado + HTTP real | ✅ Aprobado (sistema) · ⏳ Pendiente (interfaz) | 2 test(s) en verde: `tests/api/progreso.test.ts`, `tests/dominio/hitos.test.ts` · curl: B3 | La parte visual de la spec frontend necesita captura |
| CA-08.2 | T-11, T-12, T-18 | ese hito aparece como alcanzado | Test automatizado | ✅ Aprobado | 1 test(s) en verde: `tests/dominio/hitos.test.ts` |  |
| CA-08.3 | T-11, T-12, T-18 | el hito de 50 % aparece como pendiente | Test automatizado | ✅ Aprobado | 2 test(s) en verde: `tests/api/progreso.test.ts`, `tests/dominio/hitos.test.ts` |  |
| CA-08.4 | T-11, T-12, T-18 | el avance que se usa para los hitos es 40 % (el de la partida más reciente, como en el resumen de E1) y no el máximo histórico | Test automatizado | ✅ Aprobado | 1 test(s) en verde: `tests/api/progreso.test.ts` |  |
| CA-08.5 | T-24 | la sección de hitos indica que la meta no tiene hitos, sin mostrar un error | Test automatizado | ✅ Aprobado (sistema) · ⏳ Pendiente (interfaz) | 1 test(s) en verde: `tests/dominio/progreso.test.ts` | La parte visual de la spec frontend necesita captura |
| CA-09.1 | T-18, T-22, T-24, T-28 |  | Test automatizado + HTTP real | ✅ Aprobado (sistema) · ⏳ Pendiente (interfaz) | 2 test(s) en verde: `tests/api/progreso.test.ts`, `tests/dominio/progreso.test.ts` · curl: B1 | La parte visual de la spec frontend necesita captura |
| CA-09.2 | T-07, T-08, T-09, T-11, T-18, T-21, T-24 | veo 0 h, 0 %, 0 de 4 días, racha actual 0, mejor racha 0 y ningún hito alcanzado | Test automatizado + HTTP real | ✅ Aprobado (sistema) · ⏳ Pendiente (interfaz) | 6 test(s) en verde: `tests/api/progreso.test.ts`, `tests/dominio/hitos.test.ts`, `tests/dominio/progreso.test.ts`, `tests/dominio/rachas.test.ts`, `tests/dominio/semana.test.ts` · curl: A3 | La parte visual de la spec frontend necesita captura |
| CA-09.3 | T-18, T-24 | veo 0 h, 0 días y rachas en 0, y una invitación a crear una meta. No se muestra como error | Test automatizado + HTTP real | ✅ Aprobado (sistema) · ⏳ Pendiente (interfaz) | 2 test(s) en verde: `tests/api/progreso.test.ts`, `tests/dominio/progreso.test.ts` · curl: A1 | La parte visual de la spec frontend necesita captura |
| CA-09.4 | T-07, T-08, T-09, T-18 | las horas y los días de esta semana son 0, la racha actual es 0 y la mejor racha es 3 | Test automatizado | ✅ Aprobado | 4 test(s) en verde: `tests/dominio/progreso.test.ts`, `tests/dominio/rachas.test.ts`, `tests/dominio/semana.test.ts` |  |
| CA-10.1 | T-20 | se eliminan el juego, sus dos metas y sus hitos. Si después consulto cualquiera de esas metas, se informa que no se encontró | HTTP real (curl) | ❌ Fallido | D3: GET de la meta del juego borrado → 200 con la meta (esperado 404) | T-20 no implementado (D-08 / RB-17). Ver plan de corrección |
| CA-10.2 | T-20 | se rechaza como en E1, porque tiene partidas, y el juego y su meta siguen intactos | HTTP real (curl) | ✅ Aprobado | D4: DELETE → 409; D5: la meta sigue → 200 | El bloqueo de E1 con partidas se mantiene |
| CA-10.3 | T-20 | la meta del otro juego no cambia | HTTP real (curl) | ✅ Aprobado | D7: DELETE del juego E → 204; D8: la meta del juego F sigue → 200 | Pasa porque todavía no existe ningún efecto sobre las metas (T-19/T-20 sin implementar). Volver a verificar después de la corrección |
| CA-11.1 | T-01, T-19 | la meta queda desactivada, aparece entre las metas anteriores y el progreso muestra el caso «sin meta activa» | HTTP real (curl) | ❌ Fallido | G3: meta con activa: true tras pasar a completado; G4: progreso con meta ≠ null | T-19 no implementado (D-07 / RB-16). Ver plan de corrección |
| CA-11.2 | T-01, T-19 | la meta queda desactivada | HTTP real (curl) | ❌ Fallido | H3: meta con activa: true tras pasar a abandonado | T-19 no implementado (D-07 / RB-16). Ver plan de corrección |
| CA-11.3 | T-01, T-19 | la meta sigue activa | HTTP real (curl) | ✅ Aprobado | I3: tras pasar a pausado, la meta sigue con activa: true | Pasa porque todavía no existe ningún efecto sobre las metas (T-19/T-20 sin implementar). Volver a verificar después de la corrección |
| CA-11.4 | T-01, T-19 | el juego no tiene meta activa y puedo crear una nueva. La anterior sigue desactivada | HTTP real (curl) | ❌ Fallido | K2: crear meta tras volver a jugando → 409 (esperado 201): la meta anterior sigue activa | T-19 no implementado (D-07 / RB-16). Ver plan de corrección |
| CA-11.5 | T-01, T-19 | la meta no cambia | HTTP real (curl) | ✅ Aprobado | J3: tras cambiar solo el nombre, la meta sigue con activa: true | Pasa porque todavía no existe ningún efecto sobre las metas (T-19/T-20 sin implementar). Volver a verificar después de la corrección |
| CA-12.1 | T-14, T-15, T-18, T-21 | se informa «Videojuego no encontrado» y no se crea nada | Test automatizado + HTTP real | ✅ Aprobado (sistema) · ⏳ Pendiente (interfaz) | 3 test(s) en verde: `tests/api/metas.test.ts`, `tests/api/progreso.test.ts` · curl: E2 | La parte visual de la spec frontend necesita captura |
| CA-12.2 | T-18, T-21 | se informa que el identificador no es válido, con un mensaje distinto al de «no encontrado» | Test automatizado + HTTP real | ✅ Aprobado | 1 test(s) en verde: `tests/api/progreso.test.ts` · curl: E1 |  |
| CA-12.3 | T-15, T-17 | se informa «Meta no encontrada» | Test automatizado + HTTP real | ✅ Aprobado | 3 test(s) en verde: `tests/api/metas.test.ts` · curl: E4 |  |
| CA-12.4 | T-15 | se informa que el identificador no es válido | Test automatizado + HTTP real | ✅ Aprobado | 1 test(s) en verde: `tests/api/metas.test.ts` · curl: E3 |  |
| CA-12.5 | T-18 | el mensaje es genérico, no expone detalles internos e incluye un identificador de la solicitud para poder diagnosticarla | Test automatizado | ✅ Aprobado | 1 test(s) en verde: `tests/api/errores.test.ts` |  |
| CA-DT1.1 | T-05 | se informan con la misma categoría y el mismo mensaje que antes. No hay regresión | Test automatizado | ✅ Aprobado | 8 test(s) en verde: `tests/api/errores.test.ts` |  |
| CA-DT1.2 | T-05 | cada uno se informa en su categoría: solicitud inválida, no encontrado o conflicto. Ningún servicio depende de otro para declarar sus errores | Test automatizado | ✅ Aprobado | 3 test(s) en verde: `tests/api/errores.test.ts` |  |
| CA-DT2.1 | T-06 | se informa que el cuerpo es demasiado grande (413) y no un error interno | Test automatizado | ✅ Aprobado | 1 test(s) en verde: `tests/api/errores.test.ts` |  |
| CA-DT2.2 | T-06 | se informa «tipo de contenido no soportado» (415) y no un error interno | Test automatizado | ✅ Aprobado | 2 test(s) en verde: `tests/api/errores.test.ts` | Discrepancia de texto: el backlog dice «tipo de contenido no soportado»; la spec (RB-34) y el código usan «Codificación o juego de caracteres no compatible». El código sigue la spec; conviene alinear el backlog |
| CA-DT2.3 | T-06 | se sigue informando como solicitud inválida (400), y la tabla de errores del README coincide con el comportamiento real | Test automatizado | ✅ Aprobado | 2 test(s) en verde: `tests/api/errores.test.ts` |  |
| CA-DT3.1 | T-32 | se informa «Filtro estado no válido» como solicitud inválida (400), junto con el identificador de la solicitud | Test automatizado + HTTP real | ✅ Aprobado | 1 test(s) en verde: `tests/api/errores.test.ts` · curl: E11 |  |
| CA-DT3.2 | T-32 | se informa «Solo se permite el campo obtenido» (400), junto con el identificador de la solicitud | Test automatizado | ✅ Aprobado | 1 test(s) en verde: `tests/api/errores.test.ts` |  |
| CA-DT3.3 | T-32 | las respuestas son las mismas que antes (sin regresión) | Test automatizado | ✅ Aprobado | 2 test(s) en verde: `tests/api/errores.test.ts` |  |

---

## 3. Verificaciones transversales

### 3.1 Trazabilidad PRD → historia → criterio → ticket → spec → test → código

| Eslabón | Verificación | Resultado |
|---|---|---|
| PRD → historia | Los 9 elementos de alcance, las 20 reglas obligatorias y las 12 decisiones (A, RO y D) del PRD aparecen en el backlog §5.2. Las dos excepciones están justificadas: D-09 se mide fuera del producto y la edición de partidas no existe (P-04) | ✅ Verificador del backlog: 0 fallos |
| Historia → criterio → ticket | Los 87 criterios tienen ticket; ningún ticket cita criterios inexistentes; las dependencias no forman ciclos | ✅ Verificadores del backlog y de olas: 0 fallos |
| Criterio → spec | Los 87 criterios tienen fila en la tabla criterio → verificación de alguna spec | ✅ Verificador de specs: 0 fallos |
| Spec → test | 75 criterios tienen un test con su ID en el nombre, todos en verde (§2) | ✅ |
| Test → código | Cada archivo de test importa el módulo del ticket que cubre (por ejemplo, `rachas.test.ts` importa `src/dominio/progreso.ts`) | ✅ |
| **Ejemplo de punta a punta** | **D-01** (PRD) → **HU-07** → **CA-07.1** → **T-09 y T-10** → **RB-25** (spec) → `tests/dominio/rachas.test.ts` «CA-07.1 jugó ayer y no anteayer ni hoy: la racha es 1» → `rachaActual()` en `backend/src/dominio/progreso.ts` → esta auditoría (✅) | ✅ |

### 3.2 Las ocho decisiones del PRD

| Decisión | Evidencia | Resultado |
|---|---|---|
| D-01 · La racha sigue viva si ayer hubo partida | `rachas.test.ts`: CA-07.1, CA-07.2, CA-07.3 · API: CA-06.10 | ✅ |
| D-02 · Varias partidas el mismo día cuentan un día | `semana.test.ts` y `rachas.test.ts`: CA-06.3 y CA-07.6 · API: CA-06.3 | ✅ |
| D-03 · La partida pertenece al día registrado | `semana.test.ts`: CA-06.4 (`fechaDePartida`) | ✅ |
| D-04 · Se usa la meta vigente al consultar | `progreso.test.ts` y la API: CA-04.1 y CA-04.2 · Integración: «el progreso usa la meta editada» | ✅ sistema · ⏳ el aviso visual (RF-08) |
| D-05 · Meta superada sin tope (140 %) | CA-06.7 en el dominio y la API · curl B3: 150 % | ✅ sistema · ⏳ la barra visual |
| D-06 · El hito deja de estar alcanzado si baja el avance | `hitos.test.ts` y API: CA-08.3 | ✅ |
| D-07 · Juego cerrado: no se crea meta y la existente se desactiva | No se crea meta: CA-01.9 ✅ (test y curl E7). **No se desactiva al cerrar: CA-11.1, CA-11.2 y CA-11.4 ❌** (curl G3, H3 y K2) | ❌ **Parcial** |
| D-08 · Al eliminar el juego se eliminan sus metas | Bloqueo con partidas: CA-10.2 ✅ (curl D4 y D5). **Las metas quedan huérfanas: CA-10.1 ❌** (curl D3) | ❌ **Parcial** |

### 3.3 Funciones puras y zona horaria `America/Guayaquil`

| Verificación | Evidencia | Resultado |
|---|---|---|
| El dominio no importa Mongoose, Express, modelos ni servicios, ni lee el reloj (RB-31) | `grep -E 'from "(mongoose\|express)"\|models/\|services/\|Date\.now\|new Date\(\)' src/dominio/progreso.ts`: **0 coincidencias** | ✅ |
| El servicio no contiene fórmulas (RB-32) | `grep -E 'Math\.\|/ ?60\|/ ?6\b\|\* ?100\|reduce\('` en `progreso.service.ts` y `progreso.controller.ts`: **0** | ✅ |
| Las funciones no modifican sus argumentos | Tests con `Object.freeze` en `semana`, `rachas`, `hitos`, `progreso` y `validarDatosMeta` | ✅ |
| Zona horaria: domingo a las 22:00 en Ecuador, lunes en UTC | CA-06.6 en el dominio (`fechaHoyGuayaquil`) y en la API, con el reloj fijado | ✅ |
| Semana de lunes a domingo, con cambio de mes y de año | `semana.test.ts` (5 casos) y `progreso.test.ts` de la API (CA-07.8) | ✅ |

### 3.4 Integridad referencial

| Regla | Evidencia | Resultado |
|---|---|---|
| Solo se crea una meta para un videojuego que existe (RO-05) | CA-12.1: tests y curl E2 | ✅ |
| Una sola meta activa, también con peticiones simultáneas (RB-02) | `metas.test.ts`: índice único parcial, 3 creaciones simultáneas dan `[201, 409, 409]`, y una actualización que dejaría dos activas se rechaza | ✅ |
| Un juego con partidas no se puede eliminar (E1) | CA-10.2: curl D4 da 409 y la meta sigue (D5) | ✅ |
| **Al eliminar un juego no quedan metas huérfanas (RO-17, D-08)** | **CA-10.1: curl D3 devuelve la meta del juego eliminado con 200** | ❌ **T-20 no implementado** |
| **Al cerrar un juego se desactiva su meta (D-07)** | **CA-11.1 y CA-11.2: la meta sigue con `activa: true` (G3, H3)** | ❌ **T-19 no implementado** |

### 3.5 Validaciones y errores 400, 404, 409 y 500

| Código | Casos verificados | Evidencia | Resultado |
|---|---|---|---|
| 400 | Id mal formado, horas, días e hitos fuera de rango, campos no permitidos, JSON mal formado, filtro `estado` inválido, logro con campos extra | `validarDatosMeta.test.ts` (25), `metas.test.ts`, `errores.test.ts` · curl E1, E3, E5, E8 y E11 | ✅ |
| 404 | Videojuego, meta, partida y logro inexistentes; ruta inexistente | `errores.test.ts`, `metas.test.ts`, `progreso.test.ts`, `humo.test.ts` · curl E2 y E4 | ✅ |
| 409 | Segunda meta activa, juego cerrado, meta desactivada, juego con partidas | `metas.test.ts`, `errores.test.ts` · curl E6, E7, E10 y D4 | ✅ |
| 413 / 415 | Cuerpo demasiado grande, juego de caracteres o codificación no soportados | `errores.test.ts` (DT-2) | ✅ |
| 500 | Error inesperado: mensaje genérico, sin detalles, con `requestId` | `errores.test.ts` (CA-12.5) | ✅ |
| Forma `{ mensaje, requestId }` | Todas las respuestas de error de curl traían `requestId`. Ningún controlador responde un 4xx directamente (`grep "status(4"`: 0) | ✅ |

### 3.6 Deuda técnica pagada

| ID | Problema | Ticket | Criterios | Resultado |
|---|---|---|---|---|
| DT-1 | B4: errores acoplados a cada servicio | T-05 | CA-DT1.1, CA-DT1.2 | ✅ 11 tests |
| DT-2 | B6: 413/415 respondían 500; README incoherente | T-06 | CA-DT2.1 a CA-DT2.3 | ✅ 5 tests · observación de texto en CA-DT2.2 |
| DT-3 | 400 de controladores sin `requestId` | T-32 | CA-DT3.1 a CA-DT3.3 | ✅ 5 tests · curl E11 |

Cada una tiene su ficha (descripción, causa, test y archivos) en `docs/backlog/E2-metas-y-rachas.md` §6. Los problemas diferidos tienen su motivo en esa misma sección.

### 3.7 Credenciales en archivos versionados

| Verificación | Resultado |
|---|---|
| Archivos `.env` versionados | ✅ Ninguno. Solo `backend/.env.example` y `frontend/.env.example` |
| Algún `.env` en el historial de git (todas las ramas) | ✅ Nunca se agregó ninguno |
| Cadenas de conexión con usuario y contraseña reales (`git grep`) | ✅ Ninguna. `backend/.env.example` usa el marcador `USER:PASSWORD` |
| Claves, tokens o secretos con valor | ✅ Ninguno |
| **Observación** | ⚠️ `backend/.env.example` incluye el **host real del clúster** de Atlas (`cluster.67zgnc6.mongodb.net`). No es una credencial, pero conviene reemplazarlo por un host genérico, como `cluster.xxxxx.mongodb.net` (es parte de T-30) |

### 3.8 DESIGN.md en el frontend

Fuente: `docs/evidencias/revision-diseno-E2.md` (T-28). Lo volví a verificar en esta fase:

| Verificación | Resultado |
|---|---|
| Colores literales en el bloque de CSS de E2 (RF-23) | ✅ 0 |
| `fetch` en componentes o páginas (RF-01) | ✅ 0 |
| Dependencias nuevas en el frontend (RF-24) | ✅ `frontend/package.json` sin cambios desde las specs |
| Reglas de la revisión de diseño | ✅ 19 cumplen (1 corregida: `aria-hidden` en la decoración) · ⏳ **4 pendientes de verificación visual**: foco con teclado, ancho de 320 px, contraste real y aspecto general |

---

## 4. Estado de los tickets

| Ticket | Estado | Commit(s) | Nota |
|---|---|---|---|
| T-01 | ✅ Hecho | `f880789` | Se commiteó después de las specs |
| T-02, T-03 | ✅ Hecho | `1ee5312` | |
| T-04 | ✅ Hecho | `01ae7eb` | |
| T-05 | ✅ Hecho | `fed2a54` | Junto con T-14 a T-17 |
| T-06 | ✅ Hecho | `28cc96c` | Junto con T-32 |
| T-07 | ✅ Hecho | `275aec6` | Se commiteó **después** de su código (T-08) |
| T-08 | ✅ Hecho | `1f4cffc` | El mensaje dice «**T-03**» por error |
| T-09, T-11 | ✅ Hecho | `b8d1b42` | Se commitearon **después** de su código (`59ec6cd`) |
| T-10, T-12, T-18 | ✅ Hecho | `59ec6cd` | El mensaje dice literalmente «**T-XX**» |
| T-13 | ✅ Hecho | `aca0c47` | |
| T-14 a T-17 | ✅ Hecho | `fed2a54` | |
| **T-19** | ❌ **Pendiente** | — | D-07: ver §5 |
| **T-20** | ❌ **Pendiente** | — | D-08: ver §5 |
| T-21 | ✅ Hecho en esta fase | (sin commit) | `docs/evidencias/pruebas-api-E2.md` |
| T-22 | ✅ Hecho | `b0d2b8e` | |
| T-23 | ✅ Hecho | `7a6c676` | |
| T-24, T-26, T-27 | ✅ Hecho | `0a5d5b9` | |
| T-25 | ✅ Hecho | `4996af3` | |
| T-28 | ⏳ Parcial | `90f6b39` | Faltan 4 verificaciones visuales |
| T-29 | ✅ Esta auditoría | (sin commit) | |
| **T-30** | ❌ **Pendiente** | — | Sección «Cómo trabajamos con el agente» en el README, `.env.example` sin el host real y `docs/bitacora-agente.md` |
| **T-31** | ❌ **Pendiente** | — | Deploy y PR (requieren tu autorización) |
| T-32 | ✅ Hecho | `28cc96c` | |

El harness (AGENTS.md, CLAUDE.md, DESIGN.md, la skill y los hooks) está en `3834a94 chore (E2`, un mensaje incompleto.

---

## 5. Plan de corrección de los criterios fallidos (no implementado)

| Ticket | Corrección según la spec | Tests (primero en rojo) | Archivos |
|---|---|---|---|
| **T-20** (RB-17, D-08) | En `eliminarVideojuego`: después de comprobar que el juego no tiene partidas (el 409 se mantiene), ejecutar `Meta.deleteMany({ videojuego: id })` y luego borrar el juego | `tests/api/videojuegos-metas.test.ts`: CA-10.1 (0 metas y la meta da 404), CA-10.2 (409 y nada borrado), CA-10.3 (las metas de otro juego intactas) | M `backend/src/services/videojuegos.service.ts`, N `backend/tests/api/videojuegos-metas.test.ts` |
| **T-19** (RB-16, D-07, D-12) | En `actualizarVideojuego`: después del `findByIdAndUpdate`, si el estado resultante es `completado` o `abandonado`, ejecutar `Meta.updateMany({ videojuego: id, activa: true }, { $set: { activa: false } })`. La respuesta del `PUT` no cambia | Mismo archivo: CA-11.1 a CA-11.5 (completado, abandonado, pausado sin efecto, volver a jugando sin reactivar, cambio de nombre sin efecto) | M `videojuegos.service.ts`, M `videojuegos-metas.test.ts` |

**Después de corregir:**
- Repetir las filas D3, G3, G4, H3 y K2 de `pruebas-api-E2.md` y actualizar esta auditoría.
- Volver a ejecutar CA-10.3, CA-11.3 y CA-11.5. Hoy aprueban solo porque no existe ningún efecto sobre las metas.

**Riesgo:** bajo. Son dos efectos acotados a `videojuegos.service.ts`, autorizados en `docs/diagnostico.md` §5.2, y las regresiones de E1 están cubiertas por `errores.test.ts`.

---

## 6. Preparación para Render (informe, sin cambios)

| Tema | Hallazgo | Acción |
|---|---|---|
| Servicios | No hay `render.yaml`: la configuración vive en el panel. Los servicios son los del README (backend y frontend del Proyecto 3) | **Reutilizarlos**; no hacen falta servicios nuevos |
| Variables de entorno | E2 no añade variables. Backend: `MONGODB_URI`, `PORT`, `FRONTEND_URL`. Frontend: `VITE_API_URL` | Ningún cambio |
| CORS | `app.ts` ya permite `GET`, `POST`, `PUT`, `PATCH` y `DELETE` desde `FRONTEND_URL` | Ningún cambio |
| Build del backend | `npm run build` (`tsc`) y `npm start` (`node dist/server.js`). **Riesgo:** `mongodb-memory-server` (dependencia de desarrollo) descarga unos 70 MB en su `postinstall`. Si Render instala las dependencias de desarrollo para compilar con TypeScript, lo hará en cada build | **Decisión pendiente** antes del deploy: definir `MONGOMS_DISABLE_POSTINSTALL=1` en el servicio de backend, o cambiar a `mongodb-memory-server-core` (la segunda requiere un cambio de dependencias y volver a ejecutar los tests) |
| Build del frontend | `npm run build` genera `dist/`. Las rutas nuevas `/videojuegos/:id/meta/nueva` y `/videojuegos/:id/meta/editar` | Comprobar en el panel que el static site tiene la reescritura `/* → /index.html`. Es la misma que ya necesitan `/partidas` y `/videojuegos/:id` |
| Índices de MongoDB | El índice único parcial `una_meta_activa_por_videojuego` se crea al arrancar (`autoIndex`). La colección `metas` es nueva, así que no hay datos que choquen | Verificar después del deploy con un 409 de meta duplicada |
| Rama | `main` solo tiene el commit inicial (`e946f4a`). La rama contiene todo el Proyecto 3 y E2 | Desplegar desde `main` **después del merge**, con tu autorización |

---

## 7. Historial y pull request

| Requisito del enunciado | Estado | Detalle |
|---|---|---|
| Rama `feature/e2-metas-rachas` | ✅ | 8 commits por delante de `origin` (sin push) |
| Specs antes que el código | ✅ | `1ee5312` (specs) es anterior al primer commit de código (`1f4cffc`). Excepción: las filas de DT-3 en la spec se agregaron en `f0ce83c`, después del código de `28cc96c` |
| Commits que nombran su ticket | ⚠️ Parcial | `3834a94 chore (E2` (sin ticket), `1f4cffc` dice «T-03» (es T-08), `59ec6cd` dice «T-XX» (son T-10, T-12 y T-18). Varios commits agrupan tickets porque comparten archivos |
| Tests antes que el código | ⚠️ Parcial | T-07 se commiteó después de T-08, y T-09 y T-11 después de T-10 y T-12. El ciclo rojo-verde sí se ejecutó; se documenta en la bitácora |
| Dos commits de deuda técnica | ✅ | `28cc96c` (código de T-06 y T-32) y `f0ce83c` (documentación). DT-1 está en `fed2a54` |
| Documentación actualizada | ⚠️ | Falta T-30 (README «Cómo trabajamos con el agente» y `docs/bitacora-agente.md`) |
| Tests ejecutados | ✅ | Ver §1 |
