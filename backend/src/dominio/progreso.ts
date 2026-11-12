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
