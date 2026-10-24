
import mongoose from "mongoose";
//por el formato en from "../" son dos puntos, no tres
import { Videojuego } from "../models/videojuego.js";
import { Partida } from "../models/partida.js";


export class VideojuegoNoEncontrado extends Error {
    constructor() {
        super("Videojuego no encontrado");
        this.name = "VideojuegoNoEncontrado";
    }
}

export class IdInvalido extends Error {
    constructor() {
        super("El ID proporcionado no es válido");
        this.name = "IdInvalido";
    }
}

export class VideojuegoConPartidas extends Error {
    constructor() {
        super(
            "No se puede eliminar el videojuego porque tiene partidas registradas"
        );
        this.name = "VideojuegoConPartidas";
    }
}

export class LogroNoEncontrado extends Error {
    constructor() {
        super("Logro no encontrado");
        this.name = "LogroNoEncontrado";
    }
}

export class DatosLogroInvalidos extends Error {
  constructor() {
    super(
      "El campo obtenido debe ser verdadero o falso"
    );
    this.name = "DatosLogroInvalidos";
  }
}

const validarId = (id: string) => {
    if (!mongoose.isObjectIdOrHexString(id)) {
        throw new IdInvalido();
    }
};

// CREATE
export const crearVideojuego = async (
    datos: Record<string, unknown>
) => {
    return await Videojuego.create(datos);
};

// Restricción del parámetro estado
export type EstadoVideojuego =
    | "jugando"
    | "pausado"
    | "completado"
    | "abandonado";

// READ ALL
export const listarVideojuegos = async (
    estado?: EstadoVideojuego
) => {
    if (estado) {
        return await Videojuego.find({ estado });
    }

    return await Videojuego.find({});
};


// READ ONE
export const obtenerVideojuego = async (
    id: string
) => {
    validarId(id);

    const videojuego = await Videojuego.findById(id);

    if (!videojuego) {
        throw new VideojuegoNoEncontrado();
    }

    return videojuego;
};

// UPDATE
export const actualizarVideojuego = async (
    id: string,
    datos: Record<string, unknown>
) => {
    validarId(id);

    const videojuego =
        await Videojuego.findByIdAndUpdate(
            id,
            datos,
            {
                new: true,
                runValidators: true
            }
        );

    if (!videojuego) {
        throw new VideojuegoNoEncontrado();
    }

    return videojuego;
};

// DELETE
export const eliminarVideojuego = async (
    id: string
) => {
    validarId(id);

    // 1. Verificar que exista el videojuego
    const videojuego = await Videojuego.findById(id);

    if (!videojuego) {
        throw new VideojuegoNoEncontrado();
    }

    // 2. Comprobar si tiene partidas registradas
    const tienePartidas = await Partida.exists({
        videojuego: id
    });

    if (tienePartidas) {
        throw new VideojuegoConPartidas();
    }

    // 3. Eliminar solamente si no tiene partidas
    await videojuego.deleteOne();

    return videojuego;
};


// GET: resumen de progreso
export const calcularResumen = async (
    videojuegoId: string
) => {
    validarId(videojuegoId);

    // Comprobar que el videojuego exista
    const videojuego = await Videojuego.findById(
        videojuegoId
    );

    if (!videojuego) {
        throw new VideojuegoNoEncontrado();
    }

    // Obtener las sesiones de la más nueva a la más antigua
    const partidas = await Partida.find({
        videojuego: videojuegoId
    }).sort({ fecha: -1, _id: -1 });

    // Cantidad total
    const cantidadPartidas = partidas.length;

    // Sumar minutos de todas las sesiones
    const minutosTotales = partidas.reduce(
        (total, partida) =>
            total + partida.duracionMinutos,
        0
    );

    const horasTotales = minutosTotales / 60;

    // La primera partida es la más reciente
    const ultimaPartida = partidas[0];

    return {
        videojuegoId,
        cantidadPartidas,
        horasTotales,
        ultimaSesion: ultimaPartida?.fecha ?? null,
        porcentajeAvance:
            ultimaPartida?.porcentajeAvance ?? 0
    };
};

//ACTUALIZAR LOGRO

export const actualizarLogro = async (
    videojuegoId: string,
    logroId: string,
    obtenido: unknown
) => {
    // Validar identificadores
    validarId(videojuegoId);
    validarId(logroId);

    // Solo aceptamos un valor booleano
    if (typeof obtenido !== "boolean") {
        throw new DatosLogroInvalidos();
    }

    // Comprobar que exista el videojuego
    const videojuego = await Videojuego.findById(
        videojuegoId
    );

    if (!videojuego) {
        throw new VideojuegoNoEncontrado();
    }

    // Actualizar exclusivamente el logro indicado
    const actualizado = await Videojuego.findOneAndUpdate(
        {
            _id: videojuegoId,
            "logros._id": logroId
        },
        {
            $set: {
                "logros.$.obtenido": obtenido
            }
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!actualizado) {
        throw new LogroNoEncontrado();
    }

    return actualizado;
};

