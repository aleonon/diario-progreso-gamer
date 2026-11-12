import { defineConfig } from "vitest/config";

// T-04 · Infraestructura de tests (spec backend §8, TD-12).
// - Los tests viven en backend/tests/, fuera de src/, así que `npm run build` no los compila.
// - Los tests de API usan MongoDB en memoria (tests/setup/mongo.ts); nunca Atlas ni .env.
export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    // El primer arranque de mongodb-memory-server puede descargar el binario.
    hookTimeout: 120_000,
    testTimeout: 20_000,
    // Los archivos de API comparten una instancia de Mongo por archivo; se ejecutan en serie
    // para que no compitan por puertos ni por el binario en la primera descarga.
    fileParallelism: false
  }
});
