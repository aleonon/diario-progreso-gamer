// Modelo Meta de E2 (spec backend §4, RB-02, RB-03, RB-04).
// La meta se referencia desde el videojuego (no se embebe) porque tiene su propio ciclo de vida
// y conserva un historial; los hitos se embeben porque son una lista corta que solo existe dentro de su meta.
// El estado "alcanzado" de un hito no se guarda: se calcula en el dominio (RB-27).
import { Schema, model, type InferSchemaType } from "mongoose";

import { MAX_HITOS } from "../types/meta.types.js";

const hitoSchema = new Schema({
  descripcion: {
    type: String,
    required: [true, "Cada hito necesita una descripción"],
    trim: true
  },
  porcentajeObjetivo: {
    type: Number,
    required: true,
    min: [1, "El porcentaje objetivo de cada hito debe estar entre 1 y 100"],
    max: [100, "El porcentaje objetivo de cada hito debe estar entre 1 y 100"]
  }
});

const metaSchema = new Schema(
  {
    videojuego: {
      type: Schema.Types.ObjectId,
      ref: "Videojuego",
      required: true
    },

    horasSemanales: {
      type: Number,
      required: true,
      validate: {
        validator: (valor: number) => Number.isFinite(valor) && valor > 0 && valor <= 100,
        message: "Las horas semanales deben ser un número mayor que 0 y como máximo 100"
      }
    },

    diasPorSemana: {
      type: Number,
      required: true,
      min: [1, "Los días por semana deben ser un número entero entre 1 y 7"],
      max: [7, "Los días por semana deben ser un número entero entre 1 y 7"],
      validate: {
        validator: Number.isInteger,
        message: "Los días por semana deben ser un número entero entre 1 y 7"
      }
    },

    activa: {
      type: Boolean,
      default: true
    },

    hitos: {
      type: [hitoSchema],
      default: [],
      validate: {
        validator: (hitos: unknown[]) => hitos.length <= MAX_HITOS,
        message: "Una meta puede tener como máximo 5 hitos"
      }
    }
  },
  {
    timestamps: true
  }
);

// RB-02 · Como máximo una meta activa por videojuego, también ante escrituras simultáneas:
// el índice solo incluye documentos con activa: true, así que las metas desactivadas
// (historial) no cuentan. Una segunda escritura activa falla con el código 11000.
metaSchema.index(
  { videojuego: 1 },
  {
    unique: true,
    partialFilterExpression: { activa: true },
    name: "una_meta_activa_por_videojuego"
  }
);

// Listado de metas de un videojuego (RB-09).
metaSchema.index({ videojuego: 1, createdAt: -1 });

export type MetaDocumento = InferSchemaType<typeof metaSchema>;

export const Meta = model("Meta", metaSchema, "metas");
