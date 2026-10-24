
import type {
  Request,
  Response,
  NextFunction
} from "express";

import * as service from "../services/partidas.service.js";

// GET /api/partidas
export const listar = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const partidas = await service.listarPartidas();

    res.status(200).json(partidas);
  } catch (error) {
    next(error);
  }
};

// POST /api/partidas
export const crear = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const partida = await service.crearPartida(req.body);

    res.status(201).json(partida);
  } catch (error) {
    next(error);
  }
};

// GET /api/videojuegos/:id/partidas
export const listarPorVideojuego = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const partidas =
      await service.partidasPorVideojuego(
        String(req.params.id)
      );

    res.status(200).json(partidas);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/partidas/:id
export const eliminar = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await service.eliminarPartida(
      String(req.params.id)
    );

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
