// Servicio de metas · E2 (spec backend §5).
// T-13: validador puro del cuerpo (RB-03, RB-04, RB-07, RB-08).
// T-14 a T-17: crear, consultar, listar, editar y desactivar (H-1 a H-5).
// validarDatosMeta no usa Mongoose (RB-08): solo depende de los tipos compartidos.
import mongoose from "mongoose";

import { Meta } from "../models/meta.js";
import { Videojuego } from "../models/videojuego.js";
import {
  DatosMetaInvalidos,
  IdInvalido,
  MetaActivaDuplicada,
  MetaDesactivada,
  MetaNoEncontrada,
  VideojuegoCerrado,
  VideojuegoNoEncontrado
} from "../errors/index.js";
import { MAX_HITOS, type HitoDTO, type MetaDTO } from "../types/meta.types.js";

const CAMPOS_META = ["horasSemanales", "diasPorSemana", "hitos"];
const CAMPOS_HITO = ["descripcion", "porcentajeObjetivo"];

const MENSAJES = {
  cuerpo: "El cuerpo debe ser un objeto JSON",
  horas: "Las horas semanales deben ser un número mayor que 0 y como máximo 100",
  dias: "Los días por semana deben ser un número entero entre 1 y 7",
  hitosLista: "Los hitos deben ser una lista",
  hitosMaximo: `Una meta puede tener como máximo ${MAX_HITOS} hitos`,
  descripcion: "Cada hito necesita una descripción",
  porcentaje: "El porcentaje objetivo de cada hito debe estar entre 1 y 100"
};

const esObjeto = (valor: unknown): valor is Record<string, unknown> =>
  typeof valor === "object" && valor !== null && !Array.isArray(valor);

const esNumeroFinito = (valor: unknown): valor is number =>
  typeof valor === "number" && Number.isFinite(valor);

const rechazarCamposExtra = (entrada: Record<string, unknown>, permitidos: string[]): void => {
  const extra = Object.keys(entrada).filter((campo) => !permitidos.includes(campo));

  if (extra.length > 0) {
    throw new DatosMetaInvalidos(`Campos no permitidos: ${extra.join(", ")}`);
  }
};

const validarHito = (valor: unknown): HitoDTO => {
  if (!esObjeto(valor)) {
    throw new DatosMetaInvalidos(MENSAJES.descripcion);
  }

  rechazarCamposExtra(valor, CAMPOS_HITO);

  if (typeof valor.descripcion !== "string" || valor.descripcion.trim() === "") {
    throw new DatosMetaInvalidos(MENSAJES.descripcion);
  }

  if (!esNumeroFinito(valor.porcentajeObjetivo) || valor.porcentajeObjetivo < 1 || valor.porcentajeObjetivo > 100) {
    throw new DatosMetaInvalidos(MENSAJES.porcentaje);
  }

  return {
    descripcion: valor.descripcion.trim(),
    porcentajeObjetivo: valor.porcentajeObjetivo
  };
};

/**
 * Valida el cuerpo de creación o edición de una meta y devuelve un objeto nuevo
 * con solo los campos permitidos. Es pura: no usa Mongoose ni Express y no modifica `datos`.
 * - modo "crear": `hitos` es opcional (por defecto []).
 * - modo "editar": `hitos` es obligatorio; `[]` vacía la lista (TD-04).
 */
export function validarDatosMeta(datos: unknown, modo: "crear" | "editar"): MetaDTO {
  if (!esObjeto(datos)) {
    throw new DatosMetaInvalidos(MENSAJES.cuerpo);
  }

  rechazarCamposExtra(datos, CAMPOS_META);

  if (datos.horasSemanales === undefined) {
    throw new DatosMetaInvalidos("Falta el campo horasSemanales");
  }

  if (!esNumeroFinito(datos.horasSemanales) || datos.horasSemanales <= 0 || datos.horasSemanales > 100) {
    throw new DatosMetaInvalidos(MENSAJES.horas);
  }

  if (datos.diasPorSemana === undefined) {
    throw new DatosMetaInvalidos("Falta el campo diasPorSemana");
  }

  if (!Number.isInteger(datos.diasPorSemana) || (datos.diasPorSemana as number) < 1 || (datos.diasPorSemana as number) > 7) {
    throw new DatosMetaInvalidos(MENSAJES.dias);
  }

  if (datos.hitos === undefined && modo === "editar") {
    throw new DatosMetaInvalidos("Falta el campo hitos");
  }

  const hitosEntrada = datos.hitos ?? [];

  if (!Array.isArray(hitosEntrada)) {
    throw new DatosMetaInvalidos(MENSAJES.hitosLista);
  }

  if (hitosEntrada.length > MAX_HITOS) {
    throw new DatosMetaInvalidos(MENSAJES.hitosMaximo);
  }

  return {
    horasSemanales: datos.horasSemanales,
    diasPorSemana: datos.diasPorSemana as number,
    hitos: hitosEntrada.map(validarHito)
  };
}

// ── CRUD (T-14 a T-17) ──────────────────────────────────────

const ESTADOS_CON_META = ["jugando", "pausado"];

// Igual que en E1; la duplicación de validarId está diferida en el backlog §6.
const validarId = (id: string): void => {
  if (!mongoose.isObjectIdOrHexString(id)) {
    throw new IdInvalido();
  }
};

const esClaveDuplicada = (error: unknown): boolean =>
  typeof error === "object" && error !== null && "code" in error && error.code === 11000;

/**
 * T-14 · H-1 · Crea la meta activa de un videojuego.
 * Orden de comprobaciones (spec §5): id → cuerpo → videojuego existe → estado → meta activa previa.
 */
export const crearMeta = async (videojuegoId: string, datos: unknown) => {
  validarId(videojuegoId);
  const meta = validarDatosMeta(datos, "crear");

  const videojuego = await Videojuego.findById(videojuegoId);

  if (!videojuego) {
    throw new VideojuegoNoEncontrado();
  }

  if (!ESTADOS_CON_META.includes(videojuego.estado)) {
    throw new VideojuegoCerrado(); // RB-06 · D-07
  }

  if (await Meta.exists({ videojuego: videojuegoId, activa: true })) {
    throw new MetaActivaDuplicada(); // RB-01
  }

  try {
    return await Meta.create({ ...meta, videojuego: videojuegoId });
  } catch (error) {
    // RB-02 · Dos creaciones simultáneas pasan la comprobación previa;
    // el índice único parcial rechaza la segunda con el código 11000.
    if (esClaveDuplicada(error)) {
      throw new MetaActivaDuplicada();
    }
    throw error;
  }
};

/** T-15 · H-3 · Consulta una meta por su id. */
export const obtenerMeta = async (metaId: string) => {
  validarId(metaId);

  const meta = await Meta.findById(metaId);

  if (!meta) {
    throw new MetaNoEncontrada();
  }

  return meta;
};

/** T-15 · H-2 · Lista todas las metas de un videojuego: la activa primero, luego las más recientes (RB-09). */
export const listarMetas = async (videojuegoId: string) => {
  validarId(videojuegoId);

  if (!(await Videojuego.exists({ _id: videojuegoId }))) {
    throw new VideojuegoNoEncontrado();
  }

  return await Meta.find({ videojuego: videojuegoId }).sort({ activa: -1, createdAt: -1, _id: -1 });
};

/**
 * T-16 · H-4 · Reemplaza horas, días e hitos de la meta activa (RB-10).
 * La escritura está condicionada a activa: true en la misma operación, así que una
 * desactivación simultánea no se pierde ni se sobrescribe.
 */
export const editarMeta = async (metaId: string, datos: unknown) => {
  validarId(metaId);
  const cambios = validarDatosMeta(datos, "editar");

  const existente = await Meta.findById(metaId);

  if (!existente) {
    throw new MetaNoEncontrada();
  }

  const mensajeDesactivada = "Las metas desactivadas no se pueden editar";

  if (!existente.activa) {
    throw new MetaDesactivada(mensajeDesactivada); // RB-11 · D-11
  }

  const actualizada = await Meta.findOneAndUpdate(
    { _id: metaId, activa: true },
    { $set: cambios },
    { returnDocument: "after", runValidators: true } // RB-37
  );

  if (!actualizada) {
    throw new MetaDesactivada(mensajeDesactivada);
  }

  return actualizada;
};

/**
 * T-17 · H-5 · Desactiva la meta activa sin borrarla (RB-12).
 * Operación atómica: solo cambia la meta si sigue activa.
 */
export const desactivarMeta = async (metaId: string) => {
  validarId(metaId);

  const desactivada = await Meta.findOneAndUpdate(
    { _id: metaId, activa: true },
    { $set: { activa: false } },
    { returnDocument: "after" } // RB-37
  );

  if (desactivada) {
    return desactivada;
  }

  if (!(await Meta.exists({ _id: metaId }))) {
    throw new MetaNoEncontrada();
  }

  throw new MetaDesactivada("La meta ya está desactivada"); // RB-13
};
