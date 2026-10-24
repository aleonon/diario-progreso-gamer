
import type {
    Request,
    Response,
    NextFunction
} from "express";

import mongoose from "mongoose";

import {
    IdInvalido,
    VideojuegoNoEncontrado
} from "../services/videojuegos.service.js";

import {
    DatosPartidaInvalidos,
    PartidaNoEncontrada
} from "../services/partidas.service.js";

import {
    VideojuegoConPartidas
} from "../services/videojuegos.service.js";

export const errorHandler = (
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    if (error instanceof IdInvalido) {
        res.status(400).json({
            mensaje: error.message
        });
        return;
    }

    if (error instanceof VideojuegoNoEncontrado) {
        res.status(404).json({
            mensaje: error.message
        });
        return;
    }

    if (
        error instanceof mongoose.Error.ValidationError ||
        error instanceof mongoose.Error.CastError
    ) {
        res.status(400).json({
            mensaje: "Datos inválidos",
            detalle: error.message
        });
        return;
    }

    console.error("Error inesperado:", error);

    if (error instanceof PartidaNoEncontrada) {
        res.status(404).json({
            mensaje: error.message
        });
        return;
    }

    if (error instanceof VideojuegoConPartidas) {
        res.status(409).json({
            mensaje: error.message
        });
        return;
    }

    if (error instanceof DatosPartidaInvalidos) {
        res.status(400).json({
            mensaje: error.message
        });
        return;
    }

    res.status(500).json({
        mensaje: "Error interno del servidor"
    });
};

