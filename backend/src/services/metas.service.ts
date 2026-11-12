// Servicio de metas · E2.
// T-13: validador puro del cuerpo (RB-03, RB-04, RB-07, RB-08).
// Las operaciones del CRUD (crear, consultar, listar, editar, desactivar) llegan en T-14 a T-17.
// El validador no importa el modelo ni Mongoose (RB-08); el límite viene de los tipos compartidos.
import { MAX_HITOS, type HitoDTO, type MetaDTO } from "../types/meta.types.js";

// Sigue el patrón actual de E1 (como DatosPartidaInvalidos): la clase vive en su servicio.
// T-05 la moverá a src/errors/ como subclase de SolicitudInvalida (RB-33).
export class DatosMetaInvalidos extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "DatosMetaInvalidos";
  }
}

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
