# PRD · Diario de Progreso Gamer

- **Versión:** 2.0. Agrega la épica E2 · Metas y rachas.
- **Fecha:** 11 de noviembre de 2026.
- **Fuentes:**
  - La ficha de hechos del cliente (Proyecto 4).
  - `docs/diagnostico.md`.
  - Las decisiones aprobadas por la responsable del producto el 11/11/2026.

> Este documento describe **qué** debe hacer el producto y **por qué**. No incluye decisiones técnicas: esas van en `docs/specs/`.

---

## 1. Contexto

El Diario de Progreso Gamer ya responde «¿qué estoy jugando, cuánto tiempo le dedico y qué tan avanzado voy?». Esa es la **épica E1**, entregada en el Proyecto 3. Hoy la persona puede:

- Mantener una biblioteca de videojuegos, cada uno con su plataforma, género, estado y logros.
- Registrar partidas con su fecha, duración y porcentaje de avance.
- Consultar un resumen por juego: partidas, horas totales, última sesión y avance actual.

La **épica E2 · Metas y rachas** agrega una pregunta nueva: **«¿estoy cumpliendo lo que me propuse esta semana y cuántos días seguidos llevo jugando?»**

## 2. Problema

La persona registra sus partidas, pero no sabe si está jugando lo que se propuso ni si es constante. Su patrón típico es jugar mucho un fin de semana y luego abandonar el juego dos semanas. El Diario muestra cuánto jugó en total, pero no si va al ritmo que quería.

## 3. Usuario

Una sola persona: la misma que registra sus videojuegos y partidas en el Diario. No hay otros roles ni cuentas compartidas.

## 4. Objetivos

1. **Fijar una intención:** definir, para cada videojuego, cuántas horas y cuántos días por semana quiere jugar.
2. **Ver el ritmo de la semana:** en el detalle de cada juego, saber cuánto lleva jugado esta semana frente a su meta.
3. **Hacer visible la constancia:** ver cuántos días seguidos lleva jugando cada juego y cuál fue su mejor racha.
4. **Celebrar el avance:** ver qué hitos de avance ya alcanzó en cada juego.

## 5. Métrica de éxito

**En un mes (4 semanas consecutivas, de lunes a domingo), la persona cumple su meta semanal en al menos 3 de las 4 semanas.**

Una semana está **cumplida** cuando, para ese juego, la persona alcanza **las dos** cosas:
- Las horas semanales de su meta.
- Los días por semana de su meta.

Las dos condiciones son necesarias, para que jugar muchas horas en un solo fin de semana no cuente como constancia.

Cómo se mide: ver el supuesto S-05 y el punto abierto PA-01.

## 6. Alcance de E2

| # | Capacidad |
|---|---|
| A-1 | Crear una meta para un videojuego, con horas por semana, días por semana y una lista corta de hitos de avance. |
| A-2 | Consultar la meta activa de un juego y las metas anteriores (historial). |
| A-3 | Editar la meta activa: horas, días e hitos. |
| A-4 | Desactivar la meta activa, con confirmación. |
| A-5 | Ver, en el detalle del juego, el **progreso semanal**: horas de la semana frente a la meta, días jugados frente a los días objetivo, racha actual, mejor racha y lista de hitos con su estado. |
| A-6 | Ver el progreso actualizado después de registrar o eliminar una partida. |
| A-7 | Cuando un juego no tiene meta activa, ver igualmente las horas, los días y las rachas, con una invitación a crear una meta. |

## 7. No-alcance

- Notificaciones y recordatorios.
- Metas compartidas entre usuarios, cuentas de usuario y rankings.
- Gráficos históricos y vistas de semanas pasadas.
- Metas globales que abarquen varios juegos. La meta es siempre de un solo videojuego.
- Reactivar o editar metas desactivadas.
- Editar partidas ya registradas. Hoy el Diario solo permite registrarlas y eliminarlas (ver S-03).
- Cambios en el resumen de progreso de E1. El único cambio de comportamiento sobre E1 es la desactivación automática de la meta al cerrar un juego (RN-05) y la eliminación de metas junto con su juego (RN-07).

---

## 8. Reglas de negocio

### Meta

- **RN-01 · Una meta por juego a la vez.** Cada videojuego puede tener **como máximo una meta activa**. Si se intenta crear una segunda, el sistema la rechaza con un mensaje claro que indica que ese juego ya tiene una meta activa.
- **RN-02 · Contenido de la meta.**
  - **Horas por semana:** mayor que 0 y como máximo 100.
  - **Días por semana:** un número entero entre 1 y 7.
- **RN-03 · Hitos de la meta.**
  - Una meta tiene como máximo **5 hitos**.
  - Cada hito tiene una descripción (por ejemplo «Llegar al 50 %») y un porcentaje objetivo entre 1 y 100.
- **RN-04 · Solo juegos en curso.** Solo un juego en estado **jugando** o **pausado** puede tener una meta activa. No se puede crear una meta para un juego **completado** o **abandonado**.
- **RN-05 · Desactivación automática.** Cuando un juego pasa a **completado** o **abandonado**, su meta activa se desactiva automáticamente y queda en el historial. Si el juego vuelve a **jugando** o **pausado**, la meta anterior no se reactiva; la persona puede crear una nueva.
- **RN-06 · Historial de metas.** Una meta desactivada se conserva como historial. No se puede editar ni reactivar. Para cambiar de objetivo, la persona edita la meta activa, o la desactiva y crea otra.
- **RN-07 · Eliminar un juego.**
  - Se mantiene la regla de E1: un juego con partidas no se puede eliminar.
  - Si el juego se puede eliminar, **todas sus metas (activas e inactivas) y sus hitos se eliminan con él**. Nunca quedan metas de un juego que ya no existe.

### Semana y días

- **RN-08 · Semana.** La semana va de **lunes a domingo**, en **hora de Ecuador**. «Esta semana» es la que contiene el día de hoy, según la hora de Ecuador.
- **RN-09 · Día de una partida.** Una partida pertenece al **día registrado** como su fecha. Una sesión que cruza la medianoche cuenta completa en el día con el que se registró y no se reparte entre dos días.
- **RN-10 · Partidas con fecha futura.** Una partida con fecha posterior a hoy (hora de Ecuador) **no cuenta** para la semana, los días jugados ni las rachas hasta que llegue su fecha. Se puede seguir registrando como en E1.
- **RN-11 · Horas de la semana.** Las horas de la semana son la suma de la duración de todas las partidas del juego en esta semana, expresada en horas y redondeada a un decimal.
- **RN-12 · Días jugados.** Los días jugados son los días distintos de esta semana con al menos una partida. **Varias partidas el mismo día cuentan como un solo día jugado**, aunque todas sus horas se suman.

### Porcentaje de la meta

- **RN-13 · Porcentaje de horas.** Es igual a las horas de la semana ÷ las horas semanales de la meta × 100, redondeado a un número entero.
  - **No tiene tope:** 7 h con una meta de 5 h se muestran como **140 %**.
  - La barra visual se llena al máximo a partir del 100 % y no se desborda.
- **RN-14 · Meta que cambia a mitad de semana.** El progreso de la semana se calcula **con la meta vigente al consultar**. Si el miércoles se sube la meta de 5 h a 8 h, las 4 h ya jugadas se ven como 50 %. La interfaz indica que el progreso se compara con la meta actual.
- **RN-15 · Sin meta activa.** El juego muestra igualmente sus horas de la semana, sus días jugados y sus rachas. No muestra porcentaje de horas ni días objetivo, e invita a crear una meta.

### Rachas

- **RN-16 · Racha.** Una racha es una serie de **días consecutivos** con al menos una partida **de ese videojuego**. Las partidas de otros juegos no cuentan.
- **RN-17 · Racha actual y día de hoy.** La racha actual es la serie que termina **hoy o ayer**.
  - Si hoy todavía no hay partida pero ayer sí, la racha **sigue viva** y muestra los días acumulados hasta ayer. Si hoy se juega, sube en uno.
  - Si no hubo partida ni hoy ni ayer, la racha actual es 0.
  - *Ejemplo:* jugó ayer, pero no anteayer. Hoy, antes de jugar, la racha es **1**. Si hoy juega, la racha pasa a **2**. Si mañana no juega, pasado mañana la racha es **0**.
- **RN-18 · Mejor racha.** La mejor racha es la serie de días consecutivos más larga de **todo el historial** del juego, incluida la racha actual.

### Hitos

- **RN-19 · Hito alcanzado.** Un hito está alcanzado cuando el **avance actual** del juego es mayor o igual que su porcentaje objetivo. El avance actual es el que ya define E1: el porcentaje registrado en la partida más reciente.
- **RN-20 · El estado del hito no se congela.** Si una partida posterior registra menos avance, los hitos que ya no se cumplen **dejan de estar alcanzados**. El estado siempre refleja el avance actual y no se guarda por separado.

### Casos límite

- **RN-21 · Juego sin partidas.** Horas, días jugados, racha actual y mejor racha son 0, y ningún hito está alcanzado.
- **RN-22 · Juego inexistente.** Si se consulta el progreso o la meta de un juego que no existe, el sistema informa que no se encontró el videojuego.
- **RN-23 · Datos inválidos.** Una meta con datos fuera de los rangos de RN-02 o RN-03 se rechaza con un mensaje que explica qué corregir.

---

## 9. Los ocho casos abiertos de la ficha

| # | Caso | Decisión | Regla |
|---|---|---|---|
| 1 | **Racha y día de hoy:** hoy no hay partida, pero ayer sí. | La racha sigue viva hasta que termina el día de hoy y muestra lo acumulado hasta ayer. Jugar hoy la sube en uno. Se rompe solo si no hay partida ni hoy ni ayer. | RN-17 |
| 2 | **Varias partidas el mismo día.** | Cuentan como **un** día jugado. Sus horas sí se suman. | RN-12, RN-11 |
| 3 | **Partida que cruza la medianoche.** | Pertenece al día con el que se registró. El Diario guarda la fecha de la sesión, no la hora. | RN-09 |
| 4 | **Cambio de meta a mitad de semana.** | Toda la semana se calcula con la meta vigente al consultar, y la interfaz lo indica. | RN-14 |
| 5 | **Meta superada** (7 h con una meta de 5 h). | El porcentaje muestra el valor real (**140 %**), sin tope. La barra se llena al 100 %. | RN-13 |
| 6 | **Hito ya alcanzado y luego menos avance.** | El hito deja de estar alcanzado: siempre refleja el avance actual. | RN-19, RN-20 |
| 7 | **Videojuego completado o abandonado.** | No puede tener meta activa. Al pasar a ese estado, su meta se desactiva sola y queda en el historial. | RN-04, RN-05 |
| 8 | **Eliminar un videojuego con meta.** | Se mantiene la regla de E1 sobre las partidas. Si el juego se elimina, sus metas e hitos se eliminan con él. | RN-07 |

### Huecos adicionales encontrados durante el descubrimiento

| # | Caso | Decisión | Regla |
|---|---|---|---|
| 9 | ¿Qué significa «cumplir» la meta semanal? Lo necesita la métrica de éxito. | Alcanzar las horas **y** los días de la meta en la misma semana. | §5 |
| 10 | Partidas registradas con fecha futura. | No cuentan hasta que llegue su fecha. Se pueden seguir registrando. | RN-10 |
| 11 | ¿Se puede editar o reactivar una meta desactivada? | No. Queda como historial. | RN-06 |
| 12 | ¿Un juego que vuelve a «jugando» recupera su meta? | No. Se crea una meta nueva. | RN-05 |

---

## 10. Supuestos

- **S-01** El Diario lo usa **una sola persona**, que vive en la zona horaria de Ecuador. Por eso todas las fechas se interpretan en hora de Ecuador.
- **S-02** La fecha registrada de cada partida es correcta. El Diario no verifica que la sesión haya ocurrido realmente ese día.
- **S-03** E1 no permite editar partidas. Si se agrega esa función más adelante, el progreso debe actualizarse igual que al registrar o eliminar una partida (A-6).
- **S-04** Una meta puede tener entre 0 y 5 hitos. Dos hitos pueden tener el mismo porcentaje objetivo. Los hitos se muestran ordenados de menor a mayor porcentaje.
- **S-05** La métrica de éxito se mide **fuera del producto**: la persona (o quien revise el proyecto) compara, semana a semana, el progreso semanal mostrado con su meta. El Diario no guarda resultados de semanas pasadas, porque las vistas históricas están fuera de alcance.
- **S-06** Las reglas de E1 siguen vigentes sin cambios: registro de partidas, resumen, logros y la prohibición de eliminar un juego con partidas.

## 11. Puntos abiertos

- **PA-01 · Medición de la métrica.** Sin historial semanal en el producto, el «3 de 4 semanas» se verifica a mano (S-05). Si el cliente quiere medirlo dentro del Diario, hace falta una épica futura de historial, hoy excluida por el no-alcance.
- **PA-02 · Aviso de racha en riesgo.** RN-17 mantiene viva una racha cuando hoy aún no se ha jugado. Se podría mostrar un aviso del tipo «juega hoy para mantener tu racha», pero se acerca a un recordatorio, que está fuera de alcance. Por ahora no se incluye.
