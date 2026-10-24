
import mongoose from "mongoose";

import { Partida } from "../models/partida.js";
import { Videojuego } from "../models/videojuego.js";

import {
  IdInvalido,
  VideojuegoNoEncontrado
} from "./videojuegos.service.js";

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

// GET: todas las partidas
export const listarPartidas = async () => {
  return await Partida.find()
    .populate("videojuego")
    .sort({ fecha: -1 });
};

// POST: crear partida
export const crearPartida = async (
  datos: Record<string, unknown>
) => {
  const id = datos.videojuego;

  if (
    typeof id !== "string" ||
    !mongoose.isObjectIdOrHexString(id)
  ) {
    throw new IdInvalido();
  }

  const videojuego = await Videojuego.findById(id);

  if (!videojuego) {
    throw new VideojuegoNoEncontrado();
  }

  return await Partida.create(datos);
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
