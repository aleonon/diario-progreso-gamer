// Tipos de E2 · Metas y rachas (spec frontend §4, RF-02).
// Reflejan las respuestas reales del backend (spec backend §5, H-1 a H-6).

export interface Hito {
  _id?: string;
  descripcion: string;
  porcentajeObjetivo: number;
}

export interface Meta {
  _id: string;
  videojuego: string;
  horasSemanales: number;
  diasPorSemana: number;
  activa: boolean;
  hitos: Hito[];
  createdAt: string;
  updatedAt: string;
}

/** Cuerpo de creación y edición: solo estos campos (RF-03 · RB-07 del backend). */
export interface MetaFormDTO {
  horasSemanales: number;
  diasPorSemana: number;
  hitos: Array<{ descripcion: string; porcentajeObjetivo: number }>;
}

export interface HitoEvaluado {
  descripcion: string;
  porcentajeObjetivo: number;
  alcanzado: boolean;
}

/** Respuesta de GET /api/videojuegos/:id/progreso-semanal. */
export interface ProgresoSemanal {
  semana: { inicio: string; fin: string };
  meta: { horasSemanales: number; diasPorSemana: number } | null;
  horasSemana: number;
  porcentajeHoras: number | null;
  diasJugadosSemana: number;
  rachaActual: number;
  mejorRacha: number;
  hitos: HitoEvaluado[];
}
