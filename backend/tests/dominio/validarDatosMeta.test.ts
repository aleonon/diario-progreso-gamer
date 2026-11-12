// T-13 · Validador puro del cuerpo de una meta (spec backend RB-03, RB-04, RB-07, RB-08).
// Se ejecuta sin base de datos: validarDatosMeta no usa Mongoose ni Express.
import { describe, expect, it } from "vitest";

import { DatosMetaInvalidos, validarDatosMeta } from "../../src/services/metas.service.js";

const base = { horasSemanales: 5, diasPorSemana: 4 };
const hito = (porcentajeObjetivo: number, descripcion = `Llegar al ${porcentajeObjetivo} %`) => ({
  descripcion,
  porcentajeObjetivo
});

const MSG_HORAS = "Las horas semanales deben ser un número mayor que 0 y como máximo 100";
const MSG_DIAS = "Los días por semana deben ser un número entero entre 1 y 7";
const MSG_HITOS_MAX = "Una meta puede tener como máximo 5 hitos";
const MSG_DESCRIPCION = "Cada hito necesita una descripción";
const MSG_PORCENTAJE = "El porcentaje objetivo de cada hito debe estar entre 1 y 100";

const rechaza = (datos: unknown, mensaje: string, modo: "crear" | "editar" = "crear") => {
  expect(() => validarDatosMeta(datos, modo)).toThrow(DatosMetaInvalidos);
  expect(() => validarDatosMeta(datos, modo)).toThrow(mensaje);
};

describe("horasSemanales (RB-03)", () => {
  it("CA-01.3 acepta 0,1 h y 100 h", () => {
    expect(validarDatosMeta({ ...base, horasSemanales: 0.1 }, "crear").horasSemanales).toBe(0.1);
    expect(validarDatosMeta({ ...base, horasSemanales: 100 }, "crear").horasSemanales).toBe(100);
  });

  it("CA-01.4 rechaza 0 h, horas negativas y 100,1 h con el mensaje de horas", () => {
    for (const horasSemanales of [0, -1, 100.1]) {
      rechaza({ ...base, horasSemanales }, MSG_HORAS);
    }
  });

  it("rechaza horas que no son un número finito", () => {
    for (const horasSemanales of ["5", null, Number.NaN, Number.POSITIVE_INFINITY, true]) {
      rechaza({ ...base, horasSemanales }, MSG_HORAS);
    }
  });
});

describe("diasPorSemana (RB-03)", () => {
  it("CA-01.5 acepta 1 día y 7 días", () => {
    expect(validarDatosMeta({ ...base, diasPorSemana: 1 }, "crear").diasPorSemana).toBe(1);
    expect(validarDatosMeta({ ...base, diasPorSemana: 7 }, "crear").diasPorSemana).toBe(7);
  });

  it("CA-01.6 rechaza 0, 8 y 3,5 días con el mensaje de días", () => {
    for (const diasPorSemana of [0, 8, 3.5]) {
      rechaza({ ...base, diasPorSemana }, MSG_DIAS);
    }
  });

  it("rechaza días que no son un número", () => {
    rechaza({ ...base, diasPorSemana: "4" }, MSG_DIAS);
  });
});

describe("campos obligatorios (RB-03)", () => {
  it("CA-01.7 indica que falta horasSemanales", () => {
    rechaza({ diasPorSemana: 4 }, "Falta el campo horasSemanales");
  });

  it("CA-01.7 indica que falta diasPorSemana", () => {
    rechaza({ horasSemanales: 5 }, "Falta el campo diasPorSemana");
  });

  it("rechaza un cuerpo que no es un objeto JSON", () => {
    for (const datos of [null, [], "meta", 5]) {
      rechaza(datos, "El cuerpo debe ser un objeto JSON");
    }
  });
});

describe("hitos (RB-04, S-03)", () => {
  it("CA-02.2 acepta objetivos de 1 % y de 100 %", () => {
    const { hitos } = validarDatosMeta({ ...base, hitos: [hito(1), hito(100)] }, "crear");

    expect(hitos.map((h) => h.porcentajeObjetivo)).toEqual([1, 100]);
  });

  it("CA-02.3 rechaza objetivos de 0 %, 101 % y negativos", () => {
    for (const porcentaje of [0, 101, -5]) {
      rechaza({ ...base, hitos: [hito(porcentaje)] }, MSG_PORCENTAJE);
    }
  });

  it("rechaza un objetivo que no es un número", () => {
    rechaza({ ...base, hitos: [{ descripcion: "Mitad", porcentajeObjetivo: "50" }] }, MSG_PORCENTAJE);
  });

  it("CA-02.4 acepta exactamente 5 hitos", () => {
    const hitos = [hito(10), hito(25), hito(50), hito(75), hito(100)];

    expect(validarDatosMeta({ ...base, hitos }, "crear").hitos).toHaveLength(5);
  });

  it("CA-02.5 rechaza un sexto hito con el mensaje de máximo 5", () => {
    const hitos = [hito(10), hito(20), hito(30), hito(40), hito(50), hito(60)];

    rechaza({ ...base, hitos }, MSG_HITOS_MAX);
  });

  it("CA-02.6 rechaza una descripción vacía o solo con espacios", () => {
    rechaza({ ...base, hitos: [hito(50, "")] }, MSG_DESCRIPCION);
    rechaza({ ...base, hitos: [hito(50, "   ")] }, MSG_DESCRIPCION);
  });

  it("rechaza un hito sin descripción o que no es un objeto", () => {
    rechaza({ ...base, hitos: [{ porcentajeObjetivo: 50 }] }, MSG_DESCRIPCION);
    rechaza({ ...base, hitos: ["Llegar al 50 %"] }, MSG_DESCRIPCION);
  });

  it("recorta los espacios de la descripción", () => {
    const { hitos } = validarDatosMeta({ ...base, hitos: [hito(50, "  Llegar al 50 %  ")] }, "crear");

    expect(hitos[0].descripcion).toBe("Llegar al 50 %");
  });

  it("CA-02.7 al crear sin hitos devuelve una lista vacía", () => {
    expect(validarDatosMeta(base, "crear").hitos).toEqual([]);
  });

  it("CA-02.8 acepta dos hitos con el mismo objetivo", () => {
    const hitos = [hito(50, "Mitad del mapa"), hito(50, "Mitad de los jefes")];

    expect(validarDatosMeta({ ...base, hitos }, "crear").hitos).toHaveLength(2);
  });

  it("rechaza hitos que no son una lista", () => {
    rechaza({ ...base, hitos: "ninguno" }, "Los hitos deben ser una lista");
  });

  it("al editar, hitos es obligatorio (TD-04)", () => {
    rechaza(base, "Falta el campo hitos", "editar");
    expect(validarDatosMeta({ ...base, hitos: [] }, "editar").hitos).toEqual([]);
  });
});

describe("campos no permitidos (RB-07)", () => {
  it("rechaza videojuego, activa, _id y campos desconocidos en la meta", () => {
    for (const campo of ["videojuego", "activa", "_id", "color"]) {
      rechaza({ ...base, [campo]: "x" }, `Campos no permitidos: ${campo}`);
    }
  });

  it("enumera todos los campos no permitidos", () => {
    rechaza({ ...base, activa: true, videojuego: "abc" }, "Campos no permitidos: activa, videojuego");
  });

  it("rechaza campos extra dentro de un hito, incluido _id", () => {
    rechaza({ ...base, hitos: [{ ...hito(50), _id: "665f" }] }, "Campos no permitidos: _id");
  });
});

describe("pureza del validador (RB-08)", () => {
  it("devuelve un objeto nuevo y no modifica la entrada", () => {
    const entrada = Object.freeze({ ...base, hitos: Object.freeze([Object.freeze(hito(50, " Mitad "))]) });
    const copia = JSON.stringify(entrada);

    const resultado = validarDatosMeta(entrada, "crear");

    expect(resultado).toEqual({ ...base, hitos: [{ descripcion: "Mitad", porcentajeObjetivo: 50 }] });
    expect(JSON.stringify(entrada)).toBe(copia);
  });
});
