
import type {
  Request,
  Response,
  NextFunction
} from "express";

import mongoose from "mongoose";

import {
  SolicitudInvalida,
  RecursoNoEncontrado,
  Conflicto,
  MetaActivaDuplicada
} from "../errors/index.js";

const esClaveDuplicada = (error: unknown): boolean =>
  typeof error === "object" && error !== null && "code" in error && error.code === 11000;

// T-05 · El código HTTP se decide por la categoría del error (spec backend RB-33),
// no por cada clase concreta. Forma de respuesta: { mensaje, requestId } (RB-36).
export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const requestId = res.locals.requestId;

  const responder = (status: number, mensaje: string) => {
    res.status(status).json({ mensaje, requestId });
  };

  // 400 · Datos o identificadores inválidos
  if (
    error instanceof SolicitudInvalida ||
    error instanceof mongoose.Error.ValidationError ||
    error instanceof mongoose.Error.CastError ||
    (error instanceof SyntaxError && "body" in error)
  ) {
    responder(400, error.message);
    return;
  }

  // 404 · Recursos inexistentes
  if (error instanceof RecursoNoEncontrado) {
    responder(404, error.message);
    return;
  }

  // 409 · Conflictos con el estado actual (integridad referencial, metas activas…)
  if (error instanceof Conflicto) {
    responder(409, error.message);
    return;
  }

  // 409 · Defensa (RB-02): el único índice único de la app es el de una meta activa
  // por videojuego. El servicio ya convierte el 11000; esto cubre cualquier escritura futura.
  if (esClaveDuplicada(error)) {
    responder(409, new MetaActivaDuplicada().message);
    return;
  }

  // 500 · Error inesperado: se registra completo, pero no se expone (RB-35)
  console.error(
    `[${requestId}] Error inesperado:`,
    error
  );

  responder(500, "Error interno del servidor");
};
