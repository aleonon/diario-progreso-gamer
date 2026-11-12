// T-18 · GET /api/videojuegos/:id/progreso-semanal (spec backend §5 H-6, RB-19 a RB-32).
// Integración real: Express + servicio + dominio + MongoDB en memoria, con el reloj fijado.
// Salvo que se indique otra cosa, "ahora" es el jueves 2026-11-05 a las 10:00 en Ecuador.
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import mongoose from "mongoose";

import app from "../../src/app.js";
import { Meta } from "../../src/models/meta.js";
import { Partida } from "../../src/models/partida.js";
import { Videojuego } from "../../src/models/videojuego.js";
import { detenerMongo, iniciarMongo, limpiarColecciones } from "../setup/mongo.js";

const JUEVES_10H_ECUADOR = "2026-11-05T15:00:00.000Z";
const SEMANA = { inicio: "2026-11-02", fin: "2026-11-08" };

const fijarReloj = (instante: string) => vi.setSystemTime(new Date(instante));

const crearJuego = (nombre = "Hades") =>
  Videojuego.create({ nombre, plataforma: "PC", genero: "accion", estado: "jugando" });

// Igual que E1: la fecha registrada se guarda como medianoche UTC.
const crearPartida = (videojuego: mongoose.Types.ObjectId, fecha: string, duracionMinutos: number, porcentajeAvance = 10) =>
  Partida.create({ videojuego, fecha: new Date(`${fecha}T00:00:00.000Z`), duracionMinutos, porcentajeAvance });

const crearMeta = (videojuego: mongoose.Types.ObjectId, extra: Record<string, unknown> = {}) =>
  Meta.create({ videojuego, horasSemanales: 5, diasPorSemana: 4, ...extra });

const progreso = (id: string) => request(app).get(`/api/videojuegos/${id}/progreso-semanal`);

describe("T-18 · GET /api/videojuegos/:id/progreso-semanal", () => {
  beforeAll(async () => {
    await iniciarMongo();
    await Meta.init();
  });
  afterAll(detenerMongo);

  beforeEach(async () => {
    await limpiarColecciones();
    vi.useFakeTimers({ toFake: ["Date"] });
    fijarReloj(JUEVES_10H_ECUADOR);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  describe("casos sin datos (RB-28, RB-29)", () => {
    it("CA-09.2 juego sin partidas con meta: todo en 0, 0 % y ningún hito alcanzado", async () => {
      const juego = await crearJuego();
      await crearMeta(juego._id, {
        hitos: [
          { descripcion: "Llegar al 25 %", porcentajeObjetivo: 25 },
          { descripcion: "Llegar al 50 %", porcentajeObjetivo: 50 }
        ]
      });

      const respuesta = await progreso(juego.id);

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toEqual({
        semana: SEMANA,
        meta: { horasSemanales: 5, diasPorSemana: 4 },
        horasSemana: 0,
        porcentajeHoras: 0,
        diasJugadosSemana: 0,
        rachaActual: 0,
        mejorRacha: 0,
        hitos: [
          { descripcion: "Llegar al 25 %", porcentajeObjetivo: 25, alcanzado: false },
          { descripcion: "Llegar al 50 %", porcentajeObjetivo: 50, alcanzado: false }
        ]
      });
    });

    it("CA-09.1 juego sin meta activa: meta y porcentaje null, sin hitos, con horas, días y rachas", async () => {
      const juego = await crearJuego();
      await crearMeta(juego._id, { activa: false }); // solo historial
      await crearPartida(juego._id, "2026-11-04", 60);
      await crearPartida(juego._id, "2026-11-05", 30);

      const respuesta = await progreso(juego.id);

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toEqual({
        semana: SEMANA,
        meta: null,
        horasSemana: 1.5,
        porcentajeHoras: null,
        diasJugadosSemana: 2,
        rachaActual: 2,
        mejorRacha: 2,
        hitos: []
      });
    });

    it("CA-09.3 juego sin partidas ni meta: 200 con valores en 0 (no es un error)", async () => {
      const juego = await crearJuego();

      const respuesta = await progreso(juego.id);

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toMatchObject({ meta: null, porcentajeHoras: null, horasSemana: 0, rachaActual: 0, mejorRacha: 0 });
    });
  });

  describe("cálculos con partidas reales", () => {
    it("CA-06.1 / CA-07.5 cinco o más sesiones en días distintos con una racha rota", async () => {
      const juego = await crearJuego();
      await crearMeta(juego._id);
      // Racha antigua de 3 días (23 a 25 de octubre), hueco y racha actual del 2 al 5 de noviembre.
      for (const fecha of ["2026-10-23", "2026-10-24", "2026-10-25"]) await crearPartida(juego._id, fecha, 45);
      await crearPartida(juego._id, "2026-11-02", 60);
      await crearPartida(juego._id, "2026-11-03", 90);
      await crearPartida(juego._id, "2026-11-04", 60);
      await crearPartida(juego._id, "2026-11-05", 30);

      const { body } = await progreso(juego.id);

      expect(body).toMatchObject({
        semana: SEMANA,
        horasSemana: 4,
        porcentajeHoras: 80,
        diasJugadosSemana: 4,
        rachaActual: 4,
        mejorRacha: 4
      });
    });

    it("CA-07.5 la mejor racha del historial se conserva si es más larga que la actual", async () => {
      const juego = await crearJuego();
      for (let dia = 10; dia <= 18; dia++) await crearPartida(juego._id, `2026-10-${dia}`, 30);
      for (const fecha of ["2026-11-02", "2026-11-03", "2026-11-04", "2026-11-05"]) await crearPartida(juego._id, fecha, 30);

      const { body } = await progreso(juego.id);

      expect(body.rachaActual).toBe(4);
      expect(body.mejorRacha).toBe(9);
    });

    it("CA-06.3 / CA-07.6 varias partidas el mismo día cuentan un día y suman sus horas", async () => {
      const juego = await crearJuego();
      await crearMeta(juego._id);
      await crearPartida(juego._id, "2026-11-03", 30);
      await crearPartida(juego._id, "2026-11-03", 60);
      await crearPartida(juego._id, "2026-11-04", 30);

      const { body } = await progreso(juego.id);

      expect(body).toMatchObject({ horasSemana: 2, diasJugadosSemana: 2, rachaActual: 2, mejorRacha: 2 });
    });

    it("CA-06.5 cambio de semana: la partida del domingo anterior no cuenta en esta semana", async () => {
      const juego = await crearJuego();
      await crearPartida(juego._id, "2026-11-01", 60);
      await crearPartida(juego._id, "2026-11-02", 30);

      const { body } = await progreso(juego.id);

      expect(body).toMatchObject({ horasSemana: 0.5, diasJugadosSemana: 1 });
      expect(body.mejorRacha).toBe(2); // la racha sí cruza la semana (RB-25)
    });

    it("CA-07.8 la semana y la racha cruzan el cambio de año", async () => {
      fijarReloj("2027-01-02T15:00:00.000Z"); // sábado 2 de enero de 2027, 10:00 en Ecuador
      const juego = await crearJuego();
      for (const fecha of ["2026-12-30", "2026-12-31", "2027-01-01", "2027-01-02"]) await crearPartida(juego._id, fecha, 60);

      const { body } = await progreso(juego.id);

      expect(body.semana).toEqual({ inicio: "2026-12-28", fin: "2027-01-03" });
      expect(body).toMatchObject({ horasSemana: 4, diasJugadosSemana: 4, rachaActual: 4, mejorRacha: 4 });
    });

    it("CA-06.6 el domingo a las 22:00 en Ecuador sigue siendo la misma semana", async () => {
      fijarReloj("2026-11-09T03:00:00.000Z"); // domingo 8, 22:00 en Ecuador; lunes 9 en UTC
      const juego = await crearJuego();
      await crearPartida(juego._id, "2026-11-08", 120);

      const { body } = await progreso(juego.id);

      expect(body.semana).toEqual(SEMANA);
      expect(body).toMatchObject({ horasSemana: 2, diasJugadosSemana: 1, rachaActual: 1 });
    });

    it("CA-06.7 meta superada: 7 h con meta de 5 h dan 140 %", async () => {
      const juego = await crearJuego();
      await crearMeta(juego._id);
      await crearPartida(juego._id, "2026-11-02", 240);
      await crearPartida(juego._id, "2026-11-03", 180);

      const { body } = await progreso(juego.id);

      expect(body.horasSemana).toBe(7);
      expect(body.porcentajeHoras).toBe(140);
    });

    it("CA-06.8 / CA-07.10 una partida con fecha futura no suma horas, días ni racha", async () => {
      const juego = await crearJuego();
      await crearPartida(juego._id, "2026-11-05", 60);
      await crearPartida(juego._id, "2026-11-06", 60);
      await crearPartida(juego._id, "2026-11-07", 60);

      const { body } = await progreso(juego.id);

      expect(body).toMatchObject({ horasSemana: 1, diasJugadosSemana: 1, rachaActual: 1, mejorRacha: 1 });
    });

    it("CA-06.9 / CA-07.9 las partidas de otro videojuego no cuentan", async () => {
      const juego = await crearJuego("Hades");
      const otro = await crearJuego("Celeste");
      await crearPartida(juego._id, "2026-11-04", 60);
      await crearPartida(otro._id, "2026-11-05", 120);

      const { body } = await progreso(juego.id);

      expect(body).toMatchObject({ horasSemana: 1, diasJugadosSemana: 1, rachaActual: 1 });
    });
  });

  describe("hitos con el avance del resumen de E1 (RB-27)", () => {
    it("CA-08.1 / CA-08.4 usa el avance de la partida más reciente (40 %), no el máximo", async () => {
      const juego = await crearJuego();
      await crearMeta(juego._id, {
        hitos: [
          { descripcion: "Llegar al 25 %", porcentajeObjetivo: 25 },
          { descripcion: "Llegar al 50 %", porcentajeObjetivo: 50 }
        ]
      });
      await crearPartida(juego._id, "2026-11-02", 60, 70);
      await crearPartida(juego._id, "2026-11-03", 60, 40);

      const { body } = await progreso(juego.id);

      expect(body.hitos).toEqual([
        { descripcion: "Llegar al 25 %", porcentajeObjetivo: 25, alcanzado: true },
        { descripcion: "Llegar al 50 %", porcentajeObjetivo: 50, alcanzado: false }
      ]);
    });

    it("CA-08.3 el hito vuelve a pendiente al registrar una partida más reciente con menos avance", async () => {
      const juego = await crearJuego();
      await crearMeta(juego._id, { hitos: [{ descripcion: "Llegar al 50 %", porcentajeObjetivo: 50 }] });
      await crearPartida(juego._id, "2026-11-03", 60, 60);

      expect((await progreso(juego.id)).body.hitos[0].alcanzado).toBe(true);

      await crearPartida(juego._id, "2026-11-04", 30, 40);

      expect((await progreso(juego.id)).body.hitos[0].alcanzado).toBe(false);
    });
  });

  describe("el progreso se recalcula tras cada cambio", () => {
    it("CA-06.10 / CA-06.11 registrar una partida la suma; eliminarla la quita", async () => {
      const juego = await crearJuego();
      await crearPartida(juego._id, "2026-11-04", 60);

      const registro = await request(app).post("/api/partidas").send({
        videojuego: juego.id,
        fecha: "2026-11-05",
        duracionMinutos: 30,
        porcentajeAvance: 20
      });
      expect(registro.status).toBe(201);
      expect((await progreso(juego.id)).body).toMatchObject({ horasSemana: 1.5, diasJugadosSemana: 2, rachaActual: 2 });

      expect((await request(app).delete(`/api/partidas/${registro.body._id}`)).status).toBe(204);
      expect((await progreso(juego.id)).body).toMatchObject({ horasSemana: 1, diasJugadosSemana: 1, rachaActual: 1 });
    });

    it("CA-04.1 editar la meta a 8 h cambia el porcentaje con la meta vigente (D-04)", async () => {
      const juego = await crearJuego();
      const meta = await crearMeta(juego._id);
      await crearPartida(juego._id, "2026-11-02", 120);
      await crearPartida(juego._id, "2026-11-03", 120);

      expect((await progreso(juego.id)).body.porcentajeHoras).toBe(80);

      await request(app).put(`/api/metas/${meta.id}`).send({ horasSemanales: 8, diasPorSemana: 5, hitos: [] });

      expect((await progreso(juego.id)).body).toMatchObject({
        meta: { horasSemanales: 8, diasPorSemana: 5 },
        porcentajeHoras: 50
      });
    });

    it("CA-05.2 tras desactivar la meta, el progreso queda sin meta activa", async () => {
      const juego = await crearJuego();
      const meta = await crearMeta(juego._id, { hitos: [{ descripcion: "Mitad", porcentajeObjetivo: 50 }] });
      await crearPartida(juego._id, "2026-11-04", 60);

      await request(app).patch(`/api/metas/${meta.id}/desactivar`);

      expect((await progreso(juego.id)).body).toMatchObject({
        meta: null,
        porcentajeHoras: null,
        hitos: [],
        horasSemana: 1,
        rachaActual: 1
      });
    });
  });

  describe("errores (RB-30)", () => {
    it("CA-12.2 id con formato inválido: 400", async () => {
      const respuesta = await progreso("abc");

      expect(respuesta.status).toBe(400);
      expect(respuesta.body.mensaje).toBe("El ID proporcionado no es válido");
      expect(typeof respuesta.body.requestId).toBe("string");
    });

    it("CA-12.1 videojuego inexistente: 404, con un mensaje distinto del 400", async () => {
      const respuesta = await progreso(new mongoose.Types.ObjectId().toString());

      expect(respuesta.status).toBe(404);
      expect(respuesta.body.mensaje).toBe("Videojuego no encontrado");
    });
  });

  describe("regresión de E1 (RB-18)", () => {
    it("GET /api/videojuegos/:id/resumen mantiene su contrato y sus valores", async () => {
      const juego = await crearJuego();
      await crearMeta(juego._id);
      await crearPartida(juego._id, "2026-11-02", 60, 20);
      await crearPartida(juego._id, "2026-11-03", 90, 45);
      await crearPartida(juego._id, "2026-11-04", 120, 70);
      await progreso(juego.id); // consultar el progreso no altera nada

      const respuesta = await request(app).get(`/api/videojuegos/${juego.id}/resumen`);

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toEqual({
        videojuegoId: juego.id,
        cantidadPartidas: 3,
        horasTotales: 4.5,
        ultimaSesion: "2026-11-04T00:00:00.000Z",
        porcentajeAvance: 70
      });
    });
  });
});
