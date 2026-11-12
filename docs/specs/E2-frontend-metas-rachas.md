# Spec frontend · Metas, progreso semanal y rachas

- **Épica:** E2 · Metas y rachas
- **Historias:** HU-01 a HU-09, HU-11 y HU-12 (parte de interfaz)
- **Tickets:** T-22 a T-28
- **Estado:** borrador, pendiente de aprobación
- **Fuentes:**
  - `docs/prd/diario-gamer.md`
  - `docs/backlog/E2-metas-y-rachas.md`
  - `DESIGN.md`
  - `docs/specs/E2-backend-metas-progreso.md` (contrato H-1 a H-6)

Las etiquetas de origen son las mismas que en la spec de backend:
- **[RO]:** obligatoria.
- **[D]:** decisión del PRD.
- **[TD]:** decisión técnica de esta spec.

---

## 1. Objetivo

Mostrar en el detalle de cada videojuego una sección **Progreso semanal** con:
- Horas frente a la meta.
- Días jugados frente a días objetivo.
- Racha actual y mejor racha.
- Hitos con su estado.

Además, ofrecer:
- Un formulario para crear y editar la meta con sus hitos.
- La acción de desactivarla con confirmación.

Todo debe respetar la estética futurista existente y las reglas de `DESIGN.md`.

## 2. Alcance

**Incluye:**
- El servicio `metasApi.ts` y sus tipos.
- La sección de progreso y sus indicadores.
- La lista de hitos.
- La lista de metas anteriores.
- La página del formulario de meta.
- La acción de desactivar.
- Los estados de interfaz.
- Los tokens de espaciado.
- La revisión de diseño.

**No incluye:**
- Cambios en el backend.
- Gráficos históricos, notificaciones o recordatorios (PRD §7, P-06).
- Editar partidas (P-04).
- Librerías de UI.
- Tests automatizados de frontend. B5 está diferido y la verificación de interfaz es manual (ver §9).

---

## 3. Reglas

### 3.1 Integración y datos

- **RF-01 [RO].** Toda comunicación con la API de metas y progreso **DEBE** pasar por `frontend/src/api/metasApi.ts`.
  - Los componentes y las páginas **NO DEBEN** llamar a `fetch`. Se verifica con `grep -rn "fetch(" src/components src/pages`, que debe salir vacío.
- **RF-02 [TD].** Los tipos de E2 **DEBEN** vivir en `frontend/src/types/metas.types.ts` y reflejar exactamente el contrato H-1 a H-6 de la spec de backend.
- **RF-03 [TD].** Al enviar una meta, `metasApi` **DEBE** mandar solo `horasSemanales`, `diasPorSemana` y `hitos[{ descripcion, porcentajeObjetivo }]`, sin `_id`, `activa` ni `videojuego`. El backend rechaza cualquier campo extra (RB-07).
- **RF-04 [TD] (TD-14).** `VideojuegoDetallePage` **DEBE** cargar el progreso y las metas **por separado** de los datos de E1. Así, un fallo del progreso **NO DEBE** ocultar el resto del detalle (CA-06.12).
- **RF-05 [RO]+[TD] (RO-19, TD-14).** El progreso **DEBE** volver a consultarse en estos casos:
  - **Al montar el detalle** o cambiar el `id`. Registrar una partida (`PartidaFormPage` ya navega a `/videojuegos/:id`) y eliminarla desde `/partidas` hacen que el detalle se vuelva a montar al volver.
  - **Al guardar la meta**, porque el formulario navega al detalle.
  - **Al desactivar la meta**, incrementando un contador `recarga` que forma parte de las dependencias del efecto.
  - **Al pulsar «Intentar de nuevo».**

  Editar partidas no existe (P-04) y no se implementa.

### 3.2 Sección «Progreso semanal»

- **RF-06 [RO] (RO-18).** La sección **DEBE** mostrar:
  - El rango de la semana.
  - Las horas de la semana.
  - Los días jugados.
  - La racha actual y la mejor racha.
  - Con meta activa, además: la barra de horas frente a la meta, los días objetivo y la lista de hitos.
- **RF-07 [D] (D-05, TD-15).** El texto **DEBE** mostrar el porcentaje real, por ejemplo «140 %». La barra **DEBE** tener un ancho de `min(porcentajeHoras, 100) %` y **NO DEBE** desbordar su contenedor. Además **DEBE** tener `role="progressbar"`, `aria-valuemin=0`, `aria-valuemax=100`, `aria-valuenow` acotado a 100 y `aria-valuetext` con el valor real.
- **RF-08 [D] (D-04).** Con meta activa, la sección **DEBE** mostrar el texto «El progreso se compara con tu meta actual.».
- **RF-09 [RO] (RO-14).** Sin meta activa (`meta === null`):
  - La sección **DEBE** mostrar las horas, los días jugados y las rachas.
  - **NO DEBE** mostrar porcentaje, días objetivo, barra de meta ni hitos.
  - **DEBE** mostrar el estado vacío «Aún no tienes una meta para este juego. Crea una para seguir tu semana.» con el botón «Crear meta».
- **RF-10 [D]+[TD] (D-07).** Si el juego está `completado` o `abandonado`, el estado vacío **NO DEBE** ofrecer «Crear meta». En su lugar **DEBE** decir «Los juegos completados o abandonados no pueden tener una meta activa.».
- **RF-11 [RO] (RO-15).** Sin partidas en la semana, los valores **DEBEN** mostrarse en 0 («0 h», «0 de 4 días», «0 días»). **NO DEBE** mostrarse como error.
- **RF-12 [RO] (RO-13).** Cada hito **DEBE** indicar su estado **con texto**: «✓ Alcanzado» (con el símbolo `aria-hidden`) o «Pendiente». El color lima o el secundario **NO DEBE** ser el único indicador. Una meta sin hitos **DEBE** mostrar «Esta meta no tiene hitos.».
- **RF-13 [TD].** Los números **DEBEN** formatearse en `es-EC` con su unidad: «3,5 h», «1 día» o «4 días», «70 %». El rango de la semana **DEBE** formatearse con `timeZone: "UTC"`, igual que las fechas de E1, para que no se desplace un día: «Semana del 2 al 8 de nov.».

### 3.3 Formulario de meta

- **RF-14 [TD] (TD-13).** El formulario **DEBE** estar en `MetaFormPage`, con dos rutas:
  - `/videojuegos/:id/meta/nueva`: crear.
  - `/videojuegos/:id/meta/editar`: edita la meta activa, que se obtiene con `listarPorVideojuego`.

  Si se entra a editar y no hay meta activa, **DEBE** mostrarse «Este videojuego no tiene una meta activa.» con un enlace para crearla.
- **RF-15 [RO] (RO-02, RO-03).** Antes de enviar, el formulario **DEBE** validar las mismas reglas que RB-03 y RB-04, con **los mismos mensajes** del catálogo de la spec de backend. Si hay un error, **NO DEBE** enviarse.
- **RF-16 [RO] (CA-01.11).** Cuando el backend rechaza los datos (400 o 409), el formulario **DEBE** mostrar `mensaje` en un bloque `role="alert"` y **DEBE** conservar todos los valores escritos.
- **RF-17 [RO] (RO-03).** El editor de hitos:
  - **DEBE** permitir agregar, editar y quitar hitos.
  - Con 5 hitos, **DEBE** deshabilitar «Agregar hito» y mostrar «Máximo 5 hitos».
  - Cada campo **DEBE** tener una etiqueta accesible, por ejemplo «Descripción del hito 1» y «Porcentaje objetivo del hito 1».
- **RF-18 [TD].** Mientras se guarda:
  - El botón de envío **DEBE** estar deshabilitado y mostrar «Guardando…».
  - **NO DEBE** poder enviarse dos veces.
  - Si el guardado funciona, **DEBE** navegar a `/videojuegos/:id`.
- **RF-19 [TD].** Los campos:
  - **Horas:** `type="number"`, `min="0.1"`, `max="100"`, `step="0.1"`.
  - **Días:** `type="number"`, `min="1"`, `max="7"`, `step="1"`.
  - **Porcentaje objetivo:** `type="number"`, `min="1"`, `max="100"`.

  Todos **DEBEN** tener un `label` con `htmlFor`.

### 3.4 Desactivar meta y metas anteriores

- **RF-20 [RO] (RO-06, TD-15).**
  - «Desactivar meta» **DEBE** pedir confirmación con `window.confirm("¿Desactivar la meta de <nombre>?")`.
  - Si se cancela, **NO DEBE** llamar a la API.
  - Mientras se desactiva, el botón **DEBE** estar deshabilitado y mostrar «Desactivando…».
  - Si funciona, **DEBE** incrementar `recarga`. Si falla, **DEBE** mostrar el mensaje en `role="alert"` y la meta sigue activa.
- **RF-21 [RO] (RO-06).** El detalle **DEBE** mostrar una lista simple «Metas anteriores» con las metas desactivadas («5 h · 4 días · creada el 2 nov. 2026»). Si no hay ninguna, la lista **NO DEBE** mostrarse. **NO DEBE** incluir gráficos (PRD §7).

### 3.5 Estados, diseño y accesibilidad

- **RF-22 [RO].** Cada vista **DEBE** cubrir los estados de §6:
  - **Carga:** `.loading-pulse` con `role="status"` y `aria-label`.
  - **Error:** `.state-panel` con `role="alert"` y el botón «Intentar de nuevo».
  - **Vacío:** `.empty-state`.
- **RF-23 [RO] (DESIGN.md §2, §4 y §9).**
  - El CSS nuevo **DEBE** usar solo variables de `:root`. **NO DEBE** contener colores hexadecimales ni `rgb()` literales.
  - T-22 **DEBE** agregar los tokens `--space-1` a `--space-6` (4, 8, 12, 16, 24 y 32 px) sin cambiar el aspecto de E1.
- **RF-24 [RO].** **NO DEBEN** agregarse dependencias a `frontend/package.json`: ni librerías de UI, ni de gráficos, ni de CSS-in-JS.
- **RF-25 [RO] (DESIGN.md §5).** La UI **DEBE** reutilizar las clases existentes:
  - `.panel` y `.section-title`.
  - `.resumen-grid` y `.estadistica`.
  - `.progress-track` y `.progress-fill`.
  - `.empty-state`, `.state-panel` y `.mensaje-error`.
  - `.formulario`, `.fila-logro` y `.lista-logros`.
  - `.boton`, `.button-secondary` y `.boton-eliminar`.

  Debe haber **un solo** botón primario por bloque.
- **RF-26 [RO] (DESIGN.md §6).** Los textos **DEBEN** estar en español, con tuteo, y los botones **DEBEN** empezar con un verbo: «Crear meta», «Editar meta», «Desactivar meta», «Guardar meta», «Guardar cambios», «Agregar hito», «Quitar», «Cancelar», «Intentar de nuevo».
- **RF-27 [RO] (DESIGN.md §7).**
  - El foco visible **NO DEBE** eliminarse.
  - Todo **DEBE** poder usarse con teclado.
  - Las zonas táctiles **DEBEN** medir al menos 36 px.
  - La sección **DEBE** verse sin scroll horizontal a 320 px de ancho.

---

## 4. Contrato de `metasApi` y tipos

`frontend/src/types/metas.types.ts`:
```ts
export interface Hito { _id?: string; descripcion: string; porcentajeObjetivo: number }
export interface Meta {
  _id: string; videojuego: string; horasSemanales: number; diasPorSemana: number;
  activa: boolean; hitos: Hito[]; createdAt: string; updatedAt: string;
}
export interface MetaFormDTO {
  horasSemanales: number; diasPorSemana: number;
  hitos: Array<{ descripcion: string; porcentajeObjetivo: number }>;
}
export interface HitoEvaluado { descripcion: string; porcentajeObjetivo: number; alcanzado: boolean }
export interface ProgresoSemanal {
  semana: { inicio: string; fin: string };
  meta: { horasSemanales: number; diasPorSemana: number } | null;
  horasSemana: number; porcentajeHoras: number | null; diasJugadosSemana: number;
  rachaActual: number; mejorRacha: number; hitos: HitoEvaluado[];
}
```

`frontend/src/api/metasApi.ts`:

| Función | Llamada (spec backend) | Devuelve |
|---|---|---|
| `listarPorVideojuego(videojuegoId)` | H-2 `GET /videojuegos/:id/metas` | `Meta[]` |
| `obtener(metaId)` | H-3 `GET /metas/:metaId` | `Meta` |
| `crear(videojuegoId, datos: MetaFormDTO)` | H-1 `POST /videojuegos/:id/metas` | `Meta` |
| `actualizar(metaId, datos: MetaFormDTO)` | H-4 `PUT /metas/:metaId` | `Meta` |
| `desactivar(metaId)` | H-5 `PATCH /metas/:metaId/desactivar` | `Meta` |
| `obtenerProgreso(videojuegoId)` | H-6 `GET /videojuegos/:id/progreso-semanal` | `ProgresoSemanal` |

**Detalles de implementación:**
- Usa `import.meta.env.VITE_API_URL`, igual que los servicios de E1, y `encodeURIComponent` en los ids.
- Si la respuesta no es `ok`, lanza un `Error` con el `mensaje` que devuelve el backend.
- Incluye su propia copia de `procesarRespuesta`. Es la decisión C-7: B5 está diferido.

---

## 5. Componentes

| Componente | Archivo | Props | Responsabilidad |
|---|---|---|---|
| Panel de progreso semanal | `components/ProgresoSemanal.tsx` | `progreso: ProgresoSemanal`, `videojuegoId: string`, `puedeTenerMeta: boolean` | Contenedor `.panel` con `section-title` «Progreso semanal» y el rango de la semana. Compone los indicadores, el aviso de RF-08 y el estado vacío de RF-09 o RF-10 |
| Indicador de horas | `components/IndicadorHoras.tsx` | `horas: number`, `meta: number \| null`, `porcentaje: number \| null` | «3,5 h de 5 h · 70 %» y la barra de RF-07. Sin meta, solo muestra «3,5 h esta semana» |
| Indicador de días | `components/IndicadorDias.tsx` | `dias: number`, `objetivo: number \| null` | «3 de 4 días», o «3 días esta semana» sin meta, en una `.estadistica` |
| Rachas | `components/RachasJuego.tsx` | `actual: number`, `mejor: number` | Dos `.estadistica`: «Racha actual · 4 días» y «Mejor racha · 9 días» |
| Lista de hitos | `components/ListaHitos.tsx` | `hitos: HitoEvaluado[]` | `<ul>` con descripción, «50 %» y el estado en texto (RF-12) |
| Acciones de la meta | `components/MetaAcciones.tsx` | `meta: Meta`, `nombreJuego: string`, `desactivando: boolean`, `onDesactivar(): void` | Enlace «Editar meta» (`.button-secondary`) y «Desactivar meta» (`.boton-eliminar`) con la confirmación de RF-20 |
| Metas anteriores | `components/MetasAnteriores.tsx` | `metas: Meta[]` (solo inactivas) | La lista de RF-21 |
| Formulario de meta | `pages/MetaFormPage.tsx` | Rutas de RF-14 | Formulario `.formulario` con horas, días y el editor de hitos (`.fila-logro` y `.lista-logros`), siguiendo RF-15 a RF-19 |

**Integración en `VideojuegoDetallePage.tsx`:**
- Nuevo estado: `progreso`, `estadoProgreso` (`'cargando' | 'error' | 'listo'`), `metas`, `desactivando`, `errorMeta` y `recarga`.
- La sección se ubica después de `ResumenProgreso` y antes de «Logros».
- `puedeTenerMeta = videojuego.estado === "jugando" || videojuego.estado === "pausado"`.

**Rutas en `App.tsx`:** se agregan `/videojuegos/:id/meta/nueva` y `/videojuegos/:id/meta/editar`.

---

## 6. Estados de interfaz

| Estado | Condición | Qué se ve | Regla |
|---|---|---|---|
| **Cargando** | Se está pidiendo el progreso o las metas | `.loading-pulse` con `role="status"` y `aria-label="Cargando progreso semanal"`. El resto del detalle de E1 ya está visible | RF-04, RF-22 |
| **Error** | Falla `obtenerProgreso` o `listarPorVideojuego` | `.state-panel` con `role="alert"`, el mensaje y «Intentar de nuevo», que incrementa `recarga` | RF-22, CA-06.12 |
| **Vacío (sin partidas)** | `horasSemana === 0` y `diasJugadosSemana === 0` | Indicadores en 0 y el texto «Aún no has jugado esta semana.» | RF-11 |
| **Sin meta activa** | `progreso.meta === null` | Horas, días y rachas, más el estado vacío con «Crear meta» (o el texto de RF-10) | RF-09, RF-10 |
| **Meta activa** | `progreso.meta !== null` | Barra de horas, días frente al objetivo, rachas, aviso de RF-08, hitos y `MetaAcciones` | RF-06 a RF-08, RF-12 |
| **Guardando cambios** | Envío del formulario en curso | Botón deshabilitado con «Guardando…» y campos conservados | RF-18 |
| **Desactivando meta** | Llamada a `desactivar` en curso | «Desactivando…» con el botón deshabilitado | RF-20 |
| **Error de guardado o desactivación** | El backend responde 400 o 409 | `.mensaje-error` con `role="alert"` y el `mensaje` del backend | RF-16, RF-20 |
| **Editar sin meta activa** | Se entra a `/meta/editar` sin meta activa | «Este videojuego no tiene una meta activa.» y el enlace «Crear meta» | RF-14 |

---

## 7. Casos borde y decisiones aplicadas en la interfaz

| Decisión | Regla | Resultado visible |
|---|---|---|
| D-01 · Racha y día de hoy | RF-06 | Muestra `rachaActual` tal como llega. Con partida ayer y ninguna hoy, «Racha actual · 1 día» |
| D-02 · Varias partidas el mismo día | RF-06 | «1 de 4 días» aunque haya dos partidas ese día (lo calcula el backend) |
| D-03 · Partida que cruza la medianoche | RF-13 | El rango de la semana se formatea en UTC, así que no se desplaza un día |
| D-04 · Cambio de meta a mitad de semana | RF-08 | Aviso «El progreso se compara con tu meta actual.» |
| D-05 · Meta superada | RF-07 | «7 h de 5 h · 140 %», con la barra llena y sin desbordarse |
| D-06 · Hito y menos avance | RF-12 | El hito vuelve a «Pendiente» después de registrar una partida con menos avance |
| D-07 · Juego cerrado | RF-10 | No se ofrece «Crear meta» y se explica por qué. Al cerrar el juego, la meta pasa a «Metas anteriores» |
| D-08 · Eliminar el juego | — | Sin cambios de interfaz: la eliminación de E1 sigue igual y la cascada es del backend |
| D-11 · Meta desactivada | RF-20, RF-21 | No hay botón para reactivarla y aparece en «Metas anteriores» |

---

## 8. Ticket → archivos

**Leyenda:** **N** = archivo nuevo · **M** = archivo modificado.

| Ticket | Tipo | Archivos |
|---|---|---|
| T-22 | frontend | M `frontend/src/index.css` (tokens `--space-1` a `--space-6` en `:root`) |
| T-23 | frontend | N `frontend/src/api/metasApi.ts`, N `frontend/src/types/metas.types.ts` |
| T-24 | frontend | N `frontend/src/components/ProgresoSemanal.tsx`, N `IndicadorHoras.tsx`, N `IndicadorDias.tsx`, N `RachasJuego.tsx`, N `ListaHitos.tsx`, M `frontend/src/pages/VideojuegoDetallePage.tsx`, M `frontend/src/index.css` (clases de E2 con tokens) |
| T-25 | frontend | N `frontend/src/pages/MetaFormPage.tsx`, M `frontend/src/App.tsx` (2 rutas), M `frontend/src/index.css` (editor de hitos, si hace falta) |
| T-26 | frontend | N `frontend/src/components/MetaAcciones.tsx`, N `frontend/src/components/MetasAnteriores.tsx`, M `frontend/src/pages/VideojuegoDetallePage.tsx` |
| T-27 | integración | M `frontend/src/pages/VideojuegoDetallePage.tsx` (dependencias `[id, recarga]`). Se verifica sin modificar `PartidaFormPage.tsx` ni `PartidasHistoryPage.tsx` |
| T-28 | frontend | N `docs/evidencias/revision-diseno-E2.md` (tabla regla de DESIGN.md → pantalla → resultado → corrección), y M los archivos de T-22 a T-27 que haya que corregir |

**Archivos que NO DEBEN modificarse:**
- `frontend/package.json`.
- `api/videojuegosApi.ts` y `api/partidasApi.ts`.
- `.env` y `.env.example`.
- Los componentes de E1 que no aparecen en la tabla.

---

## 9. Criterio → verificación

**Leyenda:**
- **M:** prueba manual en el navegador, con captura en `docs/evidencias/frontend-E2/`.
- **R:** revisión de diseño (T-28).
- **G:** comando de comprobación.
- **B:** `npm run build` y `npm run lint` en verde.

Los cálculos los verifican los tests del backend. Aquí se verifica **lo que se muestra**.

| Criterio | Reglas | Verificación | Evidencia |
|---|---|---|---|
| CA-01.1 | RF-06, RF-18 | M: crear una meta de 5 h y 4 días lleva al detalle, que muestra «de 5 h» y «de 4 días» | Captura |
| CA-01.4 | RF-15 | M: escribir 0 en horas no envía el formulario y muestra el mensaje de horas | Captura |
| CA-01.6 | RF-15 | M: escribir 8 en días muestra el mensaje de días | Captura |
| CA-01.8 | RF-16 | M: con una meta activa en otra pestaña, crear otra muestra «Este videojuego ya tiene una meta activa» | Captura |
| CA-01.9 | RF-10, RF-16 | M: en un juego completado no se ofrece «Crear meta». Si se fuerza la ruta, se muestra el mensaje 409 | Captura |
| CA-01.11 | RF-16 | M: tras un rechazo, los valores escritos siguen en el formulario | Captura |
| CA-02.1 | RF-17 | M: agregar el hito «Llegar al 50 %» con 50 hace que aparezca en el detalle | Captura |
| CA-02.3 | RF-15 | M: un objetivo de 101 muestra el mensaje y no se envía | Captura |
| CA-02.5 | RF-17 | M: con 5 hitos, «Agregar hito» queda deshabilitado y se lee «Máximo 5 hitos» | Captura |
| CA-02.6 | RF-15 | M: una descripción vacía muestra «Cada hito necesita una descripción» | Captura |
| CA-03.1 | RF-06, RF-12 | M: el detalle muestra las horas, los días y los hitos de la meta activa | Captura |
| CA-03.2 | RF-21 | M: con 2 metas desactivadas, aparecen en «Metas anteriores» y la activa en el panel | Captura |
| CA-03.3 | RF-09 | M: un juego sin metas muestra la invitación, sin error | Captura |
| CA-04.1 | RF-14, RF-18 | M: editar a 8 h y 5 días lleva al detalle con «de 8 h» y «de 5 días» | Captura |
| CA-04.2 | RF-08 | M: con meta activa se ve «El progreso se compara con tu meta actual.» | Captura |
| CA-04.3 | RF-17 | M: agregar, quitar y renombrar hitos hace que el detalle muestre la lista resultante | Captura |
| CA-04.4 | RF-15, RF-16 | M: una edición inválida no se envía, o muestra el mensaje y conserva los valores | Captura |
| CA-05.1 | RF-20 | M: «Desactivar meta» abre la confirmación «¿Desactivar la meta de Hades?» | Captura |
| CA-05.2 | RF-05, RF-20, RF-21 | M: al confirmar se ve «Desactivando…», el panel pasa a «sin meta» y la meta aparece en «Metas anteriores» | Captura |
| CA-05.3 | RF-20 | M: al cancelar no se hace ninguna llamada (pestaña Red) y la meta sigue activa | Captura |
| CA-06.1 | RF-06, RF-13 | M: con el escenario del criterio se ve «Semana del 2 al 8 de nov.», «3,5 h de 5 h · 70 %» y «3 de 4 días» | Captura |
| CA-06.7 | RF-07 | M: con 7 de 5 h, «140 %» y la barra al 100 % sin desbordarse. R: inspección de `aria-valuetext` | Captura, T-28 |
| CA-06.10 | RF-05 | M: registrar una partida hoy y volver al detalle muestra horas, días y racha actualizados sin recargar | Captura |
| CA-06.11 | RF-05 | M: eliminar una partida en `/partidas` y volver al detalle hace que ya no cuente | Captura |
| CA-06.12 | RF-04, RF-22 | M: con el backend detenido o un id inválido para el progreso, el bloque de error tiene «Intentar de nuevo» y el resto del detalle es visible. Se ve el estado de carga | Captura |
| CA-07.2 | RF-05 | M: con una racha de 1, registrar una partida hoy hace que el detalle muestre «Racha actual · 2 días» | Captura |
| CA-07.4 | RF-06 | M: con 4 días seguidos se ve «Racha actual · 4 días» | Captura |
| CA-07.5 | RF-06 | M: se ven «Racha actual · 4 días» y «Mejor racha · 9 días» | Captura |
| CA-08.1 | RF-12 | M: los hitos de 25 y 50 muestran «✓ Alcanzado» y el de 100, «Pendiente». R: el estado no depende solo del color | Captura, T-28 |
| CA-08.5 | RF-12 | M: una meta sin hitos muestra «Esta meta no tiene hitos.» | Captura |
| CA-09.1 | RF-09 | M: sin meta, se ven horas, días y rachas, sin porcentaje ni hitos, con la invitación | Captura |
| CA-09.2 | RF-11 | M: con meta y sin partidas, «0 h de 5 h · 0 %», «0 de 4 días», rachas en 0 y hitos pendientes | Captura |
| CA-09.3 | RF-09, RF-11 | M: sin meta ni partidas, valores en 0 y la invitación, sin error | Captura |
| CA-11.1 | RF-05, RF-10, RF-21 | M: cambiar el juego a «completado» y volver al detalle muestra el panel sin meta, sin «Crear meta», y la meta en «Metas anteriores» | Captura |
| CA-12.1 | RF-22 | M: el detalle de un videojuego inexistente muestra el mensaje «Videojuego no encontrado» de E1 y la sección de progreso no se muestra | Captura |
| RF-01 | — | G: `grep -rn "fetch(" frontend/src/components frontend/src/pages` sale vacío | Salida del comando |
| RF-02 | — | B: `tsc -b` compila con los tipos de §4. R: los campos de §4 coinciden uno a uno con H-1 a H-6 de la spec de backend | Build y tabla de T-28 |
| RF-03 | — | M: en la pestaña Red, el cuerpo de `PUT /metas/:id` al editar una meta con hitos no contiene `_id`, `activa` ni `videojuego` | Captura |
| RF-19 | — | M y R: inspeccionar los inputs (tipo, `min`, `max` y `step` de RF-19) y comprobar que cada uno tiene su `label` asociado | Captura, T-28 |
| RF-23 | — | G: `grep -nE "#[0-9a-fA-F]{3,8}\|rgba?\(" ` sobre el bloque de CSS de E2 sale vacío | Salida del comando |
| RF-24 | — | G: `git diff main -- frontend/package.json` sale vacío | Salida del comando |
| RF-25 a RF-27 | — | R: tabla de revisión de diseño de T-28. B: build y lint en verde. M: 320 px y navegación con teclado | `docs/evidencias/revision-diseno-E2.md` |

**Criterios del backlog que no se verifican en esta spec**, porque son lógica que verifica la spec de backend:
- CA-01.2 a CA-01.3, CA-01.5, CA-01.7 y CA-01.10.
- CA-02.2, CA-02.4 y CA-02.7 a CA-02.8.
- CA-03.4 a CA-03.5.
- CA-04.5.
- CA-05.4 a CA-05.5.
- CA-06.2 a CA-06.6, CA-06.8 a CA-06.9.
- CA-07.1, CA-07.3, CA-07.6 a CA-07.11.
- CA-08.2 a CA-08.4.
- CA-09.4.
- CA-10.x.
- CA-11.2 a CA-11.5.
- CA-12.2 a CA-12.5.

---

## 10. Puntos abiertos

| ID | Punto | Estado |
|---|---|---|
| PA-F1 | Sin tests automatizados de frontend: la interfaz se verifica a mano, con capturas | Aceptado. B5 y los tests de frontend están diferidos (backlog §6) |
| PA-F2 | `metasApi.ts` repite `procesarRespuesta` (C-7) | Aceptado. Se resolverá junto con B5 |
| PA-F3 | Las decisiones técnicas TD-13 a TD-15 y RF-10, RF-13 y RF-14 están pendientes de aprobación | Pendiente |
