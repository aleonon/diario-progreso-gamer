// T-07 · Tests de dominio: semana, horas, porcentaje y días jugados.
// Spec backend §6 y §9 · Reglas RB-19 a RB-24 y RB-31.
// Salvo que se indique otra fecha, "hoy" es el jueves 2026-11-05 (hora de Ecuador)
// y la semana actual va del lunes 2026-11-02 al domingo 2026-11-08.
import { describe, expect, it } from "vitest";

import {
  diasJugadosSemana,
  fechaDePartida,
  fechaHoyGuayaquil,
  horasSemana,
  porcentajeHoras,
  semanaActual,
  type PartidaDia
} from "../../src/dominio/progreso.js";

const HOY = "2026-11-05";
const SEMANA = { inicio: "2026-11-02", fin: "2026-11-08" };

const partida = (fecha: string, duracionMinutos: number): PartidaDia => ({ fecha, duracionMinutos });

describe("semanaActual · lunes a domingo (RB-19)", () => {
  it("CA-06.1 la semana del jueves 2026-11-05 va del 2026-11-02 al 2026-11-08", () => {
    expect(semanaActual(HOY)).toEqual(SEMANA);
  });

  it("si hoy es lunes, la semana empieza hoy", () => {
    expect(semanaActual("2026-11-02")).toEqual(SEMANA);
  });

  it("si hoy es domingo, la semana termina hoy", () => {
    expect(semanaActual("2026-11-08")).toEqual(SEMANA);
  });

  it("una semana que cruza el cambio de mes", () => {
    expect(semanaActual("2026-12-02")).toEqual({ inicio: "2026-11-30", fin: "2026-12-06" });
  });

  it("una semana que cruza el cambio de año", () => {
    expect(semanaActual("2026-12-31")).toEqual({ inicio: "2026-12-28", fin: "2027-01-03" });
  });
});

describe("fechaHoyGuayaquil y fechaDePartida (RB-19, RB-20)", () => {
  it("CA-06.6 el domingo a las 22:00 en Ecuador sigue siendo domingo, aunque en UTC ya sea lunes", () => {
    const hoy = fechaHoyGuayaquil(new Date("2026-11-09T03:00:00.000Z"));

    expect(hoy).toBe("2026-11-08");
    expect(semanaActual(hoy)).toEqual(SEMANA);
  });

  it("a medianoche de Ecuador ya es el día siguiente", () => {
    expect(fechaHoyGuayaquil(new Date("2026-11-09T05:00:00.000Z"))).toBe("2026-11-09");
  });

  it("CA-06.4 una partida registrada el domingo 2026-11-08 pertenece a ese día y a esa semana", () => {
    const fecha = fechaDePartida(new Date("2026-11-08T00:00:00.000Z"));

    expect(fecha).toBe("2026-11-08");
    expect(horasSemana([partida(fecha, 120)], SEMANA, "2026-11-08")).toBe(2);
    expect(diasJugadosSemana([partida(fecha, 120)], SEMANA, "2026-11-08")).toBe(1);
  });
});

describe("horasSemana, porcentajeHoras y diasJugadosSemana (RB-21 a RB-24)", () => {
  it("CA-06.1 60 + 90 + 60 min con meta de 5 h y 4 días dan 3,5 h, 70 % y 3 días", () => {
    const partidas = [partida("2026-11-02", 60), partida("2026-11-03", 90), partida("2026-11-04", 60)];

    const horas = horasSemana(partidas, SEMANA, HOY);

    expect(horas).toBe(3.5);
    expect(porcentajeHoras(horas, 5)).toBe(70);
    expect(diasJugadosSemana(partidas, SEMANA, HOY)).toBe(3);
  });

  it("CA-06.2 100 min dan 1,7 h y, con meta de 3 h, 57 % (sobre las horas redondeadas)", () => {
    const horas = horasSemana([partida("2026-11-03", 100)], SEMANA, HOY);

    expect(horas).toBe(1.7);
    expect(porcentajeHoras(horas, 3)).toBe(57);
  });

  it("redondeo a un decimal con la mitad hacia arriba: 75 min dan 1,3 h", () => {
    expect(horasSemana([partida("2026-11-03", 75)], SEMANA, HOY)).toBe(1.3);
  });

  it("CA-06.3 dos partidas el mismo día cuentan como 1 día y suman 1,5 h", () => {
    const partidas = [partida("2026-11-03", 30), partida("2026-11-03", 60)];

    expect(diasJugadosSemana(partidas, SEMANA, HOY)).toBe(1);
    expect(horasSemana(partidas, SEMANA, HOY)).toBe(1.5);
  });

  it("CA-06.5 una partida del domingo anterior no cuenta; la del lunes sí", () => {
    const partidas = [partida("2026-11-01", 60), partida("2026-11-02", 30)];

    expect(horasSemana(partidas, SEMANA, HOY)).toBe(0.5);
    expect(diasJugadosSemana(partidas, SEMANA, HOY)).toBe(1);
  });

  it("CA-06.7 7 h con meta de 5 h dan 140 % (sin tope)", () => {
    const horas = horasSemana([partida("2026-11-02", 240), partida("2026-11-03", 180)], SEMANA, HOY);

    expect(horas).toBe(7);
    expect(porcentajeHoras(horas, 5)).toBe(140);
  });

  it("CA-06.8 una partida con fecha futura no cuenta hasta que llega su día", () => {
    const partidas = [partida("2026-11-07", 90)];

    expect(horasSemana(partidas, SEMANA, HOY)).toBe(0);
    expect(diasJugadosSemana(partidas, SEMANA, HOY)).toBe(0);

    expect(horasSemana(partidas, SEMANA, "2026-11-07")).toBe(1.5);
    expect(diasJugadosSemana(partidas, SEMANA, "2026-11-07")).toBe(1);
  });

  it("CA-04.2 4 h jugadas con la meta editada a 8 h dan 50 %", () => {
    expect(porcentajeHoras(4, 8)).toBe(50);
  });

  it("CA-09.2 sin partidas: 0 h, 0 días y 0 % con meta de 5 h", () => {
    const horas = horasSemana([], SEMANA, HOY);

    expect(horas).toBe(0);
    expect(diasJugadosSemana([], SEMANA, HOY)).toBe(0);
    expect(porcentajeHoras(horas, 5)).toBe(0);
  });

  it("CA-09.4 partidas solo en semanas anteriores: 0 h y 0 días esta semana", () => {
    const partidas = [partida("2026-10-20", 60), partida("2026-10-21", 60), partida("2026-10-22", 60)];

    expect(horasSemana(partidas, SEMANA, HOY)).toBe(0);
    expect(diasJugadosSemana(partidas, SEMANA, HOY)).toBe(0);
  });

  it("sin meta activa el porcentaje es null (RB-23, RB-28)", () => {
    expect(porcentajeHoras(3.5, null)).toBeNull();
  });
});

describe("pureza de las funciones (RB-31)", () => {
  it("no modifica las partidas recibidas (funciona con un arreglo congelado)", () => {
    const partidas = Object.freeze([
      Object.freeze(partida("2026-11-04", 60)),
      Object.freeze(partida("2026-11-02", 30))
    ]);
    const copia = JSON.stringify(partidas);

    expect(horasSemana(partidas, SEMANA, HOY)).toBe(1.5);
    expect(diasJugadosSemana(partidas, SEMANA, HOY)).toBe(2);
    expect(JSON.stringify(partidas)).toBe(copia);
  });

  it("devuelve el mismo resultado con las mismas entradas", () => {
    const partidas = [partida("2026-11-03", 45)];

    expect(horasSemana(partidas, SEMANA, HOY)).toBe(horasSemana(partidas, SEMANA, HOY));
    expect(semanaActual(HOY)).toEqual(semanaActual(HOY));
  });
});
