// Controlador del progreso semanal · E2 · T-18 (spec backend §5 H-6).
import type {
  Request,
  Response,
  NextFunction
} from "express";

import * as service from "../services/progreso.service.js";

// GET /api/videojuegos/:id/progreso-semanal
export const obtener = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const progreso = await service.obtenerProgresoSemanal(String(req.params.id));

    res.status(200).json(progreso);
  } catch (error) {
    next(error);
  }
};
