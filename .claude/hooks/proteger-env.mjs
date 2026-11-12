#!/usr/bin/env node
// Hook PreToolUse: bloquea cualquier lectura o edición de archivos .env.
// Permite .env.example, que se versiona sin secretos.
// Salida 2 = bloquear la herramienta; el mensaje de stderr llega al agente.

const PERMITIDOS = /\.env\.example$/;

const esArchivoEnv = (ruta) => {
  if (typeof ruta !== "string" || ruta.length === 0) return false;
  const nombre = ruta.split(/[\\/]/).pop() ?? "";
  return /^\.env/.test(nombre) && !PERMITIDOS.test(nombre);
};

// Busca tokens que empiecen por ".env" precedidos por un separador
// (espacio, comilla, barra, =, :, <, >, paréntesis o inicio de línea).
// Así no se bloquea "process.env" ni "import.meta.env".
const comandoTocaEnv = (comando) => {
  if (typeof comando !== "string") return false;
  const patron = /(?:^|[\s'"=\/:<>(])(\.env[\w.*-]*)/g;
  for (const coincidencia of comando.matchAll(patron)) {
    if (!PERMITIDOS.test(coincidencia[1])) return true;
  }
  return false;
};

let entrada = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (trozo) => (entrada += trozo));
process.stdin.on("end", () => {
  let datos;
  try {
    datos = JSON.parse(entrada);
  } catch {
    process.exit(0); // Sin JSON válido no hay nada que inspeccionar.
  }

  const herramienta = datos.tool_name ?? "";
  const params = datos.tool_input ?? {};

  const rutas = [params.file_path, params.path, params.notebook_path, params.pattern, params.glob];
  const bloquear =
    rutas.some(esArchivoEnv) ||
    (herramienta === "Bash" && comandoTocaEnv(params.command));

  if (bloquear) {
    process.stderr.write(
      `Bloqueado por el harness (AGENTS.md, regla 1): ${herramienta} intentó acceder a un archivo .env. ` +
        "Nunca se lee ni se modifica .env; usa .env.example para documentar variables sin secretos.\n"
    );
    process.exit(2);
  }

  process.exit(0);
});
