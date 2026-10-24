
import mongoose from "mongoose";
//por el formato en from "../" son dos puntos, no tres
import { Videojuego } from "../models/videojuego.js";

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
