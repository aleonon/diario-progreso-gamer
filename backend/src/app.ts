//Ruta TEMPORAL que comprueba el funcionamiento de EXPRESS

//express -> servidor y rutas HTTP
import express from "express";
//Cors -> comunicación con el frontend
import cors from "cors";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({
    mensaje: "API Diario Gamer funcionando"
  });
});

export default app;
