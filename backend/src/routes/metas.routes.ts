// Rutas de metas por su propio id (spec backend TD-01).
// Crear y listar van anidadas bajo el videojuego, en videojuegos.routes.ts.
import { Router } from "express";

import * as controller from "../controllers/metas.controller.js";

const router = Router();

router.get("/:metaId", controller.obtener);

router.put("/:metaId", controller.actualizar);

router.patch("/:metaId/desactivar", controller.desactivar);

export default router;
