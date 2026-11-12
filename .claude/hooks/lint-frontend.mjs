#!/usr/bin/env node
// Hook PostToolUse: después de editar un .ts/.tsx de frontend/src,
// ejecuta oxlint (ya instalado en frontend) solo sobre ese archivo.
// - Errores de lint → salida 2: el agente recibe el informe y debe corregir.
// - Solo avisos     → se devuelven como contexto adicional, sin bloquear.
// - Sin oxlint o archivo ajeno al frontend → no hace nada.

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

let entrada = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (trozo) => (entrada += trozo));
process.stdin.on("end", () => {
  let datos;
  try {
    datos = JSON.parse(entrada);
  } catch {
    process.exit(0);
  }

  const archivo = datos.tool_input?.file_path;
  const raiz = process.env.CLAUDE_PROJECT_DIR ?? datos.cwd ?? process.cwd();
  const frontend = path.join(raiz, "frontend");

  if (
    typeof archivo !== "string" ||
    !/\.(ts|tsx)$/.test(archivo) ||
    !path.resolve(archivo).startsWith(path.join(frontend, "src") + path.sep)
  ) {
    process.exit(0);
  }

  const oxlint = path.join(frontend, "node_modules", ".bin", "oxlint");
  if (!existsSync(oxlint)) process.exit(0);

  const resultado = spawnSync(oxlint, [path.relative(frontend, path.resolve(archivo))], {
    cwd: frontend,
    encoding: "utf8"
  });
  const informe = `${resultado.stdout ?? ""}${resultado.stderr ?? ""}`.trim();

  if (resultado.status !== 0) {
    process.stderr.write(`oxlint encontró errores en ${path.basename(archivo)}:\n${informe}\n`);
    process.exit(2);
  }

  if (/warning/i.test(informe)) {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PostToolUse",
          additionalContext: `oxlint (avisos) en ${path.basename(archivo)}:\n${informe}`
        }
      })
    );
  }

  process.exit(0);
});
