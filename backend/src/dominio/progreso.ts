// Dominio de E2 · Metas y rachas (spec backend §6).
// Funciones puras: no consultan MongoDB, no dependen de Express, no leen el reloj
// y no modifican sus argumentos (RB-31). "Hoy" siempre llega como parámetro.

/** Fecha de calendario en formato YYYY-MM-DD. */
export type Fecha = string;

/** Datos mínimos de una partida que necesita el dominio. */
export interface PartidaDia {
  fecha: Fecha;
  duracionMinutos: number;
}

export interface Semana {
  inicio: Fecha;
  fin: Fecha;
}

export const ZONA_ECUADOR = "America/Guayaquil";

const MS_POR_DIA = 86_400_000;

const formatoFechaEcuador = new Intl.DateTimeFormat("en-CA", {
  timeZone: ZONA_ECUADOR,
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
});

// Convierte una Fecha a milisegundos UTC de su medianoche, sin depender
// de la zona horaria del proceso.
const aUTC = (fecha: Fecha): number => {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  return Date.UTC(anio, mes - 1, dia);
};

const desdeUTC = (ms: number): Fecha => new Date(ms).toISOString().slice(0, 10);

const sumarDias = (fecha: Fecha, dias: number): Fecha => desdeUTC(aUTC(fecha) + dias * MS_POR_DIA);

// En formato YYYY-MM-DD el orden alfabético coincide con el cronológico.
const minimo = (a: Fecha, b: Fecha): Fecha => (a < b ? a : b);

/**
 * Fecha de calendario de un instante en hora de Ecuador (RB-19).
 * Es pura porque el instante se recibe como argumento.
 */
export function fechaHoyGuayaquil(ahora: Date): Fecha {
  return formatoFechaEcuador.format(ahora);
}

/**
 * Día al que pertenece una partida de E1 (RB-20, D-03).
 * E1 guarda la fecha registrada como medianoche UTC, así que su parte de fecha UTC
 * es exactamente el día registrado. No se convierte a hora de Ecuador.
 */
export function fechaDePartida(fecha: Date): Fecha {
  return fecha.toISOString().slice(0, 10);
}

/** Lunes y domingo de la semana que contiene a `hoy` (RB-19). */
export function semanaActual(hoy: Fecha): Semana {
  const diaSemana = new Date(aUTC(hoy)).getUTCDay(); // 0 = domingo … 6 = sábado
  const diasDesdeLunes = (diaSemana + 6) % 7;
  const inicio = sumarDias(hoy, -diasDesdeLunes);

  return { inicio, fin: sumarDias(inicio, 6) };
}

// Partidas que cuentan esta semana: dentro de [inicio, fin] y no posteriores a hoy (RB-21).
const partidasDeLaSemana = (
  partidas: readonly PartidaDia[],
  semana: Semana,
  hoy: Fecha
): PartidaDia[] => {
  const limite = minimo(semana.fin, hoy);
  return partidas.filter(({ fecha }) => fecha >= semana.inicio && fecha <= limite);
};

/**
 * Horas jugadas en la semana, redondeadas a un decimal con la mitad hacia arriba (RB-22).
 * Se divide entre 6 (décimas de hora) para no acumular error de coma flotante.
 */
export function horasSemana(partidas: readonly PartidaDia[], semana: Semana, hoy: Fecha): number {
  const minutos = partidasDeLaSemana(partidas, semana, hoy).reduce(
    (total, { duracionMinutos }) => total + duracionMinutos,
    0
  );

  return Math.round(minutos / 6) / 10;
}

/**
 * Porcentaje de horas frente a la meta, entero y sin tope (RB-23, D-05).
 * Se calcula sobre las horas ya redondeadas. Sin meta activa devuelve null (RB-28).
 */
export function porcentajeHoras(horas: number, horasSemanales: number | null): number | null {
  if (horasSemanales === null) return null;

  return Math.round((horas / horasSemanales) * 100);
}

/** Días distintos de la semana con al menos una partida (RB-24, D-02). */
export function diasJugadosSemana(partidas: readonly PartidaDia[], semana: Semana, hoy: Fecha): number {
  return new Set(partidasDeLaSemana(partidas, semana, hoy).map(({ fecha }) => fecha)).size;
}

// ── Rachas (T-10) ───────────────────────────────────────────

// Fechas distintas que ya ocurrieron (≤ hoy), ordenadas de la más antigua a la más reciente.
// D-02: varias partidas el mismo día cuentan una vez. D-10: las fechas futuras no cuentan.
const fechasJugadas = (fechas: readonly Fecha[], hoy: Fecha): Fecha[] =>
  [...new Set(fechas)].filter((fecha) => fecha <= hoy).sort();

/**
 * Días consecutivos con partida que terminan hoy o, si hoy aún no hay partida, ayer (RB-25, D-01).
 * Si no hubo partida ni hoy ni ayer, la racha es 0.
 */
export function rachaActual(fechas: readonly Fecha[], hoy: Fecha): number {
  const jugadas = new Set(fechasJugadas(fechas, hoy));
  const ayer = sumarDias(hoy, -1);

  let dia: Fecha | null = jugadas.has(hoy) ? hoy : jugadas.has(ayer) ? ayer : null;
  let racha = 0;

  while (dia !== null && jugadas.has(dia)) {
    racha++;
    dia = sumarDias(dia, -1);
  }

  return racha;
}

/** Serie de días consecutivos más larga de todo el historial, hasta hoy (RB-26). */
export function mejorRacha(fechas: readonly Fecha[], hoy: Fecha): number {
  let mejor = 0;
  let actual = 0;
  let anterior: Fecha | null = null;

  for (const fecha of fechasJugadas(fechas, hoy)) {
    actual = anterior !== null && sumarDias(anterior, 1) === fecha ? actual + 1 : 1;
    mejor = Math.max(mejor, actual);
    anterior = fecha;
  }

  return mejor;
}

// ── Hitos (T-12) ────────────────────────────────────────────

export interface Hito {
  descripcion: string;
  porcentajeObjetivo: number;
}

export interface HitoEvaluado extends Hito {
  alcanzado: boolean;
}

/**
 * Estado de cada hito según el avance actual del juego (RB-27, D-06).
 * Se alcanza si avanceActual ≥ porcentajeObjetivo; si el avance baja, vuelve a pendiente.
 * Conserva el orden y devuelve solo las claves del contrato (sin _id).
 */
export function evaluarHitos(hitos: readonly Hito[], avanceActual: number): HitoEvaluado[] {
  return hitos.map(({ descripcion, porcentajeObjetivo }) => ({
    descripcion,
    porcentajeObjetivo,
    alcanzado: avanceActual >= porcentajeObjetivo
  }));
}

// ── Progreso semanal (T-18) ─────────────────────────────────

export interface MetaVigente {
  horasSemanales: number;
  diasPorSemana: number;
  hitos: readonly Hito[];
}

export interface EntradaProgreso {
  partidas: readonly PartidaDia[];
  /** Meta activa en el momento de consultar (D-04), o null si no hay (RB-28). */
  meta: MetaVigente | null;
  /** porcentajeAvance del resumen de E1 (RB-27). */
  avanceActual: number;
  hoy: Fecha;
}

export interface ProgresoSemanal {
  semana: Semana;
  meta: { horasSemanales: number; diasPorSemana: number } | null;
  horasSemana: number;
  porcentajeHoras: number | null;
  diasJugadosSemana: number;
  rachaActual: number;
  mejorRacha: number;
  hitos: HitoEvaluado[];
}

/**
 * Compone el contrato de GET /api/videojuegos/:id/progreso-semanal (spec §5 H-6).
 * No calcula nada propio: solo combina las funciones anteriores.
 */
export function calcularProgresoSemanal({ partidas, meta, avanceActual, hoy }: EntradaProgreso): ProgresoSemanal {
  const semana = semanaActual(hoy);
  const horas = horasSemana(partidas, semana, hoy);
  const fechas = partidas.map(({ fecha }) => fecha);

  return {
    semana,
    meta: meta ? { horasSemanales: meta.horasSemanales, diasPorSemana: meta.diasPorSemana } : null,
    horasSemana: horas,
    porcentajeHoras: porcentajeHoras(horas, meta?.horasSemanales ?? null),
    diasJugadosSemana: diasJugadosSemana(partidas, semana, hoy),
    rachaActual: rachaActual(fechas, hoy),
    mejorRacha: mejorRacha(fechas, hoy),
    hitos: meta ? evaluarHitos(meta.hitos, avanceActual) : []
  };
}
