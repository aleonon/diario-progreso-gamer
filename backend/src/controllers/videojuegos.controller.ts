
import type {
    Request,
    Response,
    NextFunction
} from "express";

import * as service from "../services/videojuegos.service.js";

import type {
    EstadoVideojuego
} from "../services/videojuegos.service.js";


// POST /api/videojuegos
export const crear = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const videojuego =
            await service.crearVideojuego(req.body);

        res.status(201).json(videojuego);
    } catch (error) {
        next(error);
    }
};

// GET /api/videojuegos
export const listar = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const estado = req.query.estado;

        if (
            estado !== undefined &&
            (
                typeof estado !== "string" ||
                ![
                    "jugando",
                    "pausado",
                    "completado",
                    "abandonado"
                ].includes(estado)
            )
        ) {
            res.status(400).json({
                mensaje: "Filtro estado no válido"
            });
            return;
        }

        const videojuegos =
            await service.listarVideojuegos(
                estado as EstadoVideojuego | undefined
            );

        res.status(200).json(videojuegos);
    } catch (error) {
        next(error);
    }
};

// GET /api/videojuegos/:id
export const obtener = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const videojuego =
            await service.obtenerVideojuego(
                String(req.params.id)
            );

        res.status(200).json(videojuego);
    } catch (error) {
        next(error);
    }
};

// PUT /api/videojuegos/:id
export const actualizar = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const videojuego =
            await service.actualizarVideojuego(
                String(req.params.id),
                req.body
            );

        res.status(200).json(videojuego);
    } catch (error) {
        next(error);
    }
};

// DELETE /api/videojuegos/:id
export const eliminar = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        await service.eliminarVideojuego(
            String(req.params.id)
        );

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
