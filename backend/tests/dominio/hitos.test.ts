// T-11 · Tests de dominio: estado de los hitos.
// Spec backend §6 · Reglas RB-27 y RB-31 · Decisión D-06.
// El estado "alcanzado" se calcula con el avance actual del juego y no se guarda.
import { describe, expect, it } from "vitest";

import { evaluarHitos } from "../../src/dominio/progreso.js";

const hitos = [
  { descripcion: "Llegar al 25 %", porcentajeObjetivo: 25 },
  { descripcion: "Llegar al 50 %", porcentajeObjetivo: 50 },
  { descripcion: "Terminar el juego", porcentajeObjetivo: 100 }
];

describe("evaluarHitos (RB-27)", () => {
  it("CA-08.1 con avance 60: 25 % y 50 % alcanzados, 100 % pendiente", () => {
    expect(evaluarHitos(hitos, 60)).toEqual([
      { descripcion: "Llegar al 25 %", porcentajeObjetivo: 25, alcanzado: true },
      { descripcion: "Llegar al 50 %", porcentajeObjetivo: 50, alcanzado: true },
      { descripcion: "Terminar el juego", porcentajeObjetivo: 100, alcanzado: false }
    ]);
  });

  it("CA-08.2 un avance exactamente igual al objetivo alcanza el hito", () => {
    expect(evaluarHitos([{ descripcion: "Mitad", porcentajeObjetivo: 50 }], 50)).toEqual([
      { descripcion: "Mitad", porcentajeObjetivo: 50, alcanzado: true }
    ]);
  });

  it("CA-08.3 si el avance baja de 60 a 40, el hito de 50 % deja de estar alcanzado (D-06)", () => {
    const mitad = [{ descripcion: "Llegar al 50 %", porcentajeObjetivo: 50 }];

    expect(evaluarHitos(mitad, 60)[0].alcanzado).toBe(true);
    expect(evaluarHitos(mitad, 40)[0].alcanzado).toBe(false);
  });

  it("CA-09.2 con avance 0 (sin partidas) ningún hito está alcanzado", () => {
    expect(evaluarHitos(hitos, 0).every((hito) => !hito.alcanzado)).toBe(true);
  });

  it("con avance 100 todos los hitos están alcanzados", () => {
    expect(evaluarHitos(hitos, 100).every((hito) => hito.alcanzado)).toBe(true);
  });

  it("una meta sin hitos devuelve una lista vacía", () => {
    expect(evaluarHitos([], 75)).toEqual([]);
  });

  it("conserva el orden y admite objetivos repetidos (S-03)", () => {
    const repetidos = [
      { descripcion: "Mitad del mapa", porcentajeObjetivo: 50 },
      { descripcion: "Inicio", porcentajeObjetivo: 10 },
      { descripcion: "Mitad de los jefes", porcentajeObjetivo: 50 }
    ];

    expect(evaluarHitos(repetidos, 30).map((h) => [h.descripcion, h.alcanzado])).toEqual([
      ["Mitad del mapa", false],
      ["Inicio", true],
      ["Mitad de los jefes", false]
    ]);
  });

  it("devuelve solo descripción, porcentaje objetivo y alcanzado (sin _id ni otros campos)", () => {
    const guardado = [{ _id: "665f00000000000000000001", descripcion: "Mitad", porcentajeObjetivo: 50 }];

    expect(evaluarHitos(guardado, 50)).toEqual([{ descripcion: "Mitad", porcentajeObjetivo: 50, alcanzado: true }]);
  });
});

describe("pureza (RB-31)", () => {
  it("no modifica los hitos recibidos", () => {
    const entrada = Object.freeze(hitos.map((hito) => Object.freeze({ ...hito })));
    const copia = JSON.stringify(entrada);

    evaluarHitos(entrada, 60);

    expect(JSON.stringify(entrada)).toBe(copia);
  });
});
