# Spec <capa> · <Título>

- **Épica:** E2 · Metas y rachas
- **Historias:** HU-xx, HU-yy
- **Tickets:** T-xx, T-yy
- **Estado:** borrador | aprobada | implementada | auditada
- **Fuentes:** `docs/prd/…`, `docs/backlog/E2-metas-y-rachas.md`, `DESIGN.md` (solo para frontend)

## 1. Objetivo

Una o dos frases sobre qué resuelve la spec y para quién.

## 2. Alcance

- **Incluye:** …
- **No incluye:** …

## 3. Reglas

### DEBE

- **R-01** El sistema DEBE …
- **R-02** …

### NO DEBE

- **R-10** El sistema NO DEBE …

## 4. Contrato

- **Backend:** método, ruta, cuerpo, respuesta de ejemplo y códigos 400/404/409/500 con su mensaje.
- **Frontend:** pantalla o componente, datos que consume, estados de carga, error y vacío, y textos visibles.

## 5. Casos borde y decisiones aplicadas

| Hueco o decisión del PRD | Regla de esta spec | Ejemplo concreto |
|---|---|---|
| … | R-0x | … |

## 6. Criterio → verificación

| Criterio (backlog) | Regla | Tipo de verificación | Dónde (test o archivo) | ¿Sin BD? |
|---|---|---|---|---|
| CA-xx.1 | R-01 | Test unitario de dominio | `backend/src/dominio/progreso.test.ts` | Sí |
| CA-xx.2 | R-05 | Test de integración / curl | `…` | No |
| CA-xx.3 | R-07 | Revisión manual contra DESIGN.md | captura | — |

## 7. Ticket → archivos

| Ticket | Tipo | Archivos que crea o modifica |
|---|---|---|
| T-xx | feat | `…` |

## 8. Puntos abiertos

- …
