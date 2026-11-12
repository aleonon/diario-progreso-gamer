// Tipos de E2 · Meta (spec backend §4).

/** Máximo de hitos por meta (RO-03, RB-04). Compartido por el validador y el esquema. */
export const MAX_HITOS = 5;

export interface HitoDTO {
  descripcion: string;
  porcentajeObjetivo: number;
}

/** Cuerpo validado para crear o editar una meta (RB-07: solo estos campos). */
export interface MetaDTO {
  horasSemanales: number;
  diasPorSemana: number;
  hitos: HitoDTO[];
}
