# Backlog E2 · Metas y rachas

- **Épica:** E2 · Metas y rachas (`docs/backlog/epicas.md`).
- **Fuente de verdad:** `docs/prd/diario-gamer.md`. Los IDs `A-`, `RO-`, `D-`, `S-` y `P-` se refieren a ese documento.
- **Estado de E1:** `docs/diagnostico.md` (problemas `B-x`).
- **Fecha:** 11 de noviembre de 2026.

**Contenido:**
1. Historias y criterios.
2. Criterios de la deuda técnica pagada.
3. Tickets.
4. Dependencias.
5. Trazabilidad.
6. Deuda técnica.
7. Verificación INVEST.

**Cómo leer los criterios**
- Los criterios describen comportamiento observable, sin detalle técnico.
- Al final de cada criterio aparecen, en cursiva, las reglas del PRD que verifica.
- «Interpretación» marca un criterio que completa un hueco del PRD por analogía con una regla existente. No es un requisito nuevo (ver §5.3).
- **Fechas de los ejemplos.** Salvo que se indique otra cosa, *hoy* es el **jueves 5 de noviembre de 2026**, en hora de Ecuador. Por tanto, *esta semana* va del lunes 2 al domingo 8 de noviembre de 2026.

---

## 1. Historias de usuario y criterios de aceptación

### HU-01 · Crear una meta semanal

**Como** persona que registra sus partidas, **quiero** crear una meta semanal con horas y días para un videojuego, **para** saber cuánto me propuse jugarlo cada semana.

- **CA-01.1** — **DADO** un juego en estado «jugando» sin meta activa **CUANDO** creo una meta de 5 horas y 4 días por semana **ENTONCES** la meta queda activa y el detalle del juego muestra «5 h» y «4 días» como objetivo. *RO-01, RO-02, RO-06*
- **CA-01.2** — **DADO** un juego en estado «pausado» sin meta activa **CUANDO** creo una meta válida **ENTONCES** la meta queda activa. *D-07*
- **CA-01.3** — **DADO** un juego sin meta activa **CUANDO** creo una meta con 0,1 horas por semana, o con 100 horas por semana **ENTONCES** la meta se acepta en los dos casos. *RO-02*
- **CA-01.4** — **DADO** un juego sin meta activa **CUANDO** intento crear una meta con 0 horas, con horas negativas o con 100,1 horas **ENTONCES** la meta no se crea y se indica que las horas deben ser mayores que 0 y como máximo 100. *RO-02*
- **CA-01.5** — **DADO** un juego sin meta activa **CUANDO** creo una meta con 1 día por semana, o con 7 días por semana **ENTONCES** la meta se acepta en los dos casos. *RO-02*
- **CA-01.6** — **DADO** un juego sin meta activa **CUANDO** intento crear una meta con 0 días, con 8 días o con 3,5 días **ENTONCES** la meta no se crea y se indica que los días deben ser un número entero entre 1 y 7. *RO-02*
- **CA-01.7** — **DADO** un juego sin meta activa **CUANDO** intento crear una meta sin indicar las horas o sin indicar los días **ENTONCES** la meta no se crea y se indica qué dato falta. *RO-02*
- **CA-01.8** — **DADO** un juego que ya tiene una meta activa **CUANDO** intento crear otra meta para ese juego **ENTONCES** la nueva meta no se crea, se muestra el mensaje «Este videojuego ya tiene una meta activa» y la meta existente no cambia. *RO-01, RO-04*
- **CA-01.9** — **DADO** un juego en estado «completado» o «abandonado» **CUANDO** intento crearle una meta **ENTONCES** la meta no se crea y se indica que solo los juegos en estado «jugando» o «pausado» pueden tener una meta activa. *D-07*
- **CA-01.10** — **DADO** un juego sin meta activa que tiene dos metas anteriores desactivadas **CUANDO** creo una meta nueva **ENTONCES** la nueva queda activa y las dos anteriores siguen en el historial sin cambios. *RO-01, RO-06, D-11*
- **CA-01.11** — **DADO** que estoy llenando el formulario de meta **CUANDO** el sistema rechaza los datos **ENTONCES** veo el mensaje junto al formulario y lo que escribí se conserva para corregirlo. *RO-02, RO-04*

### HU-02 · Definir los hitos de la meta

**Como** persona que registra sus partidas, **quiero** agregar a mi meta hasta cinco hitos de avance, **para** tener objetivos intermedios dentro del juego.

- **CA-02.1** — **DADO** que estoy creando o editando una meta **CUANDO** agrego el hito «Llegar al 50 %» con objetivo 50 **ENTONCES** la meta guarda ese hito con su descripción y su porcentaje objetivo. *RO-03*
- **CA-02.2** — **DADO** que estoy creando una meta **CUANDO** agrego hitos con objetivo 1 % y 100 % **ENTONCES** los dos se aceptan. *RO-03*
- **CA-02.3** — **DADO** que estoy creando una meta **CUANDO** agrego un hito con objetivo 0 %, 101 % o un valor negativo **ENTONCES** la meta no se guarda y se indica que el objetivo debe estar entre 1 y 100. *RO-03*
- **CA-02.4** — **DADO** que estoy creando una meta **CUANDO** agrego exactamente 5 hitos válidos **ENTONCES** la meta se guarda con los 5. *RO-03*
- **CA-02.5** — **DADO** una meta con 5 hitos **CUANDO** intento agregar un sexto **ENTONCES** no se permite y se indica que el máximo es de 5 hitos. *RO-03*
- **CA-02.6** — **DADO** que estoy creando una meta **CUANDO** agrego un hito con la descripción vacía o formada solo por espacios **ENTONCES** la meta no se guarda y se indica que el hito necesita una descripción. *RO-03*
- **CA-02.7** — **DADO** que estoy creando una meta **CUANDO** la guardo sin hitos **ENTONCES** la meta se crea con su lista de hitos vacía. *S-03*
- **CA-02.8** — **DADO** que estoy creando una meta **CUANDO** agrego dos hitos con el mismo objetivo (50 %) y descripciones distintas **ENTONCES** se aceptan los dos. *S-03*

### HU-03 · Consultar las metas de un videojuego

**Como** persona que registra sus partidas, **quiero** consultar la meta activa y las metas anteriores de un juego, **para** recordar lo que me propuse y cómo fue cambiando.

- **CA-03.1** — **DADO** un juego con una meta activa de 5 h y 4 días y dos hitos **CUANDO** abro el detalle del juego **ENTONCES** veo las horas por semana, los días por semana y los hitos de esa meta. *RO-06, RO-18*
- **CA-03.2** — **DADO** un juego con una meta activa y dos metas desactivadas **CUANDO** consulto sus metas **ENTONCES** veo las tres, con la activa claramente distinguida de las anteriores. *RO-06*
- **CA-03.3** — **DADO** un juego que nunca tuvo meta **CUANDO** consulto sus metas **ENTONCES** veo que no tiene ninguna y una invitación a crear una. No se muestra como error. *RO-06, RO-14*
- **CA-03.4** — **DADO** una meta existente **CUANDO** la consulto de forma individual **ENTONCES** veo sus horas, días, hitos y si está activa o desactivada. *RO-06*
- **CA-03.5** — **DADO** dos juegos, cada uno con su meta **CUANDO** consulto las metas de uno de ellos **ENTONCES** no aparece ninguna meta del otro juego. *RO-06*

### HU-04 · Editar la meta activa

**Como** persona que registra sus partidas, **quiero** editar mi meta activa, **para** ajustarla si me propuse demasiado o muy poco.

- **CA-04.1** — **DADO** una meta activa de 5 h y 4 días **CUANDO** la cambio a 8 h y 5 días **ENTONCES** la meta guarda los valores nuevos y el progreso de esta semana se compara con 8 h y 5 días. *RO-06, D-04*
- **CA-04.2** — **DADO** una meta activa de 5 h y 4 h jugadas esta semana **CUANDO** el miércoles cambio la meta a 8 h **ENTONCES** el progreso semanal muestra 50 % y la interfaz indica que se compara con la meta actual. *D-04*
- **CA-04.3** — **DADO** una meta activa con dos hitos **CUANDO** agrego un hito, quito otro y cambio la descripción del restante **ENTONCES** la meta queda con exactamente los hitos resultantes. *RO-03, RO-06*
- **CA-04.4** — **DADO** una meta activa válida **CUANDO** intento guardarla con 0 horas, con 8 días o con 6 hitos **ENTONCES** se rechaza con el mensaje correspondiente y la meta conserva sus valores anteriores. *RO-02, RO-03*
- **CA-04.5** — **DADO** una meta desactivada **CUANDO** intento editarla **ENTONCES** se rechaza con un mensaje que indica que las metas desactivadas no se pueden editar, y la meta no cambia. *D-11*

### HU-05 · Desactivar la meta activa

**Como** persona que registra sus partidas, **quiero** desactivar mi meta activa, **para** dejar de seguirla sin perder su registro.

- **CA-05.1** — **DADO** el juego «Hades» con una meta activa **CUANDO** elijo desactivarla **ENTONCES** se me pide confirmar con el mensaje «¿Desactivar la meta de Hades?». *RO-06*
- **CA-05.2** — **DADO** la confirmación anterior **CUANDO** confirmo **ENTONCES** la meta pasa a desactivada, aparece entre las metas anteriores y el progreso del juego muestra el caso «sin meta activa» (ver HU-09). *RO-06, RO-14*
- **CA-05.3** — **DADO** la confirmación anterior **CUANDO** cancelo **ENTONCES** la meta sigue activa y sin cambios. *RO-06*
- **CA-05.4** — **DADO** una meta ya desactivada **CUANDO** intento desactivarla de nuevo **ENTONCES** se rechaza con un mensaje que indica que la meta ya está desactivada. *Interpretación de D-11 (I-3)*
- **CA-05.5** — **DADO** una meta desactivada **CUANDO** intento volver a activarla **ENTONCES** se rechaza y la meta sigue desactivada. Para tener una meta activa hay que crear una nueva. *D-11*

### HU-06 · Ver las horas y los días jugados de esta semana

**Como** persona que registra sus partidas, **quiero** ver cuántas horas y cuántos días jugué esta semana frente a mi meta, **para** saber si voy al ritmo que me propuse.

- **CA-06.1** — **DADO** una meta de 5 h y 4 días, y partidas de este juego el lunes (60 min), el martes (90 min) y el miércoles (60 min) **CUANDO** consulto el progreso **ENTONCES** veo la semana del 2 al 8 de noviembre, 3,5 h, 70 % y 3 de 4 días jugados. *RO-07, RO-08, RO-09, RO-10, RO-18*
- **CA-06.2** — **DADO** una meta de 3 h y una sola partida esta semana de 100 minutos **CUANDO** consulto el progreso **ENTONCES** veo 1,7 h y 57 %. El porcentaje se calcula sobre las horas ya redondeadas. *RO-08, RO-09*
- **CA-06.3** — **DADO** dos partidas el martes (30 y 60 minutos) y ninguna otra esta semana **CUANDO** consulto el progreso **ENTONCES** veo 1 día jugado y 1,5 h. *D-02, RO-10*
- **CA-06.4** — **DADO** una partida registrada con fecha domingo 8 de noviembre, que en realidad terminó la madrugada del lunes 9 **CUANDO** consulto el progreso el domingo 8 **ENTONCES** la partida cuenta completa en la semana del 2 al 8 de noviembre y no se reparte con la siguiente. *D-03*
- **CA-06.5** — **DADO** una partida el domingo 1 de noviembre y otra el lunes 2 de noviembre **CUANDO** consulto el progreso **ENTONCES** solo la del lunes 2 cuenta en esta semana. *RO-07*
- **CA-06.6** — **DADO** que son las 20:00 del domingo 8 de noviembre en Ecuador (en otras zonas horarias ya es lunes) **CUANDO** consulto el progreso **ENTONCES** la semana mostrada sigue siendo la del 2 al 8 de noviembre y las partidas del domingo 8 cuentan en ella. *RO-07*
- **CA-06.7** — **DADO** una meta de 5 h y 7 h jugadas esta semana **CUANDO** consulto el progreso **ENTONCES** veo 140 % y la barra de horas aparece llena, sin desbordarse. *D-05*
- **CA-06.8** — **DADO** que el jueves 5 registré una partida con fecha sábado 7 de noviembre **CUANDO** consulto el progreso el jueves 5 **ENTONCES** esa partida no suma horas ni días. **Y CUANDO** consulto el sábado 7 **ENTONCES** sí cuenta. *D-10*
- **CA-06.9** — **DADO** partidas de esta semana de otro videojuego **CUANDO** consulto el progreso de este juego **ENTONCES** esas partidas no suman horas ni días. *RO-08, RO-10*
- **CA-06.10** — **DADO** que estoy viendo el progreso de un juego **CUANDO** registro una partida de ese juego con fecha de hoy y vuelvo a su detalle **ENTONCES** las horas, los días y la racha ya reflejan la partida nueva, sin recargar la página a mano. *RO-19*
- **CA-06.11** — **DADO** una partida de esta semana **CUANDO** la elimino desde el historial de partidas y vuelvo al detalle del juego **ENTONCES** el progreso ya no la cuenta. *RO-19*
- **CA-06.12** — **DADO** que el progreso semanal no se puede obtener **CUANDO** abro el detalle del juego **ENTONCES** veo un mensaje de error con la opción de intentar de nuevo, y el resto del detalle sigue visible. Mientras el progreso carga, veo un indicador de carga. *RO-18*

### HU-07 · Ver la racha actual y la mejor racha

**Como** persona que registra sus partidas, **quiero** ver mi racha actual y mi mejor racha en un juego, **para** saber si estoy siendo constante.

- **CA-07.1** — **DADO** una partida ayer (miércoles 4), ninguna el martes 3 y ninguna hoy **CUANDO** consulto el progreso **ENTONCES** la racha actual es 1. *D-01*
- **CA-07.2** — **DADO** la situación de CA-07.1 **CUANDO** registro una partida con fecha de hoy **ENTONCES** la racha actual pasa a 2. *D-01*
- **CA-07.3** — **DADO** que la última partida fue anteayer (martes 3), sin partidas ayer ni hoy, y que la mejor racha era 6 **CUANDO** consulto el progreso **ENTONCES** la racha actual es 0 y la mejor racha sigue siendo 6. *D-01, RO-12*
- **CA-07.4** — **DADO** partidas el lunes, martes, miércoles y jueves de esta semana (hoy es jueves) **CUANDO** consulto el progreso **ENTONCES** la racha actual es 4. *RO-11*
- **CA-07.5** — **DADO** un historial con 9 días consecutivos en octubre, después días sin jugar, y 4 días consecutivos que terminan hoy **CUANDO** consulto el progreso **ENTONCES** la racha actual es 4 y la mejor racha es 9. *RO-12*
- **CA-07.6** — **DADO** tres partidas el martes y una el miércoles, y ninguna otra **CUANDO** consulto el progreso el miércoles **ENTONCES** la racha actual es 2, porque el martes cuenta como un solo día. *D-02*
- **CA-07.7** — **DADO** partidas el 30 y el 31 de octubre y el 1 y el 2 de noviembre, y que hoy es el lunes 2 de noviembre **CUANDO** consulto el progreso **ENTONCES** la racha actual es 4, aunque cruce un cambio de mes y de semana. *RO-12*
- **CA-07.8** — **DADO** partidas del 30 de diciembre de 2026 al 2 de enero de 2027, y que hoy es el 2 de enero de 2027 **CUANDO** consulto el progreso **ENTONCES** la racha actual es 4, aunque cruce un cambio de año. *RO-12*
- **CA-07.9** — **DADO** una partida de este juego ayer y una partida de **otro** juego hoy **CUANDO** consulto la racha de este juego **ENTONCES** la racha actual es 1: las partidas de otros juegos no cuentan. *RO-11*
- **CA-07.10** — **DADO** partidas ayer y hoy, y otra registrada con fecha de mañana **CUANDO** consulto el progreso hoy **ENTONCES** la racha actual es 2 y la partida de mañana no la extiende. *D-10*
- **CA-07.11** — **DADO** que la racha actual (5 días) es la serie más larga del historial **CUANDO** consulto el progreso **ENTONCES** la mejor racha también es 5. *RO-12*

### HU-08 · Ver los hitos alcanzados y pendientes

**Como** persona que registra sus partidas, **quiero** ver qué hitos de mi meta alcancé y cuáles me faltan, **para** reconocer mi avance en el juego.

- **CA-08.1** — **DADO** una meta con hitos de 25 %, 50 % y 100 %, y un avance actual del juego de 60 % **CUANDO** consulto el progreso **ENTONCES** los hitos de 25 % y 50 % aparecen como «Alcanzado» y el de 100 % como «Pendiente». Cada estado se indica con texto, no solo con color. *RO-13, RO-18*
- **CA-08.2** — **DADO** un hito de 50 % y un avance actual de exactamente 50 % **CUANDO** consulto el progreso **ENTONCES** ese hito aparece como alcanzado. *RO-13*
- **CA-08.3** — **DADO** un hito de 50 % alcanzado con un avance de 60 % **CUANDO** registro una partida más reciente con un avance de 40 % **ENTONCES** el hito de 50 % aparece como pendiente. *D-06, RO-13*
- **CA-08.4** — **DADO** partidas con 70 % el lunes y 40 % el martes **CUANDO** consulto el progreso **ENTONCES** el avance que se usa para los hitos es 40 % (el de la partida más reciente, como en el resumen de E1) y no el máximo histórico. *RO-13*
- **CA-08.5** — **DADO** una meta activa sin hitos **CUANDO** consulto el progreso **ENTONCES** la sección de hitos indica que la meta no tiene hitos, sin mostrar un error. *S-03, RO-18*

### HU-09 · Ver el progreso sin meta activa o sin partidas

**Como** persona que registra sus partidas, **quiero** ver mis horas, días y rachas aunque no tenga una meta activa, **para** conocer mi constancia antes de proponerme un objetivo.

- **CA-09.1** — **DADO** un juego **sin meta activa** con partidas esta semana **CUANDO** consulto el progreso **ENTONCES**:
  - Veo las horas de la semana, los días jugados, la racha actual y la mejor racha.
  - No veo porcentaje de horas, días objetivo ni hitos.
  - Veo una invitación a crear una meta.

  *RO-14*
- **CA-09.2** — **DADO** un juego **sin partidas** y con una meta activa de 5 h y 4 días, con hitos de 25 % y 50 % **CUANDO** consulto el progreso **ENTONCES** veo 0 h, 0 %, 0 de 4 días, racha actual 0, mejor racha 0 y ningún hito alcanzado. *RO-15*
- **CA-09.3** — **DADO** un juego **sin partidas y sin meta activa** **CUANDO** consulto el progreso **ENTONCES** veo 0 h, 0 días y rachas en 0, y una invitación a crear una meta. No se muestra como error. *RO-14, RO-15*
- **CA-09.4** — **DADO** un juego con partidas solo en semanas anteriores (con una mejor racha de 3) **CUANDO** consulto el progreso **ENTONCES** las horas y los días de esta semana son 0, la racha actual es 0 y la mejor racha es 3. *RO-08, RO-10, RO-12*

### HU-10 · Eliminar un videojuego sin dejar metas sueltas

**Como** persona que registra sus partidas, **quiero** que al eliminar un videojuego también se eliminen sus metas, **para** no conservar datos de un juego que ya no existe.

- **CA-10.1** — **DADO** un juego sin partidas, con una meta activa y una desactivada **CUANDO** elimino el juego **ENTONCES** se eliminan el juego, sus dos metas y sus hitos. Si después consulto cualquiera de esas metas, se informa que no se encontró. *RO-17, D-08*
- **CA-10.2** — **DADO** un juego con partidas y una meta activa **CUANDO** intento eliminarlo **ENTONCES** se rechaza como en E1, porque tiene partidas, y el juego y su meta siguen intactos. *D-08, RO-20*
- **CA-10.3** — **DADO** dos juegos, cada uno con su meta **CUANDO** elimino uno de ellos **ENTONCES** la meta del otro juego no cambia. *RO-17*

### HU-11 · Desactivar la meta al cerrar un videojuego

**Como** persona que registra sus partidas, **quiero** que al marcar un juego como completado o abandonado su meta se desactive sola, **para** no seguir midiendo un objetivo que ya no aplica.

- **CA-11.1** — **DADO** un juego «jugando» con una meta activa **CUANDO** cambio su estado a «completado» **ENTONCES** la meta queda desactivada, aparece entre las metas anteriores y el progreso muestra el caso «sin meta activa». *D-07*
- **CA-11.2** — **DADO** un juego «pausado» con una meta activa **CUANDO** cambio su estado a «abandonado» **ENTONCES** la meta queda desactivada. *D-07*
- **CA-11.3** — **DADO** un juego «jugando» con una meta activa **CUANDO** cambio su estado a «pausado» **ENTONCES** la meta sigue activa. *D-07*
- **CA-11.4** — **DADO** un juego «completado» cuya meta se desactivó al cerrarlo **CUANDO** vuelvo a ponerlo en «jugando» **ENTONCES** el juego no tiene meta activa y puedo crear una nueva. La anterior sigue desactivada. *D-12*
- **CA-11.5** — **DADO** un juego «jugando» con una meta activa **CUANDO** cambio solo su nombre o su plataforma **ENTONCES** la meta no cambia. *RO-20*

### HU-12 · Recibir mensajes claros ante recursos inexistentes o datos inválidos

**Como** persona que registra sus partidas, **quiero** recibir mensajes claros cuando un juego o una meta no existe o cuando un dato no es válido, **para** entender qué pasó y qué hacer.

- **CA-12.1** — **DADO** un videojuego que **no existe** **CUANDO** consulto su progreso o sus metas, o intento crearle una meta **ENTONCES** se informa «Videojuego no encontrado» y no se crea nada. *RO-05, RO-16*
- **CA-12.2** — **DADO** un identificador de videojuego con un **formato no válido** (por ejemplo «abc») **CUANDO** consulto su progreso **ENTONCES** se informa que el identificador no es válido, con un mensaje distinto al de «no encontrado». *RO-16*
- **CA-12.3** — **DADO** una meta que **no existe** **CUANDO** intento consultarla, editarla o desactivarla **ENTONCES** se informa «Meta no encontrada». *Interpretación de RO-16 (I-2)*
- **CA-12.4** — **DADO** un identificador de meta con un formato no válido **CUANDO** intento consultarla **ENTONCES** se informa que el identificador no es válido. *Interpretación de RO-16 (I-2)*
- **CA-12.5** — **DADO** que ocurre un fallo inesperado al consultar el progreso o las metas **CUANDO** se informa el error **ENTONCES** el mensaje es genérico, no expone detalles internos e incluye un identificador de la solicitud para poder diagnosticarla. *RO-16; requisito del manejo centralizado de errores del enunciado*

---

## 2. Criterios de la deuda técnica pagada

El enunciado exige pagar al menos dos problemas del diagnóstico con el ciclo completo: criterio, test, código y verificación. Estos criterios son **técnicos por naturaleza** y no forman parte de ninguna historia de usuario.

### DT-1 · Errores de dominio en un módulo común (diagnóstico B4)

- **CA-DT1.1** — **DADO** los errores de E1 (identificador inválido, videojuego no encontrado, partida no encontrada, logro no encontrado, videojuego con partidas) **CUANDO** ocurren después del cambio **ENTONCES** se informan con la misma categoría y el mismo mensaje que antes. No hay regresión.
- **CA-DT1.2** — **DADO** los errores nuevos de metas (meta no encontrada, segunda meta activa, datos de meta inválidos, juego cerrado, meta desactivada) **CUANDO** ocurren **ENTONCES** cada uno se informa en su categoría: solicitud inválida, no encontrado o conflicto. Ningún servicio depende de otro para declarar sus errores.

### DT-2 · Respuestas 413/415 y README coherente (diagnóstico B6)

- **CA-DT2.1** — **DADO** una solicitud con un cuerpo mayor que el límite permitido **CUANDO** llega al sistema **ENTONCES** se informa que el cuerpo es demasiado grande (413) y no un error interno.
- **CA-DT2.2** — **DADO** una solicitud con una codificación o un juego de caracteres no soportado **CUANDO** llega al sistema **ENTONCES** se informa «tipo de contenido no soportado» (415) y no un error interno.
- **CA-DT2.3** — **DADO** una solicitud con datos mal formados **CUANDO** llega al sistema **ENTONCES** se sigue informando como solicitud inválida (400), y la tabla de errores del README coincide con el comportamiento real.

---

## 3. Tickets

**Definition of Done común** (aplica a todos los tickets, además de su DoD propia):
1. Existe una spec commiteada **antes** que el código. No aplica a los tickets de documentación.
2. Los tests del backend pasan (`npm test`).
3. El build del backend y el build y el lint del frontend pasan.
4. Los criterios relacionados están verificados y la evidencia queda anotada para `docs/AUDITORIA.md`.
5. El commit nombra el ticket. Ejemplos: `feat(E2): T-14 crear meta`, `test(E2): T-07 …`, `docs(E2): T-01 …`.
6. No se leyó ni se modificó ningún archivo `.env`.

**Tipos:** documentación · test · backend · frontend · integración.

### Preparación

#### T-01 · Registrar decisiones en el diagnóstico

- **Tipo:** documentación.
- **Historia:** proceso. Resuelve P-01 y P-02 y habilita HU-11.
- **Criterios:** habilita CA-11.1 a CA-11.5.
- **Descripción:**
  - Agregar a `docs/diagnostico.md` la sección «Decisiones tomadas».
  - Marcar B2 (zona horaria) y B3 (meta por videojuego) como resueltos por la ficha.
  - Registrar el cambio sobre E1 de D-07 y D-08.
  - Registrar qué deuda se paga (B4, B6) y cuál se difiere.
- **Dependencias:** ninguna.
- **DoD:** el diagnóstico cumple el contenido mínimo del enunciado (estado, tabla bloquea / se difiere, decisiones tomadas), y AGENTS.md (regla 5) queda satisfecho para D-07.

#### T-02 · Spec del backend: Meta y progreso semanal

- **Tipo:** documentación.
- **Historia:** HU-01 a HU-12 (parte de sistema), DT-1 y DT-2.
- **Criterios:** todos los CA verificables en el backend.
- **Descripción:** crear `docs/specs/` con `/nueva-spec backend …`. Debe incluir:
  - Reglas DEBE / NO DEBE.
  - El contrato.
  - La tabla criterio → verificación, con al menos un test por cada criterio verificable sin base de datos.
  - La tabla ticket → archivos para T-04 a T-21.
- **Dependencias:** T-01.
- **DoD:** cada CA del backend aparece en la tabla criterio → verificación, y la spec está commiteada antes de T-04.

#### T-03 · Spec del frontend: progreso semanal y formulario de meta

- **Tipo:** documentación.
- **Historia:** HU-01 a HU-09 (parte de interfaz), HU-12.
- **Criterios:** CA de interfaz (CA-01.11, CA-04.2, CA-05.1, CA-06.7, CA-06.10 a CA-06.12, CA-08.1, CA-08.5, CA-09.1, CA-09.3, entre otros).
- **Descripción:** crear la spec con `/nueva-spec frontend …`, alineada con DESIGN.md: componentes, tono, accesibilidad y estados de carga, error y vacío.
- **Dependencias:** T-02, porque consume su contrato.
- **DoD:** cada CA de interfaz tiene verificación (manual con captura o revisión de diseño), y la spec está commiteada antes de T-22.

#### T-04 · Infraestructura de tests del backend

- **Tipo:** test.
- **Historia:** proceso. Resuelve el diagnóstico B1 y lo exige el enunciado («tests automatizados»).
- **Criterios:** habilita todos los criterios verificados con tests.
- **Descripción:** configurar el ejecutor de tests del backend y el comando `npm test`, con un test trivial que pase y la posibilidad de probar el manejo de errores sin base de datos.
- **Dependencias:** T-02.
- **DoD:** `npm test` existe, corre en local y termina en verde, y AGENTS.md ya no necesita el comando provisional.

### Deuda técnica pagada

#### T-05 · Errores de dominio en un módulo común

- **Tipo:** backend.
- **Historia:** DT-1 (diagnóstico B4).
- **Criterios:** CA-DT1.1, CA-DT1.2.
- **Descripción:** mover las clases de error de dominio a un módulo propio y hacer que el manejo centralizado de errores las clasifique por categoría (inválido / no encontrado / conflicto). Se deja preparado para los errores de metas.
- **Dependencias:** T-04.
- **DoD:** primero se escriben los tests de CA-DT1.1 (sin regresión) y después se hace el cambio. Los tests quedan en verde.

#### T-06 · Respuestas 413/415 y README coherente

- **Tipo:** backend.
- **Historia:** DT-2 (diagnóstico B6).
- **Criterios:** CA-DT2.1, CA-DT2.2, CA-DT2.3.
- **Descripción:** que los errores de cuerpo demasiado grande y de codificación no soportada se informen con su código, y alinear la tabla de errores del README con el comportamiento real.
- **Dependencias:** T-05.
- **DoD:** un test por cada criterio, en verde, y el README revisado.

### Dominio: cálculos puros (primero el test, después el código)

#### T-07 · Tests: semana, horas y días jugados

- **Tipo:** test.
- **Historia:** HU-06, HU-09.
- **Criterios:** CA-06.1 a CA-06.9, CA-09.2, CA-09.4.
- **Descripción:** escribir los tests de las funciones puras de semana (lunes a domingo, hora de Ecuador), horas redondeadas, porcentaje sin tope, días distintos y exclusión de fechas futuras. Los tests deben fallar al inicio.
- **Dependencias:** T-04.
- **DoD:** un test por criterio listado, commiteado antes que T-08.

#### T-08 · Funciones puras: semana, horas y días jugados

- **Tipo:** backend.
- **Historia:** HU-06, HU-09.
- **Criterios:** CA-06.1 a CA-06.9, CA-09.2, CA-09.4.
- **Descripción:** implementar los cálculos sin acceso a datos, en la capa de dominio.
- **Dependencias:** T-07.
- **DoD:** los tests de T-07 en verde, y las funciones no dependen de la base de datos.

#### T-09 · Tests: racha actual y mejor racha

- **Tipo:** test.
- **Historia:** HU-07, HU-09.
- **Criterios:** CA-07.1 a CA-07.11, CA-09.2, CA-09.4.
- **Descripción:** escribir los tests de las rachas:
  - D-01 (hoy y ayer).
  - D-02 (un día por fecha).
  - Cambios de mes y de año.
  - Racha rota.
  - Fechas futuras.
- **Dependencias:** T-04.
- **DoD:** un test por criterio listado, commiteado antes que T-10.

#### T-10 · Funciones puras: racha actual y mejor racha

- **Tipo:** backend.
- **Historia:** HU-07, HU-09.
- **Criterios:** CA-07.1 a CA-07.11.
- **Descripción:** implementar el cálculo de rachas sobre todo el historial de fechas.
- **Dependencias:** T-09, y reutiliza el «hoy» de Ecuador de T-08.
- **DoD:** los tests de T-09 en verde.

#### T-11 · Tests: estado de los hitos

- **Tipo:** test.
- **Historia:** HU-08, HU-09.
- **Criterios:** CA-08.1 a CA-08.4, CA-09.2.
- **Descripción:** escribir los tests del estado alcanzado o pendiente según el avance actual, con el límite igual al objetivo, el avance que baja (D-06) y el caso sin partidas.
- **Dependencias:** T-04.
- **DoD:** un test por criterio listado, commiteado antes que T-12.

#### T-12 · Funciones puras: estado de los hitos

- **Tipo:** backend.
- **Historia:** HU-08.
- **Criterios:** CA-08.1 a CA-08.4.
- **Descripción:** calcular el estado de cada hito sin guardarlo.
- **Dependencias:** T-11.
- **DoD:** los tests de T-11 en verde.

### Meta

#### T-13 · Entidad Meta y sus validaciones

- **Tipo:** backend.
- **Historia:** HU-01, HU-02.
- **Criterios:** CA-01.3 a CA-01.7, CA-02.2 a CA-02.8.
- **Descripción:** definir la entidad Meta con sus validaciones:
  - Rangos de horas y días.
  - Hitos de 1 a 100, con un máximo de 5 y descripción obligatoria.
  - Activa por defecto y con fechas de creación y actualización.
- **Dependencias:** T-02, T-04.
- **DoD:** tests de los valores límite en verde.

#### T-14 · Crear meta

- **Tipo:** backend.
- **Historia:** HU-01, HU-02, HU-12.
- **Criterios:** CA-01.1, CA-01.2, CA-01.8, CA-01.9, CA-01.10, CA-02.1, CA-12.1.
- **Descripción:** permitir crear una meta para un juego existente. Debe rechazar la segunda meta activa (conflicto) y los juegos completados o abandonados.
- **Dependencias:** T-05, T-13.
- **DoD:** tests de creación correcta, duplicada, juego cerrado y juego inexistente, en verde.

#### T-15 · Consultar una meta y listar las metas de un juego

- **Tipo:** backend.
- **Historia:** HU-03, HU-12.
- **Criterios:** CA-03.2, CA-03.4, CA-03.5, CA-12.1, CA-12.3, CA-12.4.
- **Descripción:** consultar una meta por su identificador y listar las metas de un juego, distinguiendo la activa de las anteriores.
- **Dependencias:** T-05, T-13.
- **DoD:** tests en verde, incluidos los de la meta inexistente y el identificador inválido.

#### T-16 · Editar la meta activa

- **Tipo:** backend.
- **Historia:** HU-04.
- **Criterios:** CA-04.1, CA-04.3, CA-04.4, CA-04.5.
- **Descripción:** permitir editar las horas, los días y los hitos de la meta activa, con las mismas validaciones, y rechazar la edición de metas desactivadas.
- **Dependencias:** T-15.
- **DoD:** tests en verde, incluido el de que una edición inválida no altera la meta.

#### T-17 · Desactivar la meta activa

- **Tipo:** backend.
- **Historia:** HU-05.
- **Criterios:** CA-05.2, CA-05.4, CA-05.5, CA-12.3.
- **Descripción:** desactivar la meta activa, rechazar la desactivación de una meta ya inactiva y no permitir reactivarla.
- **Dependencias:** T-15.
- **DoD:** tests en verde.

### Progreso e integración con E1

#### T-18 · Consulta del progreso semanal

- **Tipo:** backend.
- **Historia:** HU-06, HU-07, HU-08, HU-09, HU-12.
- **Criterios:** CA-04.2, CA-06.1 a CA-06.9, CA-07.1 a CA-07.11, CA-08.1 a CA-08.4, CA-09.1 a CA-09.4, CA-12.1, CA-12.2, CA-12.5.
- **Descripción:** obtener las partidas del juego, la meta activa y el avance actual de E1, y combinarlos con las funciones puras. El servicio no calcula nada por su cuenta.
- **Dependencias:** T-08, T-10, T-12, T-15.
- **DoD:** tests de integración de los casos sin meta, sin partidas, juego inexistente e identificador inválido, en verde. El resumen de E1 queda sin cambios (RO-20).

#### T-19 · Desactivar la meta al cerrar un videojuego

- **Tipo:** integración.
- **Historia:** HU-11.
- **Criterios:** CA-11.1 a CA-11.5.
- **Descripción:** al cambiar el estado de un videojuego a «completado» o «abandonado», desactivar su meta activa. Ningún otro cambio del videojuego afecta a la meta.
- **Dependencias:** T-01, porque la decisión debe estar registrada, y T-17.
- **DoD:** tests en verde de las cinco transiciones de los criterios, sin regresiones en la edición de videojuegos de E1.

#### T-20 · Eliminar las metas al eliminar un videojuego

- **Tipo:** integración.
- **Historia:** HU-10.
- **Criterios:** CA-10.1, CA-10.2, CA-10.3.
- **Descripción:** extender la eliminación de videojuegos de E1 para que borre sus metas. Se mantiene el bloqueo si el juego tiene partidas.
- **Dependencias:** T-13.
- **DoD:** tests en verde. No quedan metas de juegos eliminados.

#### T-21 · Tabla de pruebas manuales de la API

- **Tipo:** test.
- **Historia:** HU-06, HU-07, HU-09, HU-12. Lo exige el enunciado en la fase 6.
- **Criterios:** CA-01.8, CA-07.5, CA-09.2, CA-12.1, CA-12.2.
- **Descripción:** documentar las pruebas hechas con curl o Thunder Client:
  - Un juego sin partidas.
  - Un juego con al menos cinco partidas en días distintos y una racha rota.
  - Los errores de solicitud inválida, no encontrado y conflicto.
- **Dependencias:** T-14, T-15, T-16, T-17, T-18, T-19, T-20.
- **DoD:** la tabla, con la solicitud, la respuesta esperada y la obtenida, queda anotada como evidencia para la auditoría.

### Frontend

#### T-22 · Tokens de espaciado y estilos base de E2

- **Tipo:** frontend.
- **Historia:** proceso. Lo exige el enunciado («estilos solo desde variables de DESIGN.md») y DESIGN.md §4.
- **Criterios:** habilita CA-06.7, CA-08.1, CA-09.1.
- **Descripción:** agregar los tokens `--space-*` definidos en DESIGN.md. No se cambia el aspecto actual.
- **Dependencias:** T-03.
- **DoD:** el build y el lint pasan, y las pantallas de E1 se ven igual que antes.

#### T-23 · Servicio de metas y progreso en el frontend

- **Tipo:** frontend.
- **Historia:** HU-01 a HU-09. Lo exige el enunciado («metasApi.ts separado de los componentes»).
- **Criterios:** habilita los CA de interfaz de HU-01 a HU-09.
- **Descripción:** crear el servicio y los tipos para crear, consultar, listar, editar y desactivar metas y para consultar el progreso. Los mensajes del sistema llegan tal cual a la interfaz.
- **Dependencias:** T-03, T-18.
- **DoD:** ningún componente llama directamente al sistema, y el build y el lint pasan.

#### T-24 · Sección de progreso semanal en el detalle del juego

- **Tipo:** frontend.
- **Historia:** HU-06, HU-07, HU-08, HU-09.
- **Criterios:** CA-04.2, CA-06.1, CA-06.7, CA-06.12, CA-07.4, CA-07.5, CA-08.1, CA-08.5, CA-09.1, CA-09.2, CA-09.3.
- **Descripción:** mostrar, dentro del detalle:
  - Barra de horas frente a la meta.
  - Días jugados frente a los días objetivo.
  - Racha actual y mejor racha.
  - Lista de hitos con su estado en texto.
  - El aviso «se compara con tu meta actual».
  - Los estados de carga, error y vacío, y el caso sin meta con su invitación.
- **Dependencias:** T-22, T-23.
- **DoD:** cada criterio verificado manualmente con una captura, y las barras con sus atributos de accesibilidad.

#### T-25 · Formulario para crear y editar la meta con sus hitos

- **Tipo:** frontend.
- **Historia:** HU-01, HU-02, HU-04.
- **Criterios:** CA-01.1, CA-01.4, CA-01.6, CA-01.8, CA-01.11, CA-02.1, CA-02.3, CA-02.5, CA-02.6, CA-04.1, CA-04.3, CA-04.4.
- **Descripción:** formulario accesible con horas, días y una lista editable de hitos (máximo 5). Valida antes de enviar y muestra los mensajes del sistema conservando lo escrito.
- **Dependencias:** T-23, T-24.
- **DoD:** cada criterio verificado manualmente y el formulario se puede completar con teclado.

#### T-26 · Desactivar la meta y ver las metas anteriores

- **Tipo:** frontend.
- **Historia:** HU-03, HU-05.
- **Criterios:** CA-03.1, CA-03.2, CA-03.3, CA-05.1, CA-05.2, CA-05.3.
- **Descripción:** acción de desactivar con confirmación que nombra el juego, y lista simple de metas anteriores en el detalle. Sin gráficos.
- **Dependencias:** T-25.
- **DoD:** cada criterio verificado manualmente.

#### T-27 · Volver a consultar el progreso después de registrar o eliminar una partida

- **Tipo:** integración.
- **Historia:** HU-06, HU-07.
- **Criterios:** CA-06.10, CA-06.11, CA-07.2.
- **Descripción:** garantizar que, después de registrar o eliminar una partida, el detalle del juego muestre el progreso actualizado sin recargar a mano.
- **Dependencias:** T-24.
- **DoD:** el flujo se verifica en el navegador para registrar y para eliminar.

#### T-28 · Revisión de diseño contra DESIGN.md

- **Tipo:** frontend.
- **Historia:** proceso. Lo exige el enunciado en la fase 7.
- **Criterios:** CA-06.7, CA-08.1, CA-09.1 (presentación y accesibilidad).
- **Descripción:** revisar con el agente las pantallas de E2 contra DESIGN.md y corregir las desviaciones.
- **Dependencias:** T-24, T-25, T-26, T-27.
- **DoD:** la tabla de revisión de diseño queda documentada y sin desviaciones abiertas, o con su justificación.

### Cierre

#### T-29 · Auditoría de las specs

- **Tipo:** documentación.
- **Historia:** proceso. Lo exige el enunciado en la fase 9.
- **Criterios:** todos.
- **Descripción:** crear `docs/AUDITORIA.md` con una fila por criterio de cada spec (cómo se verificó, resultado y evidencia) y marcar los tickets terminados en este backlog.
- **Dependencias:** T-06, T-21, T-28.
- **DoD:** ningún criterio queda sin fila en la auditoría.

#### T-30 · README, `.env.example` y bitácora del agente

- **Tipo:** documentación.
- **Historia:** proceso. Son entregables finales del enunciado.
- **Criterios:** ninguno de producto.
- **Descripción:**
  - Agregar al README la sección «Cómo trabajamos con el agente».
  - Actualizar `.env.example` sin secretos.
  - Completar `docs/bitacora-agente.md` con 5 a 8 momentos clave, incluido uno en que el agente se desvió de la spec.
- **Dependencias:** T-29.
- **DoD:** los documentos están completos y no hay credenciales en el repositorio.

#### T-31 · Despliegue y pull request

- **Tipo:** integración.
- **Historia:** proceso. Lo exige el enunciado en la fase 9.
- **Criterios:** verificación en producción de una muestra de criterios: CA-01.8, CA-06.1 y CA-07.5.
- **Descripción:** desplegar el backend y el frontend en Render y abrir el pull request de `feature/e2-metas-rachas` a `main`, con la lista de tickets y el enlace a la auditoría.
- **Dependencias:** T-30.
- **DoD:** las URLs públicas funcionan con E2 y el pull request queda integrado.

---

## 4. Dependencias (orden de ejecución)

| Ola | Tickets | Requiere |
|---|---|---|
| 0 | T-01 | — |
| 1 | T-02 | T-01 |
| 2 | T-03, T-04 | T-02 |
| 3 | T-05, T-07, T-09, T-11, T-13, T-22 | T-04 (T-13 también T-02); T-22 solo necesita T-03 |
| 4 | T-06, T-08, T-12, T-14, T-15, T-20 | Su test, o T-05 y T-13 |
| 5 | T-10, T-16, T-17 | T-09 y T-08 / T-15 |
| 6 | T-18, T-19 | T-08, T-10, T-12 y T-15 / T-01 y T-17 |
| 7 | T-21, T-23 | T-14 a T-20 / T-03 y T-18 |
| 8 | T-24 | T-22, T-23 |
| 9 | T-25, T-27 | T-24 |
| 10 | T-26 | T-25 |
| 11 | T-28 | T-24 a T-27 |
| 12 | T-29 → T-30 → T-31 | T-06, T-21, T-28 |

**Ruta crítica:** T-01 → T-02 → T-04 → T-07 → T-08 → T-10 → T-18 → T-23 → T-24 → T-25 → T-26 → T-28 → T-29 → T-30 → T-31.

---

## 5. Trazabilidad

### 5.1 Historia → criterios → tickets

| Historia | Criterios | Tickets |
|---|---|---|
| HU-01 Crear meta | CA-01.1 – CA-01.11 | T-02, T-03, T-13, T-14, T-23, T-25 |
| HU-02 Hitos | CA-02.1 – CA-02.8 | T-13, T-14, T-25 |
| HU-03 Consultar metas | CA-03.1 – CA-03.5 | T-15, T-23, T-26 |
| HU-04 Editar meta | CA-04.1 – CA-04.5 | T-16, T-18, T-24, T-25 |
| HU-05 Desactivar meta | CA-05.1 – CA-05.5 | T-17, T-26 |
| HU-06 Horas y días | CA-06.1 – CA-06.12 | T-07, T-08, T-18, T-24, T-27 |
| HU-07 Rachas | CA-07.1 – CA-07.11 | T-09, T-10, T-18, T-24, T-27 |
| HU-08 Hitos alcanzados | CA-08.1 – CA-08.5 | T-11, T-12, T-18, T-24 |
| HU-09 Sin meta o sin partidas | CA-09.1 – CA-09.4 | T-07, T-09, T-11, T-18, T-24 |
| HU-10 Eliminar juego | CA-10.1 – CA-10.3 | T-20 |
| HU-11 Cerrar juego | CA-11.1 – CA-11.5 | T-01, T-19 |
| HU-12 Mensajes claros | CA-12.1 – CA-12.5 | T-14, T-15, T-17, T-18 |
| DT-1 Errores en un módulo común | CA-DT1.1, CA-DT1.2 | T-05 |
| DT-2 413/415 y README | CA-DT2.1 – CA-DT2.3 | T-06 |
| Proceso del enunciado | — | T-01 – T-04, T-21, T-22, T-23, T-28 – T-31 |

### 5.2 PRD → historias (cobertura)

| Requisito PRD | Cubierto por |
|---|---|
| A-1 | HU-01, HU-02 |
| A-2 | HU-03 |
| A-3 | HU-04 |
| A-4 | HU-05 |
| A-5 | HU-06 |
| A-6 | HU-07 |
| A-7 | HU-08 |
| A-8 | HU-06 (CA-06.10, CA-06.11) |
| A-9 | HU-10, HU-11 |
| RO-01 | CA-01.1, CA-01.8, CA-01.10 |
| RO-02 | CA-01.3 – CA-01.7, CA-04.4 |
| RO-03 | CA-02.1 – CA-02.6, CA-04.3 |
| RO-04 | CA-01.8 |
| RO-05 | CA-12.1 |
| RO-06 | CA-03.1 – CA-03.5, CA-05.1 – CA-05.3 |
| RO-07 | CA-06.1, CA-06.5, CA-06.6 |
| RO-08 | CA-06.1, CA-06.2, CA-06.9 |
| RO-09 | CA-06.1, CA-06.2 |
| RO-10 | CA-06.1, CA-06.3, CA-06.9 |
| RO-11 | CA-07.4, CA-07.9 |
| RO-12 | CA-07.3, CA-07.5, CA-07.7, CA-07.8, CA-07.11 |
| RO-13 | CA-08.1 – CA-08.4 |
| RO-14 | CA-09.1, CA-09.3, CA-03.3, CA-05.2 |
| RO-15 | CA-09.2, CA-09.3 |
| RO-16 | CA-12.1, CA-12.2 (y, por analogía, CA-12.3 y CA-12.4) |
| RO-17 | CA-10.1, CA-10.3 |
| RO-18 | CA-03.1, CA-06.1, CA-06.12, CA-08.1 |
| RO-19 | CA-06.10, CA-06.11 (*editar partidas: no aplica, P-04*) |
| RO-20 | CA-10.2, CA-11.5 |
| D-01 | CA-07.1, CA-07.2, CA-07.3 |
| D-02 | CA-06.3, CA-07.6 |
| D-03 | CA-06.4 |
| D-04 | CA-04.1, CA-04.2 |
| D-05 | CA-06.7 |
| D-06 | CA-08.3 |
| D-07 | CA-01.2, CA-01.9, CA-11.1 – CA-11.3 |
| D-08 | CA-10.1, CA-10.2 |
| D-09 | *No aplica:* define la métrica, que se mide fuera del producto (S-04, P-05) |
| D-10 | CA-06.8, CA-07.10 |
| D-11 | CA-01.10, CA-04.5, CA-05.5 |
| D-12 | CA-11.4 |
| S-03 | CA-02.7, CA-02.8, CA-08.5 |

### 5.3 Interpretaciones registradas (no modifican el PRD)

| ID | Hueco | Interpretación aplicada | Base |
|---|---|---|---|
| I-2 | El PRD no define qué pasa con una meta inexistente o con un identificador de meta inválido | Se trata igual que el videojuego: «no encontrada» o «identificador no válido» | RO-16 |
| I-3 | El PRD no define qué pasa al desactivar una meta ya inactiva | Se rechaza con el mensaje «la meta ya está desactivada» | D-11 |

Si se aprueban, conviene incorporarlas al PRD como reglas en una próxima versión.

---

## 6. Deuda técnica

### Pagada en E2

| ID | Problema del diagnóstico | Ticket | Criterios |
|---|---|---|---|
| DT-1 | B4: los errores de dominio están acoplados a cada servicio | T-05 | CA-DT1.1, CA-DT1.2 |
| DT-2 | B6: los errores 413/415 terminan en 500 y el README no coincide | T-06 | CA-DT2.1 – CA-DT2.3 |

B1 (no hay tests) se resuelve con T-04 como parte de la preparación. B2 y B3 quedan resueltos por la ficha (T-01).

### Diferida

| Problema | Motivo para diferirlo |
|---|---|
| B5: cliente HTTP duplicado en el frontend | No bloquea E2. Pagarlo con el ciclo completo exigiría montar tests en el frontend, que E2 no requiere |
| Sin lista blanca de campos al crear o editar videojuegos | El modo estricto actual ya descarta los campos desconocidos. Cambiarlo toca E1 (RO-20) |
| `validarId` duplicado y estados repetidos en varias capas | Es una duplicación sin impacto funcional. Se puede hacer al tocar esos archivos |
| El error del filtro `estado` no incluye el identificador de solicitud | Afecta a una sola respuesta de E1 y no es parte de E2 |
| Log de base de datos antes de conectar y `FRONTEND_URL` leído antes de cargar la configuración | No afecta a producción y es difícil de probar con un test automatizado |
| Falta un índice para consultar partidas por juego y fecha | Con el volumen actual no hay problema de rendimiento. Se reevalúa si crecen los datos |
| El resumen carga todas las partidas; el historial no tiene paginación | Mismo motivo: no hay problema de volumen hoy |
| No se pueden editar partidas | No está en el alcance de E2 (P-04) |
| Se aceptan partidas con fecha futura, que afectan al avance actual y a los hitos | Corregirlo cambia E1. D-10 descartó esa alternativa y queda pendiente en P-03 |
| El avance puede bajar sin aviso | Es un comportamiento de E1 que D-06 asume deliberadamente |
| Deuda visual: colores sueltos, clases duplicadas, `lang="en"` y el título «frontend» | No bloquea E2. La UI nueva usa tokens; lo heredado se limpia en otra iteración |
| Avisos de `oxlint` en el formulario de partidas | Son avisos, no errores. Se corrigen al tocar ese archivo |
| No hay integración continua | Está fuera del alcance del enunciado. Los tests se ejecutan en local antes de cerrar cada ticket |

---

## 7. Verificación INVEST

| Historia | Independiente | Negociable | Valiosa | Estimable | Pequeña | Testeable | Nota |
|---|---|---|---|---|---|---|---|
| HU-01 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Base de las demás historias de meta |
| HU-02 | ✓* | ✓ | ✓ | ✓ | ✓ | ✓ | *Necesita una meta (HU-01), pero se entrega por separado porque S-03 permite metas sin hitos |
| HU-03 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Una lista simple, sin gráficos |
| HU-04 | ✓* | ✓ | ✓ | ✓ | ✓ | ✓ | *Necesita una meta existente |
| HU-05 | ✓* | ✓ | ✓ | ✓ | ✓ | ✓ | *Necesita una meta existente |
| HU-06 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Funciona aunque no haya meta (ver HU-09) |
| HU-07 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Solo depende de las partidas de E1 |
| HU-08 | ✓* | ✓ | ✓ | ✓ | ✓ | ✓ | *Necesita una meta con hitos |
| HU-09 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Separa con claridad «sin meta» de «sin partidas» |
| HU-10 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Extiende una regla de E1 |
| HU-11 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Requiere T-01 por RO-20 |
| HU-12 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Transversal; cada criterio se prueba solo |

Las dependencias marcadas con * son de **datos**, no de entrega: cada historia se puede demostrar creando su precondición en el propio test o en la propia demo.
