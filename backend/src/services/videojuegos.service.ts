
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

  const videojuego =
    await Videojuego.findByIdAndDelete(id);

  if (!videojuego) {
    throw new VideojuegoNoEncontrado();
  }

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
