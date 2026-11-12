---
name: nueva-spec
description: Crea una spec SDD nueva en docs/specs/ a partir del PRD y del backlog de E2, con reglas DEBE / NO DEBE, una tabla criterio → verificación y una tabla ticket → archivos. No escribe código.
argument-hint: "<backend|frontend> <nombre-corto> [tickets, p. ej. T-01 T-02]"
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Write
---

# /nueva-spec

Crea una spec nueva (argumentos recibidos: `$ARGUMENTS`) siguiendo la cadena SDD del proyecto. **Esta skill solo produce documentación: no toca `backend/` ni `frontend/`.**

## Argumentos

`$ARGUMENTS` debe traer:
1. La capa: `backend` o `frontend`.
2. Un nombre corto en kebab-case, por ejemplo `metas-progreso`.
3. Opcionalmente, los tickets que cubre, por ejemplo `T-01 T-02 T-03`.

Si falta la capa o el nombre, pregunta y no continúes.

El archivo se llama `docs/specs/<capa>-<nombre>.md`. Si ya existe, no lo sobrescribas: muestra las diferencias que propones y pide confirmación.

## Pasos

1. Lee `AGENTS.md` y `docs/diagnostico.md`.
2. Lee el PRD (`docs/prd/`) y el backlog (`docs/backlog/E2-metas-y-rachas.md`). Si no existen, detente y avisa: la cadena SDD exige PRD y backlog antes de la spec.
3. Si la capa es `frontend`, lee también `DESIGN.md`.
4. Reúne de esos documentos las historias, los criterios DADO / CUANDO / ENTONCES y los tickets que cubre la spec. Copia sus IDs tal cual: **no inventes criterios, reglas ni tickets**. Si encuentras un hueco, regístralo en «Puntos abiertos».
5. Lee el código existente solo para nombrar archivos reales en la tabla ticket → archivos. **Nunca abras `.env`.**
6. Escribe la spec usando la plantilla [plantilla.md](plantilla.md), completando todas las secciones.
7. Verifica antes de terminar:
   - Cada criterio del backlog aparece en la tabla criterio → verificación.
   - Cada criterio que se puede verificar sin base de datos tiene un test unitario de dominio asignado.
   - Cada ticket aparece en la tabla ticket → archivos.
   - Las reglas usan DEBE / NO DEBE en mayúsculas y cada una es comprobable.
8. Responde con la ruta creada, el número de criterios y tickets cubiertos y los puntos abiertos.
9. Recuerda a la persona que debe **commitear la spec antes que el código**, con el mensaje `docs(E2): spec <capa> <nombre>`. No hagas el commit tú.
