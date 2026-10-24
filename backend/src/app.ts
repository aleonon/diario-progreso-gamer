

import express from "express";
import cors from "cors";

import videojuegosRoutes from "./routes/videojuegos.routes.js";
import partidasRoutes from "./routes/partidas.routes.js";

import { requestId } from "./middlewares/requestId.js";
import { logger } from "./middlewares/logger.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

// 1. Asignar identificador a cada solicitud
app.use(requestId);

// 2. Registrar solicitudes y respuestas
app.use(logger);

// 3. Configurar CORS y JSON

app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json());

// 4. Ruta de comprobación
app.get("/", (_req, res) => {
  res.status(200).json({
    mensaje: "API Diario Gamer funcionando"
  });
});

// 5. Rutas principales
app.use("/api/videojuegos", videojuegosRoutes);
app.use("/api/partidas", partidasRoutes);

// 6. Gestionar rutas inexistentes
app.use((req, res) => {
  res.status(404).json({
    mensaje: "Ruta no encontrada",
    ruta: req.originalUrl,
    requestId: res.locals.requestId
  });
});

// 7. Middleware de errores
app.use(errorHandler);

export default app;
