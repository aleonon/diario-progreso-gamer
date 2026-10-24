//Su única responsabilidad es asociar cada endpoint con un controlador.
import { Router } from "express";
import * as controller from "../controllers/videojuegos.controller.js";
import * as partidasController from "../controllers/partidas.controller.js";


const router = Router();

router.get("/", controller.listar);

router.get("/:id", controller.obtener);

router.post("/", controller.crear);

router.put("/:id", controller.actualizar);

router.delete("/:id", controller.eliminar);

// Partidas asociadas a un videojuego
router.get(
  "/:id/partidas",
  partidasController.listarPorVideojuego
);

// Estadísticas calculadas
router.get(
  "/:id/resumen",
  controller.resumen
);


export default router;
