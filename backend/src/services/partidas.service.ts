
import mongoose from "mongoose";

import { Partida } from "../models/partida.js";
import { Videojuego } from "../models/videojuego.js";

import {
    IdInvalido,
    VideojuegoNoEncontrado
} from "./videojuegos.service.js";


import type {
    CrearPartidaDTO
} from "../types/partida.types.js";


// Error específico para partidas
export class PartidaNoEncontrada extends Error {
    constructor() {
        super("Partida no encontrada");
        this.name = "PartidaNoEncontrada";
    }
}

// Validar ID
const validarId = (id: string) => {
    if (!mongoose.isObjectIdOrHexString(id)) {
        throw new IdInvalido();
    }
};

export class DatosPartidaInvalidos extends Error {
    constructor(mensaje: string) {
        super(mensaje);
        this.name = "DatosPartidaInvalidos";
    }
}

// GET: todas las partidas
export const listarPartidas = async () => {
    return await Partida.find()
        .populate("videojuego")
        .sort({ fecha: -1 });
};

// POST: crear partida

export const crearPartida = async (
    datos: unknown
) => {

    // 1. Validar el cuerpo recibido
    const datosValidados = validarDatosPartida(datos);

    // 2. Comprobar la referencia al videojuego
    const videojuego = await Videojuego.findById(
        datosValidados.videojuego
    );

    if (!videojuego) {
        throw new VideojuegoNoEncontrado();
    }

    // 3. Guardar únicamente los campos validados
    const partida = await Partida.create(datosValidados);

    return partida;
};


// GET: partidas de un videojuego
export const partidasPorVideojuego = async (
    videojuegoId: string
) => {
    validarId(videojuegoId);

    const existe = await Videojuego.exists({
        _id: videojuegoId
    });

    if (!existe) {
        throw new VideojuegoNoEncontrado();
    }

    return await Partida.find({
        videojuego: videojuegoId
    }).sort({ fecha: -1, _id: -1 });
};

// DELETE: eliminar partida
export const eliminarPartida = async (
    id: string
) => {
    validarId(id);

    const partida = await Partida.findByIdAndDelete(id);

    if (!partida) {
        throw new PartidaNoEncontrada();
    }

    return partida;
};


export const validarDatosPartida = (
    datos: unknown
): CrearPartidaDTO => {

    if (
        typeof datos !== "object" ||
        datos === null ||
        Array.isArray(datos)
    ) {
        throw new DatosPartidaInvalidos(
            "El cuerpo debe ser un objeto JSON"
        );
    }

    const entrada = datos as Record<string, unknown>;

    const camposPermitidos = [
        "videojuego",
        "fecha",
        "duracionMinutos",
        "porcentajeAvance"
    ];

    // Rechazar campos desconocidos
    const camposExtra = Object.keys(entrada).filter(
        campo => !camposPermitidos.includes(campo)
    );

    if (camposExtra.length > 0) {
        throw new DatosPartidaInvalidos(
            `Campos no permitidos: ${camposExtra.join(", ")}`
        );
    }

    // Validar referencia
    if (
        typeof entrada.videojuego !== "string" ||
        !mongoose.isObjectIdOrHexString(entrada.videojuego)
    ) {
        throw new IdInvalido();
    }

    // Validar fecha ISO YYYY-MM-DD
    if (
        typeof entrada.fecha !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(entrada.fecha)
    ) {
        throw new DatosPartidaInvalidos(
            "La fecha debe tener formato YYYY-MM-DD"
        );
    }

    const fecha = new Date(
        `${entrada.fecha}T00:00:00.000Z`
    );

    if (
        !Number.isFinite(fecha.getTime()) ||
        fecha.toISOString().slice(0, 10) !== entrada.fecha
    ) {
        throw new DatosPartidaInvalidos(
            "La fecha proporcionada no existe"
        );
    }

    // Validar duración
    if (
        typeof entrada.duracionMinutos !== "number" ||
        !Number.isFinite(entrada.duracionMinutos) ||
        !Number.isInteger(entrada.duracionMinutos) ||
        entrada.duracionMinutos < 1
    ) {
        throw new DatosPartidaInvalidos(
            "La duración debe ser un número entero mayor o igual a 1"
        );
    }

    // Validar avance
    if (
        typeof entrada.porcentajeAvance !== "number" ||
        !Number.isFinite(entrada.porcentajeAvance) ||
        entrada.porcentajeAvance < 0 ||
        entrada.porcentajeAvance > 100
    ) {
        throw new DatosPartidaInvalidos(
            "El avance debe estar entre 0 y 100"
        );
    }

    return {
        videojuego: entrada.videojuego,
        fecha: entrada.fecha,
        duracionMinutos: entrada.duracionMinutos,
        porcentajeAvance: entrada.porcentajeAvance
    };
};
