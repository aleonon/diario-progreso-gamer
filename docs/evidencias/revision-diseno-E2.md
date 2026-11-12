# Revisión de diseño · Frontend E2 (T-28)

- **Fecha:** 12 de noviembre de 2026.
- **Referencia:** `DESIGN.md` y `docs/specs/E2-frontend-metas-rachas.md` (RF-22 a RF-27).
- **Alcance:**
  - Componentes: `ProgresoSemanal`, `IndicadorHoras`, `IndicadorDias`, `RachasJuego`, `ListaHitos`, `MetaAcciones` y `MetasAnteriores`.
  - Páginas: `MetaFormPage`, y la integración en `VideojuegoDetallePage`.
  - Estilos: el bloque de CSS «E2 · Metas y rachas».

## Método

Revisión **de código** hecha por el agente: cada regla de DESIGN.md se contrastó con el JSX y el CSS, y con los comandos de la última columna.

El agente **no tuvo acceso a un navegador**. Las filas marcadas **«Pendiente (visual)»** las tiene que comprobar la persona responsable con `npm run dev`, siguiendo las instrucciones del final, y adjuntar las capturas en `docs/evidencias/frontend-E2/`.

## Resultados

| # | Regla (DESIGN.md / spec) | Pantalla o archivo | Resultado | Corrección o evidencia |
|---|---|---|---|---|
| 1 | Solo variables de `:root`, ningún color literal (§2, §9, RF-23) | Bloque de CSS de E2 | ✅ Cumple | El `grep` de hexadecimales y de `rgb()` sobre el bloque da **0** coincidencias. Los fondos translúcidos usan `color-mix()` con variables |
| 2 | Escala de espaciado con tokens (§4, T-22) | `:root` y bloque de E2 | ✅ Cumple | `--space-1` a `--space-6` agregados. El bloque de E2 usa solo `var(--space-*)` para márgenes y rellenos |
| 3 | Reutilizar los componentes existentes (§5, RF-25) | Todas | ✅ Cumple | Se usan `.panel`, `.section-title`, `.resumen-grid`, `.estadistica`, `.progress-track`, `.progress-fill`, `.empty-state`, `.state-panel`, `.loading-pulse`, `.formulario`, `.lista-logros`, `.boton`, `.button-secondary`, `.boton-eliminar` y `.mensaje-error` |
| 4 | Un solo botón primario por bloque (§9) | Panel, formulario y avisos | ✅ Cumple | Panel sin meta: «Crear meta». Panel con meta: «Editar meta» (secundario) y «Desactivar meta» (destructivo). Formulario: «Guardar meta» o «Guardar cambios» (primario) y «Agregar hito» (secundario) |
| 5 | Acento lima para éxito y coral para acciones destructivas (§2) | `ListaHitos`, `MetaAcciones` | ✅ Cumple | El hito alcanzado usa `--accent-lime`. «Desactivar meta» usa `.boton-eliminar` (coral). Nunca aparecen juntos en el mismo elemento |
| 6 | El color nunca es el único indicador (§7, RF-12) | `ListaHitos` | ✅ Cumple | Cada estado se indica con texto: «✓ Alcanzado» o «Pendiente» |
| 7 | La decoración lleva `aria-hidden` (§1, §7) | Indicadores, botones «＋» | ⚠️ → ✅ **Corregido** | Los símbolos ◷ ▦ ✦ ▥ ＋ se leían en voz alta. Ahora van en `<span aria-hidden="true">`. *El mismo problema sigue en `ResumenProgreso` de E1; queda como deuda visual de E1* |
| 8 | Barras con `role="progressbar"` y sus valores (§5, §7, RF-07) | `IndicadorHoras` | ✅ Cumple | Tiene `aria-valuemin`, `aria-valuemax`, `aria-valuenow` (acotado a 100) y `aria-valuetext` con el valor real («225 % de tu meta (4,5 de 2 h)») |
| 9 | Meta superada: valor real, barra sin desbordarse (D-05, RF-07) | `IndicadorHoras` | ✅ Cumple | El texto muestra `porcentaje` sin tope y el ancho es `Math.min(porcentaje, 100)%` |
| 10 | Estados de carga, error y vacío (§5, RF-22) | `VideojuegoDetallePage`, `MetaFormPage` | ✅ Cumple | Carga: `.loading-pulse` con `role="status"`. Error: `.state-panel` con `role="alert"` y «Intentar de nuevo». Vacío: `.empty-state` («Aún no tienes una meta…»), «Aún no has jugado esta semana.» y «Esta meta no tiene hitos.» |
| 11 | Un error de E2 no oculta el detalle de E1 (RF-04, CA-06.12) | `VideojuegoDetallePage` | ✅ Cumple | El progreso se carga en un efecto propio. Comprobado con el backend real: un id inválido da 400 y el bloque de error queda solo en la sección de E2 |
| 12 | Etiquetas de formulario asociadas (§7, RF-19) | `MetaFormPage` | ✅ Cumple | Cada `input` tiene un `label` con `htmlFor`. Los hitos tienen «Descripción del hito N» y «Porcentaje objetivo del hito N» dentro de un `fieldset` con `legend` |
| 13 | Tipos y límites de los campos (RF-19) | `MetaFormPage` | ✅ Cumple | Horas: `number`, de 0.1 a 100, paso 0.1. Días: de 1 a 7, paso 1. Porcentaje: de 1 a 100. El formulario usa `noValidate` para que se muestren los mensajes del catálogo (RF-15) y no los del navegador |
| 14 | Tono: tuteo, verbos en los botones y unidades (§6, RF-26) | Todas | ✅ Cumple | «Crear meta», «Editar meta», «Desactivar meta», «Guardar meta», «Guardar cambios», «Agregar hito», «Quitar», «Cancelar» e «Intentar de nuevo». Unidades: «4,5 h», «3 días», «70 %» |
| 15 | Confirmación destructiva que nombra el objeto (§6, RF-20) | `MetaAcciones` | ✅ Cumple | `¿Desactivar la meta de <nombre>?`. Si se cancela, no se llama a la API |
| 16 | Sin texto en inglés en la UI (§9) | Todas | ✅ Cumple | Revisado en el JSX |
| 17 | Sin librerías de UI nuevas (§8, RF-24) | `frontend/package.json` | ✅ Cumple | `git diff -- frontend/package.json` sale vacío |
| 18 | Ningún `fetch` en componentes o páginas (RF-01) | `src/components`, `src/pages` | ✅ Cumple | El `grep` de `fetch(` da 0 coincidencias. Todo pasa por `api/metasApi.ts` |
| 19 | `prefers-reduced-motion` (§7) | Barra de horas | ✅ Cumple | La transición de `.progress-fill` ya la anula la regla global de E1 |
| 20 | Foco visible y uso con teclado (§7, RF-27) | Formulario, acciones | ⏳ **Pendiente (visual)** | No se quitó ningún `outline`. Los inputs heredan el anillo púrpura de `.formulario` y los botones el foco lima global. Falta recorrerlo con Tab en el navegador |
| 21 | Sin scroll horizontal a 320 px (§7, RF-27) | Panel y formulario | ⏳ **Pendiente (visual)** | El CSS usa `flex-wrap` y `min-width: 0`, y `.resumen-grid` hereda los breakpoints de E1. Falta comprobarlo en el navegador |
| 22 | Contraste real de los textos nuevos (§7) | Panel | ⏳ **Pendiente (visual)** | Solo se usan `--text-primary`, `--text-secondary` (7,7:1) y lima (14,9:1); `--text-muted` no se usa. Falta revisarlo en pantalla |
| 23 | Coherencia visual con la estética futurista (§1) | Panel y formulario | ⏳ **Pendiente (visual)** | Se reutilizan los paneles, las tarjetas `.estadistica` con acentos por posición y el gradiente de la barra. Falta confirmarlo con capturas |

**Resumen:** 19 reglas cumplen (una de ellas después de corregirla) y 4 quedan pendientes de verificación visual. No hay desviaciones abiertas en el código.

## Cómo completar las filas pendientes

1. Levanta el backend (`cd backend && npm run dev`) y el frontend (`cd frontend && npm run dev`).
2. En un juego «jugando», abre su detalle:
   - Revisa el panel «Progreso semanal» sin meta.
   - Crea una meta con 2 hitos y revisa el panel con meta.
   - Desactiva la meta y revisa «Metas anteriores».
3. Recorre el formulario de meta solo con el teclado (Tab, Shift+Tab, Enter y Espacio).
4. En las herramientas de desarrollo, usa un ancho de 320 px y comprueba que no aparece scroll horizontal.
5. Guarda las capturas en `docs/evidencias/frontend-E2/` y cambia ⏳ por ✅ o ❌ en esta tabla.

## Notas

- `color-mix()` funciona en todos los navegadores actuales (Chrome y Edge 111+, Firefox 113+, Safari 16.2+).
- **CA-11.1** (la meta se desactiva al cerrar el juego) depende de **T-19** en el backend, que no está implementado. La parte del frontend (RF-10: no ofrecer «Crear meta» en juegos cerrados) sí está hecha.
