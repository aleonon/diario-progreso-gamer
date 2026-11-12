// Servicio de progreso semanal · E2 · T-18 (spec backend §6, RB-32).
// Solo consulta datos y llama al dominio: no contiene fórmulas de cálculo.
import { Meta } from "../models/meta.js";
import { Partida } from "../models/partida.js";
import { calcularResumen } from "./videojuegos.service.js";
import {
  calcularProgresoSemanal,
  fechaDePartida,
  fechaHoyGuayaquil
} from "../dominio/progreso.js";

/**
 * GET /api/videojuegos/:id/progreso-semanal
 * @param ahora instante de referencia; se puede fijar en los tests (el dominio nunca lee el reloj).
 */
export const obtenerProgresoSemanal = async (videojuegoId: string, ahora: Date = new Date()) => {
  // Reutiliza el resumen de E1 sin una petición HTTP interna:
  // valida el id (400), comprueba que el videojuego existe (404) y aporta
  // el avance actual que usan los hitos (RB-27, TD-08).
  const resumen = await calcularResumen(videojuegoId);

  const [partidas, meta] = await Promise.all([
    Partida.find({ videojuego: videojuegoId }).select("fecha duracionMinutos").lean(),
    Meta.findOne({ videojuego: videojuegoId, activa: true }).lean() // meta vigente al consultar (D-04)
  ]);

  return calcularProgresoSemanal({
    partidas: partidas.map(({ fecha, duracionMinutos }) => ({
      fecha: fechaDePartida(fecha), // RB-20: se conserva la fecha registrada
      duracionMinutos
    })),
    meta: meta
      ? {
          horasSemanales: meta.horasSemanales,
          diasPorSemana: meta.diasPorSemana,
          hitos: meta.hitos.map(({ descripcion, porcentajeObjetivo }) => ({ descripcion, porcentajeObjetivo }))
        }
      : null,
    avanceActual: resumen.porcentajeAvance,
    hoy: fechaHoyGuayaquil(ahora)
  });
};
