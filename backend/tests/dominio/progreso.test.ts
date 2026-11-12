// T-18 · Composición pura del progreso semanal (spec backend §5 H-6 y §6).
// Reglas RB-23, RB-28, RB-29 y RB-31. Salvo que se indique otra fecha, hoy es 2026-11-05.
import { describe, expect, it } from "vitest";

import { calcularProgresoSemanal, type PartidaDia } from "../../src/dominio/progreso.js";

const HOY = "2026-11-05";
const SEMANA = { inicio: "2026-11-02", fin: "2026-11-08" };
const partida = (fecha: string, duracionMinutos: number): PartidaDia => ({ fecha, duracionMinutos });
const meta = (horasSemanales = 5, diasPorSemana = 4, hitos = [] as { descripcion: string; porcentajeObjetivo: number }[]) => ({
  horasSemanales,
  diasPorSemana,
  hitos
});

describe("calcularProgresoSemanal", () => {
  it("CA-06.1 compone el contrato completo de H-6 con meta activa", () => {
    const resultado = calcularProgresoSemanal({
      partidas: [
        partida("2026-10-30", 30),
        partida("2026-11-02", 60),
        partida("2026-11-03", 90),
        partida("2026-11-04", 60)
      ],
      meta: meta(5, 4, [
        { descripcion: "Llegar al 25 %", porcentajeObjetivo: 25 },
        { descripcion: "Llegar al 50 %", porcentajeObjetivo: 50 },
        { descripcion: "Terminar el juego", porcentajeObjetivo: 100 }
      ]),
      avanceActual: 60,
      hoy: HOY
    });

    expect(resultado).toEqual({
      semana: SEMANA,
      meta: { horasSemanales: 5, diasPorSemana: 4 },
      horasSemana: 3.5,
      porcentajeHoras: 70,
      diasJugadosSemana: 3,
      rachaActual: 3,
      mejorRacha: 3,
      hitos: [
        { descripcion: "Llegar al 25 %", porcentajeObjetivo: 25, alcanzado: true },
        { descripcion: "Llegar al 50 %", porcentajeObjetivo: 50, alcanzado: true },
        { descripcion: "Terminar el juego", porcentajeObjetivo: 100, alcanzado: false }
      ]
    });
  });

  it("las claves salen en el orden del contrato de la spec", () => {
    const resultado = calcularProgresoSemanal({ partidas: [], meta: meta(), avanceActual: 0, hoy: HOY });

    expect(Object.keys(resultado)).toEqual([
      "semana",
      "meta",
      "horasSemana",
      "porcentajeHoras",
      "diasJugadosSemana",
      "rachaActual",
      "mejorRacha",
      "hitos"
    ]);
  });

  it("CA-06.7 una meta superada muestra 140 % sin tope (D-05)", () => {
    const resultado = calcularProgresoSemanal({
      partidas: [partida("2026-11-02", 240), partida("2026-11-03", 180)],
      meta: meta(5),
      avanceActual: 0,
      hoy: HOY
    });

    expect(resultado.horasSemana).toBe(7);
    expect(resultado.porcentajeHoras).toBe(140);
  });

  it("CA-04.2 se compara con la meta vigente que recibe (8 h): 4 h dan 50 % (D-04)", () => {
    const resultado = calcularProgresoSemanal({
      partidas: [partida("2026-11-02", 120), partida("2026-11-03", 120)],
      meta: meta(8),
      avanceActual: 0,
      hoy: HOY
    });

    expect(resultado.porcentajeHoras).toBe(50);
    expect(resultado.meta).toEqual({ horasSemanales: 8, diasPorSemana: 4 });
  });

  it("CA-08.5 una meta sin hitos devuelve hitos: []", () => {
    expect(calcularProgresoSemanal({ partidas: [], meta: meta(), avanceActual: 80, hoy: HOY }).hitos).toEqual([]);
  });

  it("CA-09.1 sin meta activa: meta y porcentaje null, sin hitos, pero con horas, días y rachas", () => {
    const resultado = calcularProgresoSemanal({
      partidas: [partida("2026-11-03", 60), partida("2026-11-04", 30), partida("2026-11-05", 30)],
      meta: null,
      avanceActual: 90,
      hoy: HOY
    });

    expect(resultado).toEqual({
      semana: SEMANA,
      meta: null,
      horasSemana: 2,
      porcentajeHoras: null,
      diasJugadosSemana: 3,
      rachaActual: 3,
      mejorRacha: 3,
      hitos: []
    });
  });

  it("CA-09.2 sin partidas y con meta: todo en 0, 0 % y ningún hito alcanzado", () => {
    const resultado = calcularProgresoSemanal({
      partidas: [],
      meta: meta(5, 4, [
        { descripcion: "Llegar al 25 %", porcentajeObjetivo: 25 },
        { descripcion: "Llegar al 50 %", porcentajeObjetivo: 50 }
      ]),
      avanceActual: 0,
      hoy: HOY
    });

    expect(resultado).toMatchObject({
      horasSemana: 0,
      porcentajeHoras: 0,
      diasJugadosSemana: 0,
      rachaActual: 0,
      mejorRacha: 0
    });
    expect(resultado.hitos.every((hito) => !hito.alcanzado)).toBe(true);
  });

  it("CA-09.3 sin partidas y sin meta: valores en 0 y meta null", () => {
    expect(calcularProgresoSemanal({ partidas: [], meta: null, avanceActual: 0, hoy: HOY })).toEqual({
      semana: SEMANA,
      meta: null,
      horasSemana: 0,
      porcentajeHoras: null,
      diasJugadosSemana: 0,
      rachaActual: 0,
      mejorRacha: 0,
      hitos: []
    });
  });

  it("CA-09.4 solo partidas de semanas anteriores: semana en 0, racha actual 0 y mejor racha 3", () => {
    const resultado = calcularProgresoSemanal({
      partidas: [partida("2026-10-20", 60), partida("2026-10-21", 60), partida("2026-10-22", 60)],
      meta: meta(),
      avanceActual: 0,
      hoy: HOY
    });

    expect(resultado).toMatchObject({ horasSemana: 0, diasJugadosSemana: 0, rachaActual: 0, mejorRacha: 3 });
  });

  it("no modifica la entrada (RB-31)", () => {
    const entrada = Object.freeze({
      partidas: Object.freeze([Object.freeze(partida("2026-11-04", 60))]),
      meta: Object.freeze(meta(5, 4, [Object.freeze({ descripcion: "Mitad", porcentajeObjetivo: 50 })])),
      avanceActual: 50,
      hoy: HOY
    });
    const copia = JSON.stringify(entrada);

    calcularProgresoSemanal(entrada);

    expect(JSON.stringify(entrada)).toBe(copia);
  });
});
