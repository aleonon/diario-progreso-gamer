# PRD · Diario de Progreso Gamer

- **Versión:** 2.1. Agrega la épica E2 · Metas y rachas, y separa las reglas obligatorias de las decisiones de producto.
- **Fecha:** 11 de noviembre de 2026.
- **Fuentes:**
  - **[F]** Ficha de hechos del cliente (Proyecto 4).
  - **[E]** Enunciado del Proyecto 4: modelo de datos, reglas fijas y requerimientos.
  - **[D]** `docs/diagnostico.md`.
  - Las decisiones aprobadas el 11/11/2026.
- **Catálogo de épicas** (E1, lo existente del Proyecto 3; E2, lo nuevo): `docs/backlog/epicas.md`.

> Este documento describe qué debe hacer el producto y por qué. No incluye decisiones técnicas: esas van en `docs/specs/`.
>
> Hay dos tipos de reglas:
> - **RO-xx (reglas obligatorias):** vienen de la ficha o del enunciado y no se discuten.
> - **D-xx (decisiones de producto):** resuelven huecos que esas fuentes dejan abiertos.

---

## 1. Contexto

El Diario de Progreso Gamer ya responde «¿qué estoy jugando, cuánto tiempo le dedico y qué tan avanzado voy?».

Hoy la persona puede:

- Mantener una biblioteca de videojuegos, cada uno con su plataforma, género, estado y logros.
- Registrar y eliminar partidas, cada una con su fecha, duración y porcentaje de avance.
- Consultar un resumen por juego: partidas, horas totales, última sesión y avance actual.

Con la épica E2 · Metas y rachas se agrega una pregunta nueva **[F]**: **«¿estoy cumpliendo lo que me propuse esta semana y cuántos días seguidos llevo jugando?»**

## 2. Problema del usuario

La persona registra sus partidas, pero no sabe si está jugando lo que se propuso ni si es constante. Juega mucho un fin de semana y luego abandona el juego dos semanas **[F]**. El Diario le dice cuánto jugó en total, pero no si va al ritmo que quería.

## 3. Perfil del usuario

Es la misma persona que registra sus videojuegos y partidas en el Diario **[F]**:
- Usuario único, sin roles ni cuentas compartidas.
- Juega varios títulos a la vez y quiere constancia en cada uno.
- Consulta su progreso desde el detalle de cada juego.

## 4. Objetivo de E2

Que la persona pueda fijar una meta por videojuego y ver, en el detalle de ese juego **[F]**:
- Cómo va esta semana frente a su meta.
- Cuántos días seguidos lleva jugando.
- Qué hitos de avance ha alcanzado.

## 5. Métrica de éxito

> **En un mes, la persona cumple su meta semanal al menos 3 de 4 semanas.** [F]

Según la decisión D-09, una semana está **cumplida** cuando, para ese juego, se alcanzan en la misma semana:
- Las **horas** semanales de la meta.
- Los **días** por semana de la meta.

Cómo se mide: ver el supuesto S-04 y el punto pendiente P-05.

## 6. Alcance

| # | Capacidad | Reglas |
|---|---|---|
| A-1 | Crear una meta para un videojuego, con horas por semana, días por semana y una lista corta de hitos. | RO-01 – RO-05, D-07 |
| A-2 | Consultar la meta activa de un juego y la lista de sus metas, incluidas las anteriores. | RO-06 |
| A-3 | Editar la meta activa. | RO-06, D-04, D-11 |
| A-4 | Desactivar la meta activa, con confirmación. | RO-06, D-11 |
| A-5 | Ver en el detalle del juego el progreso de esta semana: horas frente a la meta y días jugados frente a los días objetivo. | RO-07 – RO-10, RO-14, RO-15, D-02 – D-05, D-10 |
| A-6 | Ver la racha actual y la mejor racha del juego. | RO-11, RO-12, D-01, D-10 |
| A-7 | Ver los hitos de la meta con su estado (alcanzado o pendiente). | RO-13, D-06 |
| A-8 | Ver el progreso actualizado después de registrar o eliminar una partida. | RO-19 |
| A-9 | Mantener la coherencia de las metas con el ciclo de vida del juego: al eliminarlo y al cerrarlo (completado o abandonado). | RO-17, D-07, D-08, D-12 |

## 7. No-alcance

**Según la ficha [F]:**
- Notificaciones.
- Recordatorios.
- Metas compartidas entre usuarios.
- Rankings.
- Gráficos históricos.

**Derivado de las fuentes o de las decisiones** (no son requisitos nuevos, sino límites que siguen de ellas):

| Excluido | Motivo |
|---|---|
| Metas globales que abarquen varios juegos | La meta es por videojuego **[F]** |
| Vistas o resúmenes de semanas pasadas | Consecuencia de excluir los gráficos históricos **[F]** |
| Editar o reactivar metas desactivadas | D-11 |
| Editar partidas ya registradas | E1 no lo permite; ver P-04 |
| Cambios en el resumen de progreso de E1 | **[E]**, «Qué no cambia» |

---

## 8. Reglas obligatorias (RO)

### Meta

| ID | Regla | Fuente |
|---|---|---|
| RO-01 | Cada videojuego puede tener **como máximo una meta activa**. | [F] Meta; [E] modelo de datos |
| RO-02 | Una meta define **horas por semana** (mayor que 0 y como máximo 100) y **días por semana** (entero entre 1 y 7). | [E] modelo de datos |
| RO-03 | Una meta tiene una **lista corta de hitos de avance**, con un máximo de 5. Cada hito tiene una descripción (por ejemplo «Llegar al 50 %») y un porcentaje objetivo entre 1 y 100. | [F] Hitos; [E] modelo de datos |
| RO-04 | Si se intenta crear una segunda meta activa para el mismo juego, se rechaza con un **mensaje claro**. | [E] requerimientos |
| RO-05 | Solo se puede crear una meta para un videojuego que exista. | [E] requerimientos |
| RO-06 | Una meta se puede crear, consultar, listar por videojuego, editar y desactivar. La desactivación pide confirmación. Las metas anteriores se conservan como historial. | [E] requerimientos y justificación del modelo |

### Semana

| ID | Regla | Fuente |
|---|---|---|
| RO-07 | La semana va de **lunes a domingo, en hora de Ecuador**. | [F] Semana; [E] reglas fijas |
| RO-08 | **Horas de la semana** = suma de la duración de las partidas del juego en la semana actual, expresada en horas y redondeada a un decimal. | [E] reglas fijas |
| RO-09 | **Porcentaje de horas** = horas de la semana ÷ horas semanales de la meta × 100, redondeado a un número entero. El límite superior se define en D-05. | [E] reglas fijas |
| RO-10 | **Días jugados** = días distintos de la semana actual con al menos una partida del juego. | [E] reglas fijas |

### Rachas

| ID | Regla | Fuente |
|---|---|---|
| RO-11 | Una **racha** son días consecutivos con al menos una partida **de ese videojuego**. | [F] Racha |
| RO-12 | La **racha actual** y la **mejor racha** se calculan sobre **todo** el historial de partidas del juego. | [E] reglas fijas |

### Hitos

| ID | Regla | Fuente |
|---|---|---|
| RO-13 | Un hito está **alcanzado** cuando el avance actual del juego (el del resumen de E1) es mayor o igual que su porcentaje objetivo. El estado «alcanzado» se calcula, no se guarda. | [F] Hitos; [E] reglas fijas y justificación |

### Casos límite

| ID | Regla | Fuente |
|---|---|---|
| RO-14 | **Sin meta activa:** no se muestran meta ni porcentaje de horas, pero sí horas, días y rachas. La interfaz invita a crear una meta. | [E] reglas fijas y requerimientos de interfaz |
| RO-15 | **Sin partidas:** horas, días y rachas en 0, y ningún hito alcanzado. | [E] reglas fijas |
| RO-16 | **Videojuego inexistente:** se informa que no se encontró. **Identificador no válido:** se informa que la solicitud es inválida. | [E] reglas fijas |
| RO-17 | **Eliminar un videojuego no deja metas huérfanas.** | [E] requerimientos |

### Presentación e integración con E1

| ID | Regla | Fuente |
|---|---|---|
| RO-18 | El detalle del juego muestra: horas frente a la meta, días jugados frente a días objetivo, racha actual, mejor racha y la lista de hitos con su estado. | [F] Qué quiere; [E] requerimientos de interfaz |
| RO-19 | El progreso se vuelve a consultar al registrar, editar o eliminar una partida. | [E] requerimientos de interfaz |
| RO-20 | Videojuego, Partida y el resumen de E1 no cambian, salvo que el diagnóstico encuentre un problema y se decida arreglarlo. | [E] «Qué no cambia» |

---

## 9. Decisiones de producto (D)

Todas las decisiones siguientes fueron aprobadas el 11/11/2026.

### D-01 · Racha y día de hoy (situación 1)

- **Decisión:** la racha actual es la serie que termina **hoy o ayer**.
  - Si hoy todavía no hay partida pero ayer sí, la racha sigue viva y muestra los días acumulados hasta ayer. Si hoy se juega, sube en uno.
  - Se rompe (queda en 0) solo si no hubo partida ni hoy ni ayer.
  - *Ejemplo:* jugó ayer, pero no anteayer. Hoy, antes de jugar, la racha es **1**. Si juega hoy, pasa a **2**. Si mañana no juega, pasado mañana la racha es **0**.
- **Alternativa descartada:** romper la racha si hoy aún no hay partida.
- **Motivo:** con esa alternativa, la racha aparecería en 0 cada mañana aunque la persona fuera constante.
- **Afecta a:** RO-11, RO-12.

### D-02 · Varias partidas el mismo día (situación 2)

- **Decisión:** cuentan como **un solo día jugado** para los días de la semana y para las rachas. Sus horas **sí se suman**.
- **Alternativa descartada:** contar un día por cada partida.
- **Motivo:** coincide con «días distintos» (RO-10). Contar un día por partida inflaría la constancia.
- **Afecta a:** RO-08, RO-10, RO-11.

### D-03 · Partida que cruza la medianoche (situación 3)

- **Decisión:** pertenece al **día con que se registró**. No se reparte entre dos días.
- **Alternativa descartada:** repartir la duración entre los dos días.
- **Motivo:** el Diario guarda la fecha de la sesión, no su hora de inicio ni de fin.
- **Afecta a:** RO-08, RO-10, RO-11.

### D-04 · Cambio de meta a mitad de semana (situación 4)

- **Decisión:** toda la semana se calcula con la **meta vigente en el momento de consultar**. La interfaz indica que el progreso se compara con la meta actual.
  - *Ejemplo:* si el miércoles se sube la meta de 5 h a 8 h, las 4 h ya jugadas se ven como 50 %.
- **Alternativa descartada:** que la meta anterior rija hasta el lunes siguiente.
- **Motivo:** es simple, predecible y no exige llevar la vigencia de cada versión de la meta.
- **Afecta a:** RO-09.

### D-05 · Meta superada (situación 5)

- **Decisión:** el porcentaje de horas **no tiene tope**. Por ejemplo, 7 h con una meta de 5 h se muestran como **140 %**. La barra visual se llena al máximo a partir del 100 % y no se desborda.
- **Alternativa descartada:** limitar el porcentaje a 100 %.
- **Motivo:** hace visible el sobrecumplimiento. Con tope, 5 h y 10 h se verían igual.
- **Afecta a:** RO-09.

### D-06 · Hito ya alcanzado y luego menos avance (situación 6)

- **Decisión:** si una partida posterior registra menos avance, los hitos que ya no se cumplen **dejan de estar alcanzados**. El estado siempre refleja el avance actual.
- **Alternativa descartada:** congelar el hito como alcanzado para siempre.
- **Motivo:** es coherente con RO-13 (el estado se calcula y no se guarda) y no duplica un dato que ya existe en las partidas.
- **Afecta a:** RO-13.

### D-07 · Videojuego completado o abandonado (situación 7)

- **Decisión:**
  - Solo un juego **jugando** o **pausado** puede tener una meta activa.
  - No se puede crear una meta para un juego completado o abandonado.
  - Cuando un juego pasa a completado o abandonado, su meta activa **se desactiva automáticamente** y queda en el historial.
- **Alternativas descartadas:**
  - Conservar la meta activa existente y solo impedir crear nuevas.
  - Permitir metas en cualquier estado.
- **Motivo:** una meta semanal en un juego cerrado no responde al problema del usuario.
- **Afecta a:** RO-01, RO-06. **Es un cambio de comportamiento sobre E1 (ver P-02).**

### D-08 · Eliminar un videojuego con meta (situación 8)

- **Decisión:**
  - Se mantiene la regla de E1: un juego con partidas no se puede eliminar.
  - Si el juego se puede eliminar, **todas sus metas (activas e inactivas) y sus hitos se eliminan con él**.
- **Alternativa descartada:** bloquear la eliminación si el juego tiene metas.
- **Motivo:** como las metas inactivas se conservan como historial, esa alternativa impediría eliminar para siempre cualquier juego que haya tenido una meta.
- **Afecta a:** RO-17.

### D-09 · Semana cumplida (hueco adicional; lo necesita la métrica)

- **Decisión:** una semana está cumplida si se alcanzan **las horas y los días** de la meta en la misma semana.
- **Alternativas descartadas:**
  - Solo las horas.
  - Las horas o los días.
- **Motivo:** el problema es jugar mucho un fin de semana y luego abandonar. Solo con las horas, ese patrón contaría como éxito.
- **Afecta a:** §5.

### D-10 · Partidas con fecha futura (hueco adicional)

- **Decisión:** una partida con fecha posterior a hoy (hora de Ecuador) **no cuenta** para las horas, los días ni las rachas hasta que llegue su fecha. Se puede seguir registrando como en E1.
- **Alternativas descartadas:**
  - Prohibir registrar fechas futuras, porque cambia E1.
  - Contarlas, porque permitiría inflar la racha.
- **Motivo:** protege la veracidad del progreso sin tocar E1 (RO-20).
- **Afecta a:** RO-08, RO-10, RO-12. Ver P-03.

### D-11 · Metas desactivadas (hueco adicional)

- **Decisión:** una meta desactivada queda como historial. **No se edita ni se reactiva.** Para cambiar de objetivo, la persona edita la meta activa, o la desactiva y crea otra.
- **Alternativa descartada:** permitir reactivar metas anteriores.
- **Motivo:** mantiene simple la regla de «una meta activa» (RO-01) y conserva intacto el historial (RO-06).
- **Afecta a:** RO-06.

### D-12 · Juego que vuelve a «jugando» o «pausado» (hueco adicional)

- **Decisión:** no recupera la meta que se desactivó al cerrarlo (D-07). La persona puede crear una nueva.
- **Alternativa descartada:** reactivar automáticamente la última meta.
- **Motivo:** es coherente con D-11.
- **Afecta a:** RO-01.

## 10. Resumen de las ocho situaciones abiertas

| # | Situación de la ficha | Decisión | ID |
|---|---|---|---|
| 1 | Racha y día de hoy | Sigue viva si ayer hubo partida; +1 si se juega hoy | D-01 |
| 2 | Varias partidas el mismo día | Un día jugado; las horas se suman | D-02 |
| 3 | Partida que cruza la medianoche | Pertenece al día registrado | D-03 |
| 4 | Cambio de meta a mitad de semana | Se usa la meta vigente al consultar | D-04 |
| 5 | Meta superada | Valor real (140 %), sin tope | D-05 |
| 6 | Hito ya alcanzado y luego menos avance | Deja de estar alcanzado | D-06 |
| 7 | Videojuego completado o abandonado | Sin meta activa; se desactiva sola | D-07 |
| 8 | Eliminar un videojuego con meta | Sus metas e hitos se eliminan con él | D-08 |

---

## 11. Supuestos

- **S-01** El Diario lo usa **una sola persona**, que vive en la zona horaria de Ecuador.
- **S-02** La fecha registrada de cada partida es correcta. El Diario no verifica que la sesión haya ocurrido ese día.
- **S-03** Una meta puede tener entre 0 y 5 hitos, y dos hitos pueden compartir el mismo porcentaje objetivo. La ficha dice «lista corta» y no fija un mínimo.
- **S-04** La métrica de éxito se mide **fuera del producto**: la persona, o quien revise el proyecto, compara semana a semana el progreso mostrado con su meta. El Diario no guarda resultados de semanas pasadas.
- **S-05** Las reglas de E1 siguen vigentes (RO-20): registro de partidas, resumen, logros y la prohibición de eliminar un juego con partidas.

## 12. Puntos pendientes

| ID | Pendiente | Origen | Qué se hará |
|---|---|---|---|
| P-01 | `docs/diagnostico.md` deja como abiertos la zona horaria y el alcance de la meta, que la ficha ya resuelve (RO-07 y RO-01). Además le falta la sección «decisiones tomadas». | Diagnóstico B2, B3 | Actualizar el diagnóstico antes de las specs |
| P-02 | D-07 cambia lo que ocurre al cambiar el estado de un videojuego, y RO-20 pide que ese cambio esté decidido en el diagnóstico. | D-07, RO-20 | Registrar la decisión en el diagnóstico antes de escribir las specs |
| P-03 | El avance actual de E1 toma la partida más reciente **por fecha**, así que una partida con fecha futura podría cambiar los hitos alcanzados (RO-13), aunque D-10 la excluya de las horas y las rachas. | RO-13, D-10 | Se respeta RO-13 sin cambios. Queda como deuda «el registro acepta fechas futuras», que se evalúa en el backlog |
| P-04 | RO-19 menciona editar partidas, pero E1 no permite hacerlo. | RO-19, diagnóstico | Se cubren registrar y eliminar. Si se agrega la edición, aplica la misma regla |
| P-05 | El «3 de 4 semanas» no se puede ver dentro del Diario, porque los gráficos históricos están fuera de alcance. | §5, no-alcance | Se mide a mano (S-04). Para medirlo en el producto haría falta una épica futura |
| P-06 | Se podría mostrar un aviso del tipo «juega hoy para mantener tu racha» cuando la racha sigue viva (D-01). | D-01 | No se incluye, porque se acerca a un recordatorio, que está fuera de alcance |
