# Spec backend · Metas y progreso semanal

- **Épica:** E2 · Metas y rachas
- **Historias:** HU-01 a HU-12 (parte del sistema), DT-1 y DT-2
- **Tickets:** T-04 a T-21
- **Estado:** borrador, pendiente de aprobación
- **Fuentes:**
  - `docs/prd/diario-gamer.md` (RO, D, S, P)
  - `docs/backlog/E2-metas-y-rachas.md` (HU, CA, T)
  - `docs/diagnostico.md` §5 (decisiones tomadas)
  - El enunciado del Proyecto 4 (modelo de datos y reglas fijas)
- **Spec relacionada:** `docs/specs/E2-frontend-metas-rachas.md`

**Origen de cada regla:**

| Etiqueta | Origen | ¿Se puede cambiar sin aprobación? |
|---|---|---|
| **[RO]** | Obligatoria: enunciado o ficha, vía PRD | No |
| **[D]** | Decisión de producto aprobada en el PRD | No |
| **[TD]** | Decisión técnica de esta spec | Se puede ajustar, actualizando la spec antes del código |

---

## 1. Objetivo

Agregar al backend la entidad **Meta** (una por videojuego activa a la vez, con hitos embebidos) y el endpoint **`GET /api/videojuegos/:id/progreso-semanal`**, que calcula a partir de las partidas existentes:
- Las horas y los días de la semana actual.
- La racha actual y la mejor racha.
- El estado de los hitos.

Los cálculos viven en **funciones puras** con tests automatizados. El servicio solo consulta datos y llama a esas funciones.

## 2. Alcance

**Incluye:**
- El modelo Meta.
- El CRUD de Meta: crear, consultar, listar por videojuego, editar y desactivar.
- La validación del videojuego referenciado.
- La prevención de una segunda meta activa.
- El progreso semanal: horas, porcentaje, días, racha actual, mejor racha e hitos.
- La integridad con E1: la cascada al eliminar un videojuego (D-08) y la desactivación al cerrarlo (D-07).
- El manejo centralizado de errores (400/404/409/413/415/500).
- La infraestructura de tests.

**No incluye:**
- La interfaz (está en la spec de frontend).
- Editar partidas (P-04).
- Historial semanal (P-05).
- Cambios en el resumen de E1 (RO-20).
- Cambios en el modelo Partida.
- Autenticación.

---

## 3. Reglas

### 3.1 Meta: datos y unicidad

- **RB-01 [RO] (RO-01, RO-04).** El sistema **DEBE** rechazar con **409** y el mensaje `"Este videojuego ya tiene una meta activa"` la creación de una meta para un videojuego que ya tiene una meta activa. La meta existente **NO DEBE** cambiar.
- **RB-02 [TD].** La unicidad de la meta activa **DEBE** garantizarse en dos niveles:
  - Una comprobación previa en el servicio, que responde 409.
  - Un **índice único parcial** `{ videojuego: 1 }` con `partialFilterExpression: { activa: true }`.

  Si el índice rechaza una escritura (error de clave duplicada `11000`), la respuesta **DEBE** ser 409 con el mismo mensaje de RB-01.
- **RB-03 [RO] (RO-02).** `horasSemanales` **DEBE** ser un número finito mayor que 0 y menor o igual a 100; se admiten decimales. `diasPorSemana` **DEBE** ser un entero entre 1 y 7. Cualquier otro valor **DEBE** responder **400**.
- **RB-04 [RO] (RO-03, S-03).**
  - `hitos` **DEBE** ser un arreglo de 0 a 5 elementos.
  - Cada hito **DEBE** tener una `descripcion` de tipo texto que no quede vacía después de recortar espacios, y un `porcentajeObjetivo` numérico entre 1 y 100.
  - Se **DEBEN** aceptar porcentajes repetidos.
  - Cualquier violación **DEBE** responder **400**.
- **RB-05 [RO] (RO-05, RO-16).** Crear una meta para un videojuego inexistente **DEBE** responder **404** `"Videojuego no encontrado"` y **NO DEBE** crear nada.
- **RB-06 [D] (D-07).** Crear una meta para un videojuego en estado `completado` o `abandonado` **DEBE** responder **409** con el mensaje `"Solo los videojuegos en estado jugando o pausado pueden tener una meta activa"`.
- **RB-07 [TD] (TD-04).** Los cuerpos de creación y edición **DEBEN** aceptar solo `horasSemanales`, `diasPorSemana` y `hitos`, y cada hito solo `descripcion` y `porcentajeObjetivo`. Cualquier otro campo (incluidos `videojuego`, `activa` y `_id`) **DEBE** responder **400** `"Campos no permitidos: <lista>"`.
- **RB-08 [TD] (TD-05).** La validación del cuerpo **DEBE** hacerla una función pura, `validarDatosMeta`, que no use Mongoose ni Express. El esquema de Mongoose **DEBE** repetir las mismas restricciones como segunda barrera.

### 3.2 Meta: ciclo de vida

- **RB-09 [RO] (RO-06).** El sistema **DEBE** permitir consultar una meta por su id y listar todas las metas de un videojuego, tanto activas como desactivadas. La lista **DEBE** incluir solo metas de ese videojuego y **DEBE** ordenarse con la activa primero y después por `createdAt` descendente.
- **RB-10 [RO] (RO-06, D-04).** Editar **DEBE** reemplazar `horasSemanales`, `diasPorSemana` y la lista completa de `hitos` de la meta activa, aplicando RB-03, RB-04 y RB-07. Si la edición es inválida, la meta **NO DEBE** cambiar.
- **RB-11 [D] (D-11).** Editar una meta desactivada **DEBE** responder **409** `"Las metas desactivadas no se pueden editar"`.
- **RB-12 [RO] (RO-06).** Desactivar **DEBE** poner `activa: false` y conservar la meta en la base, como parte del historial.
- **RB-13 [TD] (I-3, D-11).** Desactivar una meta ya desactivada **DEBE** responder **409** `"La meta ya está desactivada"`.
- **RB-14 [D] (D-11).** **NO DEBE** existir ninguna operación que reactive una meta. Enviar `activa` en la edición **DEBE** responder 400 (RB-07).
- **RB-15 [TD] (I-2).** Una meta inexistente **DEBE** responder **404** `"Meta no encontrada"`. Un id de meta con formato inválido **DEBE** responder **400** `"El ID proporcionado no es válido"`.

### 3.3 Integración con E1 (autorizada en `docs/diagnostico.md` §5.2)

- **RB-16 [D] (D-07, D-12).**
  - Después de una edición exitosa de un videojuego cuyo `estado` resultante sea `completado` o `abandonado`, todas sus metas activas **DEBEN** pasar a `activa: false`.
  - Cambiar a `pausado` o `jugando`, o cambiar otros campos, **NO DEBE** alterar las metas.
  - Volver a `jugando` **NO DEBE** reactivar ninguna meta.
  - La respuesta de `PUT /api/videojuegos/:id` **NO DEBE** cambiar.
- **RB-17 [D] (D-08, RO-17).**
  - Si un videojuego tiene partidas, `DELETE /api/videojuegos/:id` **DEBE** seguir respondiendo 409, como en E1, sin borrar nada.
  - Si se puede eliminar, **DEBE** borrar todas sus metas (activas e inactivas) antes de borrar el juego.
  - Las metas de otros juegos **NO DEBEN** verse afectadas.
- **RB-18 [RO] (RO-20).** El modelo Partida, `GET /api/videojuegos/:id/resumen` y sus respuestas **NO DEBEN** cambiar.

### 3.4 Progreso semanal: cálculo

- **RB-19 [RO] (RO-07).** La semana actual **DEBE** ir del lunes al domingo que contienen la fecha de *hoy*, calculada en `America/Guayaquil`.
- **RB-20 [TD] (TD-06, D-03).** El día de una partida **DEBE** ser la fecha `YYYY-MM-DD` con que se registró. Como E1 la guarda como medianoche UTC, se obtiene con `fecha.toISOString().slice(0, 10)`. **NO DEBE** convertirse a hora de Ecuador, porque eso la movería al día anterior.
- **RB-21 [D] (D-10).** Las partidas cuya fecha es posterior a *hoy* **NO DEBEN** contar en las horas, los días ni las rachas.
- **RB-22 [RO] (RO-08, TD-07).** `horasSemana` **DEBE** ser `Math.round(minutosSemana / 6) / 10`. Es el total de minutos de la semana (hasta *hoy*) pasado a horas y redondeado a un decimal, con la mitad hacia arriba.
- **RB-23 [RO]+[D] (RO-09, D-05, D-04).**
  - Con meta activa, `porcentajeHoras` **DEBE** ser `Math.round(horasSemana / horasSemanales × 100)`, calculado sobre las horas ya redondeadas. **NO DEBE** tener tope superior.
  - **DEBE** usar la meta activa vigente en el momento de la consulta.
  - Sin meta activa **DEBE** ser `null`.
- **RB-24 [RO]+[D] (RO-10, D-02).** `diasJugadosSemana` **DEBE** ser la cantidad de fechas **distintas** de la semana (hasta *hoy*) con al menos una partida.
- **RB-25 [D] (D-01, RO-11, RO-12).**
  - `rachaActual` **DEBE** contar los días consecutivos con partida que terminan en *hoy*; si hoy no hay partida, los que terminan en *ayer*.
  - Si no hay partida ni hoy ni ayer, **DEBE** ser 0.
  - Cada fecha cuenta una sola vez y se usa todo el historial del juego, sin límite de semana, mes ni año.
- **RB-26 [RO] (RO-12).** `mejorRacha` **DEBE** ser la serie de días consecutivos más larga de todo el historial (hasta *hoy*). Siempre **DEBE** cumplirse `mejorRacha ≥ rachaActual`.
- **RB-27 [RO]+[D] (RO-13, D-06, TD-08).**
  - Un hito **DEBE** estar `alcanzado: true` si y solo si `avanceActual ≥ porcentajeObjetivo`.
  - `avanceActual` **DEBE** ser el `porcentajeAvance` que devuelve `calcularResumen` de E1, el de la partida más reciente por `fecha` y `_id`.
  - El estado **NO DEBE** guardarse.
- **RB-28 [RO] (RO-14).** Sin meta activa, la respuesta **DEBE** tener `meta: null`, `porcentajeHoras: null` e `hitos: []`, y **DEBE** calcular igualmente horas, días y rachas.
- **RB-29 [RO] (RO-15).** Sin partidas, las horas, los días y las rachas **DEBEN** ser 0, y ningún hito **DEBE** estar alcanzado.
- **RB-30 [RO] (RO-16).** Si el videojuego no existe, el progreso **DEBE** responder **404** `"Videojuego no encontrado"`. Si el id es inválido, **DEBE** responder **400** `"El ID proporcionado no es válido"`.

### 3.5 Arquitectura y errores

- **RB-31 [RO].** Las funciones de `backend/src/dominio/progreso.ts` **NO DEBEN** importar `mongoose`, `express`, modelos ni servicios, ni leer el reloj. *Hoy* **DEBE** recibirse como parámetro.
- **RB-32 [RO].** El servicio de progreso **DEBE** limitarse a consultar el videojuego, las partidas, la meta activa y el resumen, y a llamar a las funciones de dominio. **NO DEBE** contener fórmulas de cálculo.
- **RB-33 [TD] (TD-11, DT-1).**
  - Las clases de error **DEBEN** estar en `backend/src/errors/` y heredar de una de tres bases: `SolicitudInvalida` (400), `RecursoNoEncontrado` (404) o `Conflicto` (409).
  - `errorHandler` **DEBE** decidir el código por la clase base.
  - Los mensajes de E1 **NO DEBEN** cambiar.
  - Ningún servicio **DEBE** importar errores de otro servicio.
- **RB-34 [TD] (DT-2).**
  - Los errores del parser de JSON **DEBEN** responder según su `type`:
    - `entity.too.large`: **413** `"El cuerpo de la solicitud es demasiado grande"`.
    - `encoding.unsupported` o `charset.unsupported`: **415** `"Codificación o juego de caracteres no compatible"`.
    - `entity.parse.failed`: **400**, como hoy.
  - La tabla de errores del README **DEBE** coincidir con este comportamiento.
- **RB-35 [RO].** Cualquier otro error **DEBE** responder **500** `"Error interno del servidor"` con `requestId`, y **NO DEBE** incluir el stack ni detalles internos.
- **RB-36 [TD].** Todas las respuestas de error **DEBEN** tener la forma `{ "mensaje": string, "requestId": string }`.
- **RB-37 [TD] (C-6).** El código nuevo **DEBE** usar `returnDocument: 'after'` en lugar de la opción obsoleta `new: true`.

---

## 4. Contrato de datos: modelo Meta

**Archivo:** `backend/src/models/meta.ts` · **Colección:** `metas`

| Campo | Tipo | Obligatorio | Por defecto | Validación |
|---|---|---|---|---|
| `videojuego` | `ObjectId`, ref `Videojuego` | Sí | — | Debe existir (se comprueba en el servicio, RB-05) |
| `horasSemanales` | `Number` | Sí | — | `> 0` y `≤ 100`, finito (RB-03) |
| `diasPorSemana` | `Number` | Sí | — | Entero, `1 ≤ x ≤ 7` (RB-03) |
| `activa` | `Boolean` | No | `true` | Solo se cambia con la operación de desactivar o por RB-16 |
| `hitos` | `[HitoSchema]` | No | `[]` | Máximo 5 elementos (RB-04) |
| `hitos[].descripcion` | `String` (`trim`) | Sí | — | No vacía |
| `hitos[].porcentajeObjetivo` | `Number` | Sí | — | `1 ≤ x ≤ 100` |
| `createdAt`, `updatedAt` | `Date` | — | Automáticos | `timestamps: true` |

**Índices:**
- `{ videojuego: 1 }` único parcial con `{ activa: true }` (RB-02).
- `{ videojuego: 1, createdAt: -1 }` para listar.

**Representación JSON:**
```json
{
  "_id": "665f…a1",
  "videojuego": "665f…10",
  "horasSemanales": 5,
  "diasPorSemana": 4,
  "activa": true,
  "hitos": [
    { "_id": "665f…b1", "descripcion": "Llegar al 25 %", "porcentajeObjetivo": 25 },
    { "_id": "665f…b2", "descripcion": "Llegar al 50 %", "porcentajeObjetivo": 50 }
  ],
  "createdAt": "2026-11-02T15:00:00.000Z",
  "updatedAt": "2026-11-02T15:00:00.000Z"
}
```

**Tipos** (`backend/src/types/meta.types.ts`):
```ts
export interface HitoDTO { descripcion: string; porcentajeObjetivo: number }
export interface MetaDTO { horasSemanales: number; diasPorSemana: number; hitos: HitoDTO[] }
```

---

## 5. Contratos HTTP

Base: `/api`. Todos los cuerpos son JSON. Los errores siguen RB-36.

| # | Método y ruta | Uso | Éxito | Errores |
|---|---|---|---|---|
| H-1 | `POST /videojuegos/:id/metas` | Crear meta **[TD-01]** | **201** + meta | 400 (id, cuerpo, campos), 404 (videojuego), 409 (meta activa, juego cerrado) |
| H-2 | `GET /videojuegos/:id/metas` | Listar las metas del juego **[TD-01]** | **200** + `Meta[]` (puede ser `[]`) | 400 (id), 404 (videojuego) |
| H-3 | `GET /metas/:metaId` | Consultar una meta **[TD-01]** | **200** + meta | 400 (id), 404 (meta) |
| H-4 | `PUT /metas/:metaId` | Editar la meta activa **[TD-01]** | **200** + meta actualizada | 400 (id, cuerpo, campos), 404 (meta), 409 (meta desactivada) |
| H-5 | `PATCH /metas/:metaId/desactivar` | Desactivar, sin cuerpo **[TD-01]** | **200** + meta con `activa: false` | 400 (id), 404 (meta), 409 (ya desactivada) |
| H-6 | `GET /videojuegos/:id/progreso-semanal` | Progreso semanal **[RO]** (obligatoria) | **200** + `ProgresoSemanal` | 400 (id), 404 (videojuego) |

### H-1 · Crear meta

Petición (`hitos` es opcional al crear; por defecto `[]`):
```json
{
  "horasSemanales": 5,
  "diasPorSemana": 4,
  "hitos": [{ "descripcion": "Llegar al 50 %", "porcentajeObjetivo": 50 }]
}
```

Orden de las comprobaciones (determina qué error gana cuando hay varios):
1. Formato del `:id`: 400.
2. `validarDatosMeta(cuerpo)`: 400.
3. El videojuego existe: 404.
4. Estado `jugando` o `pausado`: 409 (RB-06).
5. No tiene meta activa: 409 (RB-01).
6. Se crea la meta. Si salta el error `11000`, se responde 409.

### H-4 · Editar

Mismos campos que H-1, pero **los tres son obligatorios**. `hitos: []` vacía la lista de hitos. Así se evita que olvidar el campo borre los hitos sin querer.

Orden de las comprobaciones:
1. Formato del `:metaId`: 400.
2. Validación del cuerpo: 400.
3. La meta existe: 404.
4. La meta está activa: 409 (RB-11).
5. Se actualiza.

### H-6 · Progreso semanal

Respuesta, idéntica en forma al ejemplo del enunciado:
```json
{
  "semana": { "inicio": "2026-11-02", "fin": "2026-11-08" },
  "meta": { "horasSemanales": 5, "diasPorSemana": 4 },
  "horasSemana": 3.5,
  "porcentajeHoras": 70,
  "diasJugadosSemana": 3,
  "rachaActual": 4,
  "mejorRacha": 9,
  "hitos": [
    { "descripcion": "Llegar al 25 %", "porcentajeObjetivo": 25, "alcanzado": true },
    { "descripcion": "Llegar al 50 %", "porcentajeObjetivo": 50, "alcanzado": true },
    { "descripcion": "Terminar el juego", "porcentajeObjetivo": 100, "alcanzado": false }
  ]
}
```

Sin meta activa: `"meta": null`, `"porcentajeHoras": null` y `"hitos": []` (RB-28).

### Catálogo de mensajes de error

| Código | Mensaje | Origen |
|---|---|---|
| 400 | `El ID proporcionado no es válido` | E1, se reutiliza |
| 400 | `Campos no permitidos: <campos>` | RB-07 |
| 400 | `Falta el campo horasSemanales` / `Falta el campo diasPorSemana` | RB-03 (CA-01.7) |
| 400 | `Las horas semanales deben ser un número mayor que 0 y como máximo 100` | RB-03 |
| 400 | `Los días por semana deben ser un número entero entre 1 y 7` | RB-03 |
| 400 | `Una meta puede tener como máximo 5 hitos` | RB-04 |
| 400 | `Cada hito necesita una descripción` | RB-04 |
| 400 | `El porcentaje objetivo de cada hito debe estar entre 1 y 100` | RB-04 |
| 400 | `Los hitos deben ser una lista` | RB-04 |
| 404 | `Videojuego no encontrado` | E1, se reutiliza |
| 404 | `Meta no encontrada` | RB-15 |
| 409 | `Este videojuego ya tiene una meta activa` | RB-01 |
| 409 | `Solo los videojuegos en estado jugando o pausado pueden tener una meta activa` | RB-06 |
| 409 | `Las metas desactivadas no se pueden editar` | RB-11 |
| 409 | `La meta ya está desactivada` | RB-13 |
| 413 | `El cuerpo de la solicitud es demasiado grande` | RB-34 |
| 415 | `Codificación o juego de caracteres no compatible` | RB-34 |
| 500 | `Error interno del servidor` | RB-35 |

---

## 6. Funciones de dominio (puras)

**Archivo:** `backend/src/dominio/progreso.ts` (RB-31).

Las fechas se representan como `Fecha = string` en formato `YYYY-MM-DD`. Las operaciones con días usan `Date.UTC`, así que no dependen de la zona horaria del proceso.

| Función | Entrada | Salida | Reglas y casos límite |
|---|---|---|---|
| `fechaHoyGuayaquil(ahora: Date): Fecha` | Un instante | La fecha en Ecuador | Usa `Intl.DateTimeFormat('en-CA', { timeZone: 'America/Guayaquil' })`. Es pura porque recibe el instante. `2026-11-09T03:00Z` da `2026-11-08` (CA-06.6) |
| `fechaDePartida(fecha: Date): Fecha` | La fecha guardada de E1 | La fecha registrada | `toISOString().slice(0, 10)` (RB-20) |
| `semanaActual(hoy: Fecha): { inicio: Fecha; fin: Fecha }` | Hoy | Lunes y domingo | Si hoy es lunes, el inicio es hoy. Si es domingo, el fin es hoy. Funciona en cambios de mes y de año |
| `horasSemana(partidas: PartidaDia[], semana, hoy): number` | `PartidaDia = { fecha: Fecha; duracionMinutos: number }` | Horas con un decimal | Suma las partidas con `inicio ≤ fecha ≤ min(fin, hoy)`. Redondea según RB-22. Sin partidas da `0` |
| `porcentajeHoras(horas: number, horasSemanales: number \| null): number \| null` | Horas redondeadas y meta | Entero o `null` | Sin tope (RB-23). Con meta `null` devuelve `null` |
| `diasJugadosSemana(partidas, semana, hoy): number` | Igual que `horasSemana` | Entero de 0 a 7 | Cuenta fechas distintas (RB-24) |
| `rachaActual(fechas: Fecha[], hoy: Fecha): number` | Fechas del historial (con repetidas) | Entero ≥ 0 | Sigue RB-25. Descarta las fechas posteriores a hoy |
| `mejorRacha(fechas: Fecha[], hoy: Fecha): number` | Igual | Entero ≥ 0 | Sigue RB-26. Lista vacía da `0` |
| `evaluarHitos(hitos: HitoDTO[], avanceActual: number): HitoEvaluado[]` | Hitos y avance | `HitoDTO & { alcanzado: boolean }` | Usa `≥`, así que un avance igual al objetivo lo alcanza. Conserva el orden original. Lista vacía da `[]` |
| `calcularProgresoSemanal(entrada): ProgresoSemanal` | `{ partidas: PartidaDia[]; meta: MetaDTO \| null; avanceActual: number; hoy: Fecha }` | La forma de H-6 | Compone las anteriores. Con `meta: null` aplica RB-28 |

**Validador puro** (`backend/src/services/metas.service.ts`, exportado):

`validarDatosMeta(datos: unknown, modo: 'crear' | 'editar'): MetaDTO`
- Lanza `DatosMetaInvalidos` (de tipo `SolicitudInvalida`) con los mensajes del §5.
- En modo `crear`, `hitos` es opcional; en modo `editar`, es obligatorio.

**Servicio de progreso** (`backend/src/services/progreso.service.ts`):

`obtenerProgresoSemanal(videojuegoId: string, ahora = new Date())` sigue estos pasos:
1. Valida el id.
2. Comprueba que el videojuego existe.
3. Consulta las partidas (`fecha` y `duracionMinutos`).
4. Consulta la meta activa.
5. Obtiene `calcularResumen(id).porcentajeAvance`.
6. Calcula `hoy = fechaHoyGuayaquil(ahora)`.
7. Llama a `calcularProgresoSemanal`.

El parámetro `ahora` permite fijar el reloj en los tests de API.

---

## 7. Casos borde y decisiones aplicadas

| Decisión | Regla | Ejemplo verificable (hoy = jueves 2026-11-05 si no se indica otra fecha) |
|---|---|---|
| D-01 · Racha y día de hoy | RB-25 | Partida solo el 04-11: racha 1. Con otra el 05-11: racha 2. Última partida el 03-11: racha 0 |
| D-02 · Varias partidas el mismo día | RB-24, RB-25 | Dos partidas el 03-11 (30 y 60 min): 1 día y 1,5 h |
| D-03 · Partida que cruza la medianoche | RB-20 | Partida registrada el 08-11: cuenta el 08-11 completa |
| D-04 · Cambio de meta a mitad de semana | RB-23 | Meta editada de 5 a 8 h con 4 h jugadas: 50 % |
| D-05 · Meta superada | RB-23 | 7 h con una meta de 5 h: `porcentajeHoras: 140` |
| D-06 · Hito y menos avance | RB-27 | Avance 60 y luego 40: el hito de 50 pasa a `alcanzado: false` |
| D-07 · Juego cerrado | RB-06, RB-16 | Crear en un juego `completado`: 409. Pasar a `abandonado`: la meta queda `activa: false` |
| D-08 · Eliminar el juego | RB-17 | Juego sin partidas y con 2 metas: las 2 se borran. Juego con partidas: 409 y no se borra nada |
| D-10 · Fecha futura | RB-21 | Partida el 07-11 consultada el 05-11: no suma horas, días ni racha |
| D-11 · Meta desactivada | RB-11, RB-13, RB-14 | Editar o desactivar una meta inactiva: 409. Enviar `activa`: 400 |
| D-12 · Juego que vuelve a «jugando» | RB-16 | Sigue sin meta activa, y crear una nueva da 201 |
| Límite de semana | RB-19 | Partida el domingo 01-11: no cuenta. Partida el lunes 02-11: sí cuenta |
| Zona horaria | RB-19 | Instante `2026-11-09T03:00Z` (domingo a las 22:00 en Ecuador): semana del 02-11 al 08-11 |
| Redondeo | RB-22, RB-23 | 100 min dan 1,7 h. Con una meta de 3 h, 57 % |
| P-03 (aceptado) | RB-27 | Una partida futura **sí** cambia `avanceActual`, porque es el resumen de E1. Se documenta y no se corrige |

---

## 8. Pruebas

**Herramienta [TD-12]:** Vitest + Supertest + mongodb-memory-server, como `devDependencies` del backend (AGENTS.md regla 8).
- **Motivo:** probar el índice parcial, la cascada y D-07 con una base de datos real en memoria, sin Atlas y sin `.env`.
- **Comando:** `npm test`, que equivale a `vitest run`.
- **Ubicación:** `backend/tests/`, fuera de `src`, así que no entran en el build.
- **Alcance:** los tests de API importan `app.ts`, que no carga `.env`.

| Archivo | Tipo | ¿Sin BD? | Cubre |
|---|---|---|---|
| `tests/dominio/semana.test.ts` | Unitario | Sí | `fechaHoyGuayaquil`, `semanaActual`, `horasSemana`, `porcentajeHoras`, `diasJugadosSemana` |
| `tests/dominio/rachas.test.ts` | Unitario | Sí | `rachaActual`, `mejorRacha` |
| `tests/dominio/hitos.test.ts` | Unitario | Sí | `evaluarHitos` |
| `tests/dominio/progreso.test.ts` | Unitario | Sí | `calcularProgresoSemanal` (sin meta, sin partidas, composición) |
| `tests/dominio/validarDatosMeta.test.ts` | Unitario | Sí | Valores límite de horas, días e hitos, y campos no permitidos |
| `tests/api/metas.test.ts` | Integración | No | H-1 a H-5 y el índice parcial |
| `tests/api/progreso.test.ts` | Integración | No | H-6 con reloj fijo (`ahora`) |
| `tests/api/videojuegos-metas.test.ts` | Integración | No | RB-16, RB-17 y RB-18 |
| `tests/api/errores.test.ts` | Integración | No | RB-33 a RB-36 (DT-1, DT-2, CA-12.5) |

**Regla de cobertura:** cada criterio con «Sí» en la columna «¿Sin BD?» del §9 **DEBE** tener al menos un test unitario, cuyo nombre empieza por su ID. Por ejemplo, `it("CA-07.1 racha 1 si jugó ayer y no hoy")`.

---

## 9. Criterio → verificación

**Leyenda:**
- **U:** test unitario de dominio.
- **V:** test unitario del validador.
- **I:** test de integración (API + MongoDB en memoria).
- **M:** prueba manual con curl en T-21.

| Criterio | Reglas | Verificación | Test / evidencia | ¿Sin BD? |
|---|---|---|---|---|
| CA-01.1 | RB-01, RB-09 | I: H-1 responde 201 y H-2 devuelve la meta activa con 5 y 4 | `tests/api/metas.test.ts` | No |
| CA-01.2 | RB-06 | I: crear en un juego `pausado` da 201 | `tests/api/metas.test.ts` | No |
| CA-01.3 | RB-03 | V: 0,1 y 100 aceptados | `tests/dominio/validarDatosMeta.test.ts` | Sí |
| CA-01.4 | RB-03 | V: 0, −1 y 100,1 rechazados con el mensaje de horas | `tests/dominio/validarDatosMeta.test.ts` | Sí |
| CA-01.5 | RB-03 | V: 1 y 7 aceptados | `tests/dominio/validarDatosMeta.test.ts` | Sí |
| CA-01.6 | RB-03 | V: 0, 8 y 3,5 rechazados con el mensaje de días | `tests/dominio/validarDatosMeta.test.ts` | Sí |
| CA-01.7 | RB-03 | V: falta cada campo y se recibe el mensaje «Falta el campo …» | `tests/dominio/validarDatosMeta.test.ts` | Sí |
| CA-01.8 | RB-01, RB-02 | I: segunda creación da 409 con el mensaje exacto, y la primera meta queda igual. I: inserción directa duplicada da error 11000, que se responde con 409. M: curl | `tests/api/metas.test.ts`, T-21 | No |
| CA-01.9 | RB-06 | I: juego `completado` y juego `abandonado` dan 409 | `tests/api/metas.test.ts` | No |
| CA-01.10 | RB-01, RB-09 | I: con 2 metas inactivas, crear da 201 y H-2 devuelve 3 | `tests/api/metas.test.ts` | No |
| CA-02.1 | RB-04 | I: crear con 1 hito y comprobar que se persiste | `tests/api/metas.test.ts` | No |
| CA-02.2 | RB-04 | V: objetivos 1 y 100 aceptados | `tests/dominio/validarDatosMeta.test.ts` | Sí |
| CA-02.3 | RB-04 | V: 0, 101 y −5 rechazados | `tests/dominio/validarDatosMeta.test.ts` | Sí |
| CA-02.4 | RB-04 | V: 5 hitos aceptados | `tests/dominio/validarDatosMeta.test.ts` | Sí |
| CA-02.5 | RB-04 | V: 6 hitos rechazados con «máximo 5» | `tests/dominio/validarDatosMeta.test.ts` | Sí |
| CA-02.6 | RB-04 | V: descripción `""` y `"   "` rechazadas | `tests/dominio/validarDatosMeta.test.ts` | Sí |
| CA-02.7 | RB-04 | V: sin `hitos` en modo crear devuelve `[]` | `tests/dominio/validarDatosMeta.test.ts` | Sí |
| CA-02.8 | RB-04 | V: dos hitos con objetivo 50 aceptados | `tests/dominio/validarDatosMeta.test.ts` | Sí |
| CA-03.1 | RB-09 | I: H-2 devuelve la activa con sus hitos (la presentación se verifica en la spec de frontend) | `tests/api/metas.test.ts` | No |
| CA-03.2 | RB-09 | I: 1 activa y 2 inactivas; H-2 devuelve 3 con la activa primero | `tests/api/metas.test.ts` | No |
| CA-03.3 | RB-09 | I: juego sin metas; H-2 responde 200 con `[]` | `tests/api/metas.test.ts` | No |
| CA-03.4 | RB-09 | I: H-3 devuelve horas, días, hitos y `activa` | `tests/api/metas.test.ts` | No |
| CA-03.5 | RB-09 | I: dos juegos; H-2 del juego A no incluye las metas de B | `tests/api/metas.test.ts` | No |
| CA-04.1 | RB-10, RB-23 | I: H-4 con 8 y 5, y después H-6 refleja la meta 8 y 5 | `tests/api/metas.test.ts`, `tests/api/progreso.test.ts` | No |
| CA-04.2 | RB-23 | U: 4 h con una meta de 8 dan 50 | `tests/dominio/semana.test.ts` | Sí |
| CA-04.3 | RB-10 | I: H-4 reemplaza la lista de hitos completa | `tests/api/metas.test.ts` | No |
| CA-04.4 | RB-10 | I: H-4 inválido da 400 y H-3 devuelve los valores anteriores | `tests/api/metas.test.ts` | No |
| CA-04.5 | RB-11 | I: H-4 sobre una meta inactiva da 409 | `tests/api/metas.test.ts` | No |
| CA-05.2 | RB-12, RB-28 | I: H-5 da 200 con `activa: false`, aparece en H-2 y H-6 devuelve `meta: null` | `tests/api/metas.test.ts` | No |
| CA-05.4 | RB-13 | I: segundo H-5 da 409 | `tests/api/metas.test.ts` | No |
| CA-05.5 | RB-14 | I: H-4 con `activa: true` da 400 y la meta sigue inactiva | `tests/api/metas.test.ts` | No |
| CA-06.1 | RB-19, RB-22, RB-23, RB-24 | U: 60+90+60 min con una meta de 5 y 4 dan 3,5 h, 70 % y 3 días, semana del 02-11 al 08-11. I: H-6 con el mismo escenario | `tests/dominio/semana.test.ts`, `tests/api/progreso.test.ts` | Sí |
| CA-06.2 | RB-22, RB-23 | U: 100 min dan 1,7 h; con una meta de 3, 57 % | `tests/dominio/semana.test.ts` | Sí |
| CA-06.3 | RB-24 | U: dos partidas el mismo día dan 1 día y 1,5 h | `tests/dominio/semana.test.ts` | Sí |
| CA-06.4 | RB-20 | U: `fechaDePartida(2026-11-08T00:00Z)` da `2026-11-08`, que cuenta en la semana del 02-11 | `tests/dominio/semana.test.ts` | Sí |
| CA-06.5 | RB-19 | U: partidas del 01-11 y del 02-11; solo cuenta la del 02-11 | `tests/dominio/semana.test.ts` | Sí |
| CA-06.6 | RB-19 | U: `fechaHoyGuayaquil(2026-11-09T03:00Z)` da `2026-11-08`, semana del 02-11 al 08-11 | `tests/dominio/semana.test.ts` | Sí |
| CA-06.7 | RB-23 | U: 7 h con una meta de 5 dan 140 | `tests/dominio/semana.test.ts` | Sí |
| CA-06.8 | RB-21 | U: partida del 07-11 con hoy 05-11 no cuenta; con hoy 07-11 sí cuenta | `tests/dominio/semana.test.ts` | Sí |
| CA-06.9 | RB-32 | I: partidas de otro juego no afectan a H-6 (el servicio filtra por videojuego) | `tests/api/progreso.test.ts` | No |
| CA-06.10 | RB-32 | I: POST de una partida y después H-6 incluye la partida | `tests/api/progreso.test.ts` | No |
| CA-06.11 | RB-32 | I: DELETE de una partida y después H-6 ya no la cuenta | `tests/api/progreso.test.ts` | No |
| CA-07.1 | RB-25 | U: fechas [04-11] con hoy 05-11 dan 1 | `tests/dominio/rachas.test.ts` | Sí |
| CA-07.2 | RB-25 | U: fechas [04-11, 05-11] con hoy 05-11 dan 2 | `tests/dominio/rachas.test.ts` | Sí |
| CA-07.3 | RB-25, RB-26 | U: última partida el 03-11, hoy 05-11: actual 0, mejor 6 | `tests/dominio/rachas.test.ts` | Sí |
| CA-07.4 | RB-25 | U: del 02-11 al 05-11 dan 4 | `tests/dominio/rachas.test.ts` | Sí |
| CA-07.5 | RB-25, RB-26 | U: 9 días en octubre, un hueco y 4 hasta hoy: actual 4, mejor 9. M: juego con ≥5 partidas y racha rota | `tests/dominio/rachas.test.ts`, T-21 | Sí |
| CA-07.6 | RB-25 | U: [03-11, 03-11, 03-11, 04-11] con hoy 04-11 dan 2 | `tests/dominio/rachas.test.ts` | Sí |
| CA-07.7 | RB-25 | U: del 30-10 al 02-11 con hoy 02-11 dan 4 | `tests/dominio/rachas.test.ts` | Sí |
| CA-07.8 | RB-25 | U: del 2026-12-30 al 2027-01-02 dan 4 | `tests/dominio/rachas.test.ts` | Sí |
| CA-07.9 | RB-32 | I: una partida de otro juego hoy no cambia la racha de este (U: la función recibe solo las fechas del juego) | `tests/api/progreso.test.ts` | No |
| CA-07.10 | RB-21, RB-25 | U: [04-11, 05-11, 06-11] con hoy 05-11 dan 2 | `tests/dominio/rachas.test.ts` | Sí |
| CA-07.11 | RB-26 | U: si la racha actual de 5 es la más larga, la mejor también es 5 | `tests/dominio/rachas.test.ts` | Sí |
| CA-08.1 | RB-27 | U: hitos 25, 50 y 100 con avance 60 dan alcanzado, alcanzado y pendiente | `tests/dominio/hitos.test.ts` | Sí |
| CA-08.2 | RB-27 | U: avance 50 con hito de 50 da alcanzado | `tests/dominio/hitos.test.ts` | Sí |
| CA-08.3 | RB-27 | U: el mismo hito con avance 40 da pendiente | `tests/dominio/hitos.test.ts` | Sí |
| CA-08.4 | RB-27 | I: partidas de 70 % (lunes) y 40 % (martes); H-6 usa 40 y el hito de 50 queda pendiente | `tests/api/progreso.test.ts` | No |
| CA-08.5 | RB-27 | U: meta sin hitos da `hitos: []` | `tests/dominio/progreso.test.ts` | Sí |
| CA-09.1 | RB-28 | U: `meta: null` da porcentaje `null`, `hitos: []` y horas, días y rachas calculados. I: H-6 | `tests/dominio/progreso.test.ts`, `tests/api/progreso.test.ts` | Sí |
| CA-09.2 | RB-29 | U: sin partidas, con meta de 5 y 4 e hitos de 25 y 50: todo 0, 0 % y ningún hito alcanzado | `tests/dominio/progreso.test.ts` | Sí |
| CA-09.3 | RB-28, RB-29 | U: sin partidas y sin meta: todo 0, `meta: null`. I: H-6 responde 200 | `tests/dominio/progreso.test.ts`, `tests/api/progreso.test.ts` | Sí |
| CA-09.4 | RB-25, RB-26 | U: solo partidas antiguas: semana 0, actual 0, mejor 3 | `tests/dominio/progreso.test.ts` | Sí |
| CA-10.1 | RB-17 | I: juego sin partidas y con 2 metas; DELETE da 204, `Meta.countDocuments` da 0 y H-3 da 404 | `tests/api/videojuegos-metas.test.ts` | No |
| CA-10.2 | RB-17, RB-18 | I: juego con partidas: DELETE da 409 y el juego y la meta siguen | `tests/api/videojuegos-metas.test.ts` | No |
| CA-10.3 | RB-17 | I: eliminar el juego A no cambia la meta de B | `tests/api/videojuegos-metas.test.ts` | No |
| CA-11.1 | RB-16 | I: PUT del juego a `completado`; la meta queda `activa: false` y H-6 devuelve `meta: null` | `tests/api/videojuegos-metas.test.ts` | No |
| CA-11.2 | RB-16 | I: de `pausado` a `abandonado`; la meta queda `activa: false` | `tests/api/videojuegos-metas.test.ts` | No |
| CA-11.3 | RB-16 | I: de `jugando` a `pausado`; la meta sigue activa | `tests/api/videojuegos-metas.test.ts` | No |
| CA-11.4 | RB-16 | I: de `completado` a `jugando`; no hay meta activa y H-1 da 201 | `tests/api/videojuegos-metas.test.ts` | No |
| CA-11.5 | RB-16, RB-18 | I: PUT cambiando solo el nombre; la meta no cambia y la respuesta del PUT es igual que en E1 | `tests/api/videojuegos-metas.test.ts` | No |
| CA-12.1 | RB-05, RB-30 | I: un id válido inexistente en H-1, H-2 y H-6 da 404 «Videojuego no encontrado». M: curl | `tests/api/metas.test.ts`, `tests/api/progreso.test.ts`, T-21 | No |
| CA-12.2 | RB-30 | I: `abc` en H-6 da 400 con un mensaje distinto del 404. M: curl | `tests/api/progreso.test.ts`, T-21 | No |
| CA-12.3 | RB-15 | I: H-3, H-4 y H-5 con un id inexistente dan 404 «Meta no encontrada» | `tests/api/metas.test.ts` | No |
| CA-12.4 | RB-15 | I: H-3 con `abc` da 400 | `tests/api/metas.test.ts` | No |
| CA-12.5 | RB-35, RB-36 | I: se fuerza un fallo del servicio con `vi.spyOn`; la respuesta es 500 sin stack y con `requestId` | `tests/api/errores.test.ts` | No |
| CA-DT1.1 | RB-33 | I: los errores de E1 (id inválido, 404 de videojuego, partida y logro, 409 por partidas) mantienen código y mensaje | `tests/api/errores.test.ts` | No |
| CA-DT1.2 | RB-33 | I: cada error de Meta da su código. Además, `grep`: ningún archivo de `services/` importa errores de otro servicio | `tests/api/errores.test.ts` | No |
| CA-DT2.1 | RB-34 | I: un cuerpo mayor de 100 kB da 413 | `tests/api/errores.test.ts` | No |
| CA-DT2.2 | RB-34 | I: `Content-Type: application/json; charset=latin9` da 415 | `tests/api/errores.test.ts` | No |
| CA-DT2.3 | RB-34 | I: JSON mal formado da 400. Además, revisión del README | `tests/api/errores.test.ts`, README | No |
| CA-DT3.1 | RB-36 | I: `GET /api/videojuegos?estado=xyz` da 400 «Filtro estado no válido» con `requestId` | `tests/api/errores.test.ts` | No |
| CA-DT3.2 | RB-36 | I: `PATCH` de un logro con `{ obtenido, extra }` da 400 «Solo se permite el campo obtenido» con `requestId` | `tests/api/errores.test.ts` | No |
| CA-DT3.3 | RB-36 | I: un filtro válido, sin filtro y un `PATCH` de logro válido siguen respondiendo 200 | `tests/api/errores.test.ts` | No |

**Reglas sin criterio de usuario** (arquitectura y contrato). **G** = comando de comprobación.

| Regla | Verificación | Evidencia | ¿Sin BD? |
|---|---|---|---|
| RB-07 | V: un cuerpo con `videojuego`, `activa`, `_id` o un campo desconocido, o un hito con un campo extra, da `DatosMetaInvalidos` «Campos no permitidos: …». I: H-1 y H-4 responden 400 | `tests/dominio/validarDatosMeta.test.ts`, `tests/api/metas.test.ts` | Sí |
| RB-08 | V: los tests de `validarDatosMeta` corren sin conexión a MongoDB. I: `new Meta({...}).validate()` rechaza los mismos límites (0 h, 8 días, 6 hitos) | `tests/dominio/validarDatosMeta.test.ts`, `tests/api/metas.test.ts` | Sí |
| RB-31 | G: `grep -nE "from \"(mongoose\|express)\"\|models/\|services/\|Date\.now\|new Date\(\)" backend/src/dominio/progreso.ts` sale vacío. U: todos los tests de `tests/dominio/` pasan sin base de datos | Salida del comando y del test | Sí |
| RB-37 | G: `grep -rn "new: true" backend/src/services/metas.service.ts backend/src/services/progreso.service.ts` sale vacío | Salida del comando | Sí |

**Criterios que no se verifican en esta spec**, porque son solo de interfaz: CA-01.11, CA-05.1, CA-05.3 y CA-06.12. Están en la spec de frontend.

---

## 10. Ticket → archivos

**Leyenda:** **N** = archivo nuevo · **M** = archivo modificado.

| Ticket | Tipo | Archivos |
|---|---|---|
| T-04 | test | N `backend/vitest.config.ts`, N `backend/tests/setup/mongo.ts`, N `backend/tests/humo.test.ts`, M `backend/package.json` (script `test` y devDependencies), M `AGENTS.md` (quitar el comando provisional) |
| T-05 | backend | N `backend/src/errors/index.ts`, M `backend/src/services/videojuegos.service.ts`, M `backend/src/services/partidas.service.ts`, M `backend/src/middlewares/errorHandler.ts`, N `backend/tests/api/errores.test.ts` |
| T-06 | backend | M `backend/src/middlewares/errorHandler.ts`, M `README.md`, M `backend/tests/api/errores.test.ts` |
| T-32 | backend | M `backend/src/errors/index.ts` (`FiltroEstadoInvalido`, `CamposLogroNoPermitidos`), M `backend/src/controllers/videojuegos.controller.ts`, M `backend/tests/api/errores.test.ts` |
| T-07 | test | N `backend/tests/dominio/semana.test.ts` |
| T-08 | backend | N `backend/src/dominio/progreso.ts` (`fechaHoyGuayaquil`, `fechaDePartida`, `semanaActual`, `horasSemana`, `porcentajeHoras`, `diasJugadosSemana`) |
| T-09 | test | N `backend/tests/dominio/rachas.test.ts` |
| T-10 | backend | M `backend/src/dominio/progreso.ts` (`rachaActual`, `mejorRacha`) |
| T-11 | test | N `backend/tests/dominio/hitos.test.ts` |
| T-12 | backend | M `backend/src/dominio/progreso.ts` (`evaluarHitos`) |
| T-13 | backend | N `backend/src/models/meta.ts`, N `backend/src/types/meta.types.ts`, N `backend/src/services/metas.service.ts` (`validarDatosMeta`), M `backend/src/errors/index.ts` (`DatosMetaInvalidos`), N `backend/tests/dominio/validarDatosMeta.test.ts` |
| T-14 | backend | M `backend/src/services/metas.service.ts` (`crearMeta`), N `backend/src/controllers/metas.controller.ts`, M `backend/src/routes/videojuegos.routes.ts` (H-1), M `backend/src/errors/index.ts` (`MetaActivaDuplicada`, `VideojuegoCerrado`), M `backend/src/middlewares/errorHandler.ts` (error 11000), N `backend/tests/api/metas.test.ts` |
| T-15 | backend | M `metas.service.ts` (`obtenerMeta`, `listarMetas`), M `metas.controller.ts`, N `backend/src/routes/metas.routes.ts` (H-3), M `videojuegos.routes.ts` (H-2), M `backend/src/app.ts` (montar `/api/metas`), M `errors/index.ts` (`MetaNoEncontrada`), M `tests/api/metas.test.ts` |
| T-16 | backend | M `metas.service.ts` (`editarMeta`), M `metas.controller.ts`, M `metas.routes.ts` (H-4), M `errors/index.ts` (`MetaDesactivada`), M `tests/api/metas.test.ts` |
| T-17 | backend | M `metas.service.ts` (`desactivarMeta`), M `metas.controller.ts`, M `metas.routes.ts` (H-5), M `tests/api/metas.test.ts` |
| T-18 | backend | M `backend/src/dominio/progreso.ts` (`calcularProgresoSemanal`), N `backend/src/services/progreso.service.ts`, N `backend/src/controllers/progreso.controller.ts`, M `videojuegos.routes.ts` (H-6), N `backend/tests/dominio/progreso.test.ts`, N `backend/tests/api/progreso.test.ts` |
| T-19 | integración | M `backend/src/services/videojuegos.service.ts` (`actualizarVideojuego`, RB-16), N `backend/tests/api/videojuegos-metas.test.ts` |
| T-20 | integración | M `backend/src/services/videojuegos.service.ts` (`eliminarVideojuego`, RB-17), M `backend/tests/api/videojuegos-metas.test.ts` |
| T-21 | test | N `docs/evidencias/pruebas-api-E2.md` (tabla de pruebas con curl o Thunder Client: petición, respuesta esperada y respuesta obtenida) |

**Archivos que NO DEBEN modificarse:**
- `backend/src/models/partida.ts` y `backend/src/models/videojuego.ts`.
- `calcularResumen`.
- `.env` y `.env.example` (`.env.example` solo en T-30).

---

## 11. Puntos abiertos

| ID | Punto | Estado |
|---|---|---|
| PA-B1 | P-03: una partida con fecha futura cambia `avanceActual` y, por tanto, los hitos | Aceptado y documentado en §7. Diferido en el backlog §6 |
| PA-B2 | TD-09: la cascada no usa transacción. Si falla entre el borrado de las metas y el del juego, el juego queda sin metas | Riesgo bajo: es una sola persona usuaria y el juego no tiene partidas en ese momento. Se reevaluará si aparecen fallos |
| PA-B3 | Las decisiones técnicas TD-01 a TD-15 de esta spec y de la de frontend están pendientes de aprobación | Pendiente |
