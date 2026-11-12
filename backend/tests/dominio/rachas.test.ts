// T-09 · Tests de dominio: racha actual y mejor racha.
// Spec backend §6 · Reglas RB-21, RB-25, RB-26 y RB-31 · Decisiones D-01, D-02 y D-10.
// Salvo que se indique otra fecha, "hoy" es el jueves 2026-11-05 (hora de Ecuador).
import { describe, expect, it } from "vitest";

import { mejorRacha, rachaActual } from "../../src/dominio/progreso.js";

const HOY = "2026-11-05";

/** Fechas consecutivas desde `inicio` (incluido), `dias` en total. */
const serie = (inicio: string, dias: number): string[] => {
  const base = Date.parse(`${inicio}T00:00:00.000Z`);
  return Array.from({ length: dias }, (_, i) => new Date(base + i * 86_400_000).toISOString().slice(0, 10));
};

describe("rachaActual (RB-25, D-01)", () => {
  it("CA-07.1 jugó ayer y no anteayer ni hoy: la racha es 1", () => {
    expect(rachaActual(["2026-11-04"], HOY)).toBe(1);
  });

  it("CA-07.2 tras registrar una partida hoy, la racha pasa a 2", () => {
    expect(rachaActual(["2026-11-04", "2026-11-05"], HOY)).toBe(2);
  });

  it("CA-07.3 última partida anteayer, sin partidas ayer ni hoy: la racha es 0", () => {
    expect(rachaActual(["2026-11-03"], HOY)).toBe(0);
  });

  it("CA-07.4 lunes a jueves seguidos, con hoy jueves: la racha es 4", () => {
    expect(rachaActual(serie("2026-11-02", 4), HOY)).toBe(4);
  });

  it("CA-07.6 tres partidas el martes y una el miércoles: la racha es 2", () => {
    expect(rachaActual(["2026-11-03", "2026-11-03", "2026-11-03", "2026-11-04"], "2026-11-04")).toBe(2);
  });

  it("CA-07.7 una racha que cruza el cambio de mes y de semana cuenta completa", () => {
    expect(rachaActual(["2026-10-30", "2026-10-31", "2026-11-01", "2026-11-02"], "2026-11-02")).toBe(4);
  });

  it("CA-07.8 una racha que cruza el cambio de año cuenta completa", () => {
    expect(rachaActual(["2026-12-30", "2026-12-31", "2027-01-01", "2027-01-02"], "2027-01-02")).toBe(4);
  });

  it("CA-07.10 una partida con fecha futura no extiende la racha", () => {
    expect(rachaActual(["2026-11-04", "2026-11-05", "2026-11-06"], HOY)).toBe(2);
  });

  it("si hoy no hay partida pero ayer sí, cuenta hacia atrás desde ayer", () => {
    expect(rachaActual(serie("2026-11-01", 4), HOY)).toBe(4); // 01 a 04
  });

  it("sin partidas la racha es 0", () => {
    expect(rachaActual([], HOY)).toBe(0);
  });

  it("el orden de las fechas recibidas no importa", () => {
    expect(rachaActual(["2026-11-05", "2026-11-03", "2026-11-04"], HOY)).toBe(3);
  });
});

describe("mejorRacha (RB-26)", () => {
  it("CA-07.3 la mejor racha se conserva aunque la actual se haya roto", () => {
    const fechas = [...serie("2026-10-20", 6), "2026-11-03"];

    expect(rachaActual(fechas, HOY)).toBe(0);
    expect(mejorRacha(fechas, HOY)).toBe(6);
  });

  it("CA-07.5 9 días en octubre, un hueco y 4 días hasta hoy: actual 4 y mejor 9", () => {
    const fechas = [...serie("2026-10-10", 9), ...serie("2026-11-02", 4)];

    expect(rachaActual(fechas, HOY)).toBe(4);
    expect(mejorRacha(fechas, HOY)).toBe(9);
  });

  it("CA-07.11 si la racha actual es la serie más larga, la mejor racha coincide", () => {
    const fechas = ["2026-10-20", "2026-10-21", ...serie("2026-11-01", 5)];

    expect(rachaActual(fechas, HOY)).toBe(5);
    expect(mejorRacha(fechas, HOY)).toBe(5);
  });

  it("CA-07.6 las fechas repetidas cuentan una sola vez en la mejor racha", () => {
    expect(mejorRacha(["2026-11-03", "2026-11-03", "2026-11-04", "2026-11-04"], HOY)).toBe(2);
  });

  it("CA-07.8 la mejor racha también cruza el cambio de año", () => {
    expect(mejorRacha(serie("2026-12-29", 6), "2027-01-10")).toBe(6);
  });

  it("CA-07.10 las fechas futuras no cuentan para la mejor racha", () => {
    expect(mejorRacha(["2026-11-05", ...serie("2026-11-06", 10)], HOY)).toBe(1);
  });

  it("sin partidas la mejor racha es 0", () => {
    expect(mejorRacha([], HOY)).toBe(0);
  });

  it("una sola partida da una mejor racha de 1", () => {
    expect(mejorRacha(["2026-01-15"], HOY)).toBe(1);
  });
});

describe("sin partidas recientes (CA-09.2, CA-09.4)", () => {
  it("CA-09.2 sin partidas: racha actual 0 y mejor racha 0", () => {
    expect(rachaActual([], HOY)).toBe(0);
    expect(mejorRacha([], HOY)).toBe(0);
  });

  it("CA-09.4 solo partidas de semanas anteriores (3 seguidas): actual 0 y mejor 3", () => {
    const fechas = serie("2026-10-20", 3);

    expect(rachaActual(fechas, HOY)).toBe(0);
    expect(mejorRacha(fechas, HOY)).toBe(3);
  });
});

describe("pureza (RB-31)", () => {
  it("no modifica el arreglo recibido, aunque venga desordenado y congelado", () => {
    const fechas = Object.freeze(["2026-11-05", "2026-11-03", "2026-11-04", "2026-10-01"]);
    const copia = [...fechas];

    expect(rachaActual(fechas, HOY)).toBe(3);
    expect(mejorRacha(fechas, HOY)).toBe(3);
    expect([...fechas]).toEqual(copia);
  });
});
