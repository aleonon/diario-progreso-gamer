# DESIGN.md — Sistema visual del Diario Gamer

Este documento describe la identidad visual que **ya existe** en `frontend/src/index.css`: una interfaz oscura, futurista y con estética de HUD. Es la referencia para toda la UI nueva de E2 (progreso semanal, metas e hitos).

La fuente de los valores es el bloque `:root` de `index.css`. Si un valor no está aquí ni en `:root`, no se usa.

---

## 1. Principios

1. **Oscuro y luminoso.** Fondo casi negro, superficies azul noche y acentos neón que señalan lo importante.
2. **Un acento manda.** Cada bloque tiene un solo color protagonista. El lima marca la acción o el dato clave.
3. **Datos primero.** Las cifras (horas, racha, porcentaje) se leen antes que la decoración.
4. **Decoración sin ruido.** Los glows, gradientes y símbolos (✦ ◷ ▥ ▦) son `aria-hidden` y nunca transmiten información por sí solos.

---

## 2. Colores

### Tokens existentes (`:root`)

| Token | Valor | Uso |
|---|---|---|
| `--bg-primary` | `#080b14` | Fondo de la página |
| `--bg-secondary` | `#101626` | Fondos de sección y paneles de estado |
| `--bg-card` | `#141b2b` | Tarjetas y paneles |
| `--bg-elevated` | `#1b2437` | Elementos elevados y hover |
| `--accent-lime` | `#d8ff20` | Acento principal: foco, `section-title`, éxito o meta cumplida |
| `--accent-purple` | `#873dff` | Acción primaria (botón `.boton`) y estado «jugando» |
| `--accent-cyan` | `#37cfff` | Información y datos neutros |
| `--accent-pink` | `#ff3d9a` | Énfasis secundario y estado «abandonado» |
| `--accent-orange` | `#ff9638` | Advertencia y estado «pausado» |
| `--accent-coral` | `#ff5478` | Error y acciones destructivas |
| `--text-primary` | `#f6f7ff` | Texto principal |
| `--text-secondary` | `#a5adc5` | Texto de apoyo y etiquetas de formulario |
| `--text-muted` | `#727d99` | Placeholders y metadatos (ver Accesibilidad) |
| `--border-subtle` | `rgba(151,166,211,.16)` | Bordes por defecto |
| `--border-highlight` | `rgba(135,61,255,.45)` | Bordes en hover o selección |

### Significado semántico

| Significado | Color | Ejemplo en E2 |
|---|---|---|
| Éxito / alcanzado | lima | Hito alcanzado, meta semanal cumplida |
| Acción primaria | púrpura (gradiente `#9b4cff → #7028e8`) | «Crear meta», «Guardar meta» |
| Información | cian | Días jugados en la semana |
| Advertencia | naranja | Racha en riesgo (si el PRD define ese estado) |
| Error / destructivo | coral | Mensajes de error y «Desactivar meta» |

### Estados de videojuego

Clases `.etiqueta` + `.status-<estado>`, o `.estado-badge` + `.estado-<estado>` sobre portadas:
- jugando → púrpura
- completado → lima
- pausado → naranja
- abandonado → rosa

### Barra de progreso

Gradiente `purple → pink → lime` sobre un riel `rgba(151,166,211,.16)`, de 7 px de alto y bordes redondeados.

---

## 3. Tipografía

| Rol | Fuente | Peso | Detalles |
|---|---|---|---|
| Texto base y UI | **Inter** (Google Fonts), fallback `ui-sans-serif, system-ui` | 400–700 | Interlineado de 1.65 en párrafos secundarios |
| Títulos, cifras, logo | **Space Grotesk**, fallback Inter | 600–700 | `letter-spacing` negativo (−0.03 a −0.055em) |
| Título de página | Space Grotesk | 700 | `clamp(2rem, 4vw, 3rem)` |
| Título de sección (`.section-title`) | Space Grotesk | 700 | `clamp(1.45rem, 3vw, 2rem)`, con barra lima a la izquierda |
| Eyebrow (`.eyebrow`) | Inter | 700 | 0.7rem, MAYÚSCULAS, `letter-spacing: .2em`, lima |
| Botones | Inter | 600 | 0.85rem |
| Etiquetas y metadatos | Inter | 600 | 0.7–0.76rem |

Solo se usan estas dos familias. Las cifras grandes (`.estadistica strong`) van en Space Grotesk.

---

## 4. Espaciado y forma

**Escala de espaciado.** Base de 4 px. Valores en uso: 4 · 6 · 8 · 10 · 12 · 14 · 16 · 18 · 24 · 28 · 34.
- Los `gap` de 8–14 px se usan dentro de componentes.
- Los márgenes de 22–28 px se usan entre paneles.
- El padding de paneles es fluido: `clamp(20px, 3vw, 30px)`.

Para E2 se agregarán a `:root` estos tokens de espaciado (ticket de frontend). La UI nueva los usa en lugar de números sueltos:

| Token | Valor |
|---|---|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 24px |
| `--space-6` | 32px |

**Radios.**

| Token | Valor | Uso |
|---|---|---|
| `--radius-sm` | 8px | Botones e inputs |
| `--radius-md` | 12px | Elementos medianos |
| `--radius-lg` | 18px | Paneles y tarjetas |
| `--radius-xl` | 24px | Hero |
| `999px` | — | Píldoras y barras |

**Contenedor.** `--container-width: 1280px`, con márgenes laterales `max(5vw, …)`.

**Profundidad.**
- Paneles con gradiente `145deg` entre tonos de `--bg-card`.
- Sombra suave `0 24px 70px rgba(0,0,0,.22)` en formularios.
- Glow púrpura en el botón primario.

**Breakpoints.** 1000 · 820 · 760 · 540 · 360 px (desktop first, con `max-width`).

---

## 5. Componentes

| Componente | Clase | Reglas |
|---|---|---|
| Botón primario | `.boton` | Gradiente púrpura, texto blanco, mínimo 42 px de alto. En hover sube 2 px y aumenta el glow. Uno por bloque |
| Botón secundario | `.button-secondary` | Fondo translúcido y borde sutil; en hover, borde púrpura. Para «Editar» y «Cancelar» |
| Botón discreto | `.button-quiet` | Transparente. Para acciones terciarias |
| Botón destructivo | `.boton-eliminar` | Coral translúcido, 36 px de alto. Siempre con confirmación |
| Panel | `.panel` + `.section-title` | Contenedor de cada sección del detalle. La sección «Progreso semanal» usa este patrón |
| Estadística | `.resumen-grid` + `.estadistica` | Etiqueta pequeña (`.stat-label` con símbolo) y cifra grande. El color se alterna por posición (lima, naranja, cian, rosa). Para horas, días y rachas |
| Barra de progreso | `.progress-track` + `.progress-fill` | Siempre con `role="progressbar"` y `aria-valuemin`, `aria-valuemax`, `aria-valuenow` y `aria-label` |
| Etiqueta de estado | `.etiqueta` + `.status-*` | Píldora de 0.7rem con la inicial en mayúscula |
| Formulario | `.formulario` | Máximo 720 px de ancho. Cada `label` está asociada con `htmlFor`. Inputs de 44 px con fondo `#0c1220` y borde púrpura al enfocar. Acciones en `.acciones-formulario` |
| Lista editable | `.fila-logro` + `.lista-logros` | Patrón de los logros; se reutiliza para los hitos de una meta (máximo 5) |
| Carga | `.loading-pulse` con `role="status"` | Shimmer de 160 px. Nunca una pantalla en blanco |
| Vacío | `.empty-state` | Título, una frase y una acción primaria (por ejemplo «Sin meta activa → Crear meta») |
| Error | `.state-panel[role="alert"]` o `.mensaje-error` | Borde y texto coral claro (`#ffc1ce`), con el mensaje del backend y una opción para reintentar |

**Patrón para E2.** La sección «Progreso semanal» va dentro de un `.panel` y contiene:
1. Una barra de horas frente a la meta.
2. Estadísticas: días jugados frente a días objetivo, racha actual y mejor racha.
3. Una lista de hitos. Cada hito alcanzado lleva el check «✓» y el texto «Alcanzado» en lima; los pendientes van en `--text-secondary`.

---

## 6. Tono de los textos

- Español neutro, tuteo y frases cortas. Ejemplos: «Registra una sesión para actualizar tu progreso.»
- Gamer pero claro: se permiten términos como «racha», «hito», «sesión» y «biblioteca», sin jerga en inglés en los botones.
- Los botones empiezan con un verbo: «Crear meta», «Guardar cambios», «Desactivar meta», «Intentar de nuevo».
- Estados vacíos en positivo y con una invitación a actuar: «Aún no tienes una meta para este juego. Crea una para seguir tu semana.»
- Errores sin culpa, con qué pasó y qué hacer: «No se pudo cargar el progreso. Intenta de nuevo.»
- Las confirmaciones destructivas nombran el objeto: «¿Desactivar la meta de Hades?»
- Los números van con su unidad: «3,5 h», «4 días», «70 %».
- Los eyebrows de hero van en mayúsculas con separador «·».

---

## 7. Accesibilidad

**Contraste medido** (WCAG 2.1):

| Combinación | Contraste | Resultado |
|---|---|---|
| `--text-primary` sobre `--bg-primary` | 18.4:1 | Cumple |
| `--text-secondary` sobre `--bg-card` | 7.7:1 | Cumple |
| lima sobre `--bg-card` | 14.9:1 | Cumple |
| blanco sobre `#7028e8` | 6.7:1 | Cumple |
| `--text-muted` sobre `--bg-card` | 4.2:1 | **No cumple AA** para texto normal |

**Reglas**
- `--text-muted` sobre tarjetas solo se usa en texto de 18 px o más o en texto decorativo. Para texto informativo se usa `--text-secondary`.
- **Foco visible:** contorno lima de 2 px con 3 px de separación (`:focus-visible`). No se elimina nunca; los inputs del formulario lo sustituyen por un anillo púrpura.
- **El color nunca es el único indicador.** Un hito alcanzado lleva texto o ícono además del color, y el estado de un juego siempre lleva su nombre.
- **ARIA:** las barras de progreso usan `role="progressbar"` con sus valores; las cargas, `role="status"`; los errores, `role="alert"`; la decoración, `aria-hidden="true"`.
- **Movimiento:** se respeta `prefers-reduced-motion`, que ya desactiva animaciones y transiciones.
- **Zonas táctiles:** mínimo 36–44 px de alto. Todo funciona desde 320 px de ancho sin scroll horizontal.
- **Teclado:** los formularios se pueden completar con teclado y las confirmaciones usan un diálogo nativo o accesible.

---

## 8. Librerías autorizadas

- **Autorizadas:** React, React Router y Google Fonts (Inter y Space Grotesk).
- Íconos: SVG inline propios o símbolos Unicode decorativos.
- **No autorizadas:** cualquier librería de UI, de componentes, de CSS-in-JS o de gráficos (MUI, Chakra, Tailwind, Bootstrap, styled-components, Chart.js, etc.).

---

## 9. No hacemos

- No usamos modo claro ni fondos blancos.
- No escribimos colores en hexadecimal en CSS nuevo: se usan variables de `:root` (los hex sueltos que ya existen son deuda conocida).
- No usamos más de un botón primario por bloque, ni acentos lima y coral juntos en el mismo elemento.
- No usamos gráficos históricos, rankings ni notificaciones (están fuera del alcance de E2).
- No mostramos la información solo con color, emojis o símbolos sin texto.
- No agregamos animaciones que ignoren `prefers-reduced-motion` ni efectos de parpadeo.
- No usamos imágenes externas ni portadas descargadas: las portadas son SVG y gradientes locales.
- No ponemos texto en inglés en la interfaz (salvo los rótulos decorativos del HUD, que son `aria-hidden`).
- No dejamos pantallas sin estado de carga, error o vacío.

---

## 10. Deuda visual conocida (no se corrige en esta fase)

- Hay unos 64 colores hexadecimales sueltos en `index.css`. Además hay clases duplicadas: `.estado-*` frente a `.status-*`, y `.boton-secundario` frente a `.button-secondary`.
- El espaciado todavía no tiene tokens; se agregan con E2.
- `frontend/index.html` tiene `lang="en"` y `<title>frontend</title>`, lo que afecta a los lectores de pantalla y al SEO.
