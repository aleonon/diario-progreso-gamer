// Controlador de metas · E2 (spec backend §5, H-1 a H-5).
// Solo traduce HTTP ↔ servicio; los errores pasan a errorHandler con next(error).
import type {
  Request,
  Response,
  NextFunction
} from "express";

import * as service from "../services/metas.service.js";

// POST /api/videojuegos/:id/metas · T-14
export const crear = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const meta = await service.crearMeta(String(req.params.id), req.body);

    res.status(201).json(meta);
  } catch (error) {
    next(error);
  }
};

// GET /api/videojuegos/:id/metas · T-15
export const listarPorVideojuego = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const metas = await service.listarMetas(String(req.params.id));

    res.status(200).json(metas);
  } catch (error) {
    next(error);
  }
};

// GET /api/metas/:metaId · T-15
export const obtener = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const meta = await service.obtenerMeta(String(req.params.metaId));

    res.status(200).json(meta);
  } catch (error) {
    next(error);
  }
};

// PUT /api/metas/:metaId · T-16
export const actualizar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const meta = await service.editarMeta(String(req.params.metaId), req.body);

    res.status(200).json(meta);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/metas/:metaId/desactivar · T-17
export const desactivar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const meta = await service.desactivarMeta(String(req.params.metaId));

    res.status(200).json(meta);
  } catch (error) {
    next(error);
  }
};
