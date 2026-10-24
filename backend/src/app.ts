
import express from "express";
import cors from "cors";

import videojuegosRoutes from "./routes/videojuegos.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get("/", (_req, res) => {
  res.json({
    mensaje: "API Diario Gamer funcionando"
  });
});

// Rutas de videojuegos
app.use("/api/videojuegos", videojuegosRoutes);

// Middleware de errores: siempre al final
app.use(errorHandler);

export default app;
