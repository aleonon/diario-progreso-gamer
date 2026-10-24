//esquema de datos en base a la referencia de la asignación :p
import { Schema, model } from "mongoose";

const logroSchema = new Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  obtenido: {
    type: Boolean,
    default: false
  }
});

const videojuegoSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true
    },

    plataforma: {
      type: String,
      required: true,
      enum: [
        "PC",
        "PlayStation",
        "Xbox",
        "Switch",
        "Movil"
      ]
    },

    genero: {
      type: String,
      required: true,
      enum: [
        "accion",
        "rol",
        "estrategia",
        "puzzle",
        "deportes",
        "otro"
      ]
    },

    estado: {
      type: String,
      required: true,
      enum: [
        "jugando",
        "pausado",
        "completado",
        "abandonado"
      ],
      default: "jugando"
    },

    logros: {
      type: [logroSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

export const Videojuego = model(
  "Videojuego",
  videojuegoSchema
);
