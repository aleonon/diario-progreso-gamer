
import type {
  Request,
  Response,
  NextFunction
} from "express";

import mongoose from "mongoose";

import {
  IdInvalido,
  VideojuegoNoEncontrado,
  VideojuegoConPartidas,
  LogroNoEncontrado,
  DatosLogroInvalidos
} from "../services/videojuegos.service.js";

import {
  PartidaNoEncontrada,
  DatosPartidaInvalidos
} from "../services/partidas.service.js";

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const requestId = res.locals.requestId;

  // ID con formato inválido
  if (error instanceof IdInvalido) {
    res.status(400).json({
      mensaje: error.message,
      requestId
    });
    return;
  }

  // Validaciones de datos
  if (
    error instanceof DatosPartidaInvalidos ||
    error instanceof DatosLogroInvalidos ||
    error instanceof mongoose.Error.ValidationError ||
    error instanceof mongoose.Error.CastError ||
    error instanceof SyntaxError &&
      "body" in error
  ) {
    res.status(400).json({
      mensaje: error instanceof Error
        ? error.message
        : "Solicitud inválida",
      requestId
    });
    return;
  }

  // Recursos inexistentes
  if (
    error instanceof VideojuegoNoEncontrado ||
    error instanceof PartidaNoEncontrada ||
    error instanceof LogroNoEncontrado
  ) {
    res.status(404).json({
      mensaje: error.message,
      requestId
    });
    return;
  }

  // Integridad referencial
  if (error instanceof VideojuegoConPartidas) {
    res.status(409).json({
      mensaje: error.message,
      requestId
    });
    return;
  }

  // Error inesperado
  console.error(
    `[${requestId}] Error inesperado:`,
    error
  );

  res.status(500).json({
    mensaje: "Error interno del servidor",
    requestId
  });
};

