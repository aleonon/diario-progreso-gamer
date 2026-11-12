// T-05 · Errores de dominio en un módulo común (DT-1 / diagnóstico B4).
// Spec backend RB-33 y RB-36 · Criterios CA-DT1.1 y CA-DT1.2.
// Los tests de caracterización fijan las respuestas de E1 antes del cambio, para detectar regresiones.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import mongoose from "mongoose";

import app from "../../src/app.js";
import { errorHandler } from "../../src/middlewares/errorHandler.js";
import { Partida } from "../../src/models/partida.js";
import { Videojuego } from "../../src/models/videojuego.js";
import { detenerMongo, iniciarMongo, limpiarColecciones } from "../setup/mongo.js";

const idInexistente = () => new mongoose.Types.ObjectId().toString();

const crearJuego = () =>
  Videojuego.create({
    nombre: "Hades",
    plataforma: "PC",
    genero: "accion",
    estado: "jugando",
    logros: [{ nombre: "Primer escape", obtenido: false }]
  });

const esperarError = (respuesta: request.Response, status: number, mensaje: string) => {
  expect(respuesta.status).toBe(status);
  expect(respuesta.body.mensaje).toBe(mensaje);
  expect(typeof respuesta.body.requestId).toBe("string"); // RB-36
};

describe("T-05 errores de dominio", () => {
  beforeAll(iniciarMongo);
  afterAll(detenerMongo);
  beforeEach(limpiarColecciones);

  describe("CA-DT1.1 los errores de E1 mantienen código y mensaje", () => {
    it("id con formato inválido: 400", async () => {
      esperarError(await request(app).get("/api/videojuegos/abc"), 400, "El ID proporcionado no es válido");
    });

    it("videojuego inexistente: 404", async () => {
      esperarError(await request(app).get(`/api/videojuegos/${idInexistente()}`), 404, "Videojuego no encontrado");
    });

    it("partida inexistente: 404", async () => {
      esperarError(await request(app).delete(`/api/partidas/${idInexistente()}`), 404, "Partida no encontrada");
    });

    it("logro inexistente: 404", async () => {
      const juego = await crearJuego();

      esperarError(
        await request(app).patch(`/api/videojuegos/${juego._id}/logros/${idInexistente()}`).send({ obtenido: true }),
        404,
        "Logro no encontrado"
      );
    });

    it("logro con obtenido no booleano: 400", async () => {
      const juego = await crearJuego();

      esperarError(
        await request(app).patch(`/api/videojuegos/${juego._id}/logros/${juego.logros[0]._id}`).send({ obtenido: "si" }),
        400,
        "El campo obtenido debe ser verdadero o falso"
      );
    });

    it("partida con campos no permitidos: 400", async () => {
      const juego = await crearJuego();

      esperarError(
        await request(app).post("/api/partidas").send({
          videojuego: juego._id.toString(),
          fecha: "2026-11-05",
          duracionMinutos: 60,
          porcentajeAvance: 10,
          extra: true
        }),
        400,
        "Campos no permitidos: extra"
      );
    });

    it("eliminar un videojuego con partidas: 409", async () => {
      const juego = await crearJuego();
      await Partida.create({ videojuego: juego._id, fecha: new Date("2026-11-05"), duracionMinutos: 60, porcentajeAvance: 10 });

      esperarError(
        await request(app).delete(`/api/videojuegos/${juego._id}`),
        409,
        "No se puede eliminar el videojuego porque tiene partidas registradas"
      );
    });

    it("validación de Mongoose al crear un videojuego: 400", async () => {
      const respuesta = await request(app).post("/api/videojuegos").send({ nombre: "Sin plataforma" });

      expect(respuesta.status).toBe(400);
      expect(typeof respuesta.body.requestId).toBe("string");
    });
  });

  describe("CA-DT1.2 cada error hereda de su categoría", () => {
    it("los errores de E1 y de metas heredan de SolicitudInvalida, RecursoNoEncontrado o Conflicto", async () => {
      const errores = await import("../../src/errors/index.js");

      const solicitudInvalida = [
        new errores.IdInvalido(),
        new errores.DatosPartidaInvalidos("x"),
        new errores.DatosLogroInvalidos(),
        new errores.DatosMetaInvalidos("x")
      ];
      const noEncontrados = [
        new errores.VideojuegoNoEncontrado(),
        new errores.PartidaNoEncontrada(),
        new errores.LogroNoEncontrado()
      ];
      const conflictos = [new errores.VideojuegoConPartidas()];

      for (const error of solicitudInvalida) expect(error).toBeInstanceOf(errores.SolicitudInvalida);
      for (const error of noEncontrados) expect(error).toBeInstanceOf(errores.RecursoNoEncontrado);
      for (const error of conflictos) expect(error).toBeInstanceOf(errores.Conflicto);
      for (const error of [...solicitudInvalida, ...noEncontrados, ...conflictos]) {
        expect(error).toBeInstanceOf(Error);
        expect(error.name).toBe(error.constructor.name);
      }
    });

    it("los mensajes de E1 no cambian", async () => {
      const errores = await import("../../src/errors/index.js");

      expect(new errores.IdInvalido().message).toBe("El ID proporcionado no es válido");
      expect(new errores.VideojuegoNoEncontrado().message).toBe("Videojuego no encontrado");
      expect(new errores.PartidaNoEncontrada().message).toBe("Partida no encontrada");
      expect(new errores.LogroNoEncontrado().message).toBe("Logro no encontrado");
      expect(new errores.DatosLogroInvalidos().message).toBe("El campo obtenido debe ser verdadero o falso");
      expect(new errores.VideojuegoConPartidas().message).toBe(
        "No se puede eliminar el videojuego porque tiene partidas registradas"
      );
    });
  });

  describe("T-14 · defensa ante el error 11000 (RB-02)", () => {
    const invocar = (error: unknown) => {
      const res = {
        locals: { requestId: "req-prueba" },
        statusCode: 0,
        cuerpo: undefined as unknown,
        status(codigo: number) {
          this.statusCode = codigo;
          return this;
        },
        json(cuerpo: unknown) {
          this.cuerpo = cuerpo;
          return this;
        }
      };
      errorHandler(error, {} as never, res as never, () => undefined);
      return res;
    };

    it("una clave duplicada que llegue sin convertir responde 409 con el mensaje de RB-01", () => {
      const res = invocar(Object.assign(new Error("E11000 duplicate key"), { code: 11000 }));

      expect(res.statusCode).toBe(409);
      expect(res.cuerpo).toEqual({ mensaje: "Este videojuego ya tiene una meta activa", requestId: "req-prueba" });
    });

    it("CA-12.5 un error inesperado responde 500 sin detalles internos", () => {
      const res = invocar(new Error("fallo interno con datos sensibles"));

      expect(res.statusCode).toBe(500);
      expect(res.cuerpo).toEqual({ mensaje: "Error interno del servidor", requestId: "req-prueba" });
    });
  });

  describe("T-06 · DT-2 errores del parser JSON (RB-34)", () => {
    const juegoValido = () => crearJuego();

    it("CA-DT2.1 un cuerpo mayor que el límite responde 413 y no 500", async () => {
      const respuesta = await request(app)
        .post("/api/partidas")
        .set("Content-Type", "application/json")
        .send(JSON.stringify({ relleno: "a".repeat(110_000) }));

      esperarError(respuesta, 413, "El cuerpo de la solicitud es demasiado grande");
    });

    it("CA-DT2.2 un juego de caracteres no soportado responde 415 y no 500", async () => {
      const respuesta = await request(app)
        .post("/api/partidas")
        .set("Content-Type", "application/json; charset=latin9")
        .send(JSON.stringify({ videojuego: "x" }));

      esperarError(respuesta, 415, "Codificación o juego de caracteres no compatible");
    });

    it("CA-DT2.2 una codificación de contenido no soportada responde 415 y no 500", async () => {
      const respuesta = await request(app)
        .post("/api/partidas")
        .set("Content-Type", "application/json")
        .set("Content-Encoding", "x-desconocida")
        .send(JSON.stringify({ videojuego: "x" }));

      esperarError(respuesta, 415, "Codificación o juego de caracteres no compatible");
    });

    it("CA-DT2.3 el JSON mal formado sigue respondiendo 400 (regresión)", async () => {
      const respuesta = await request(app)
        .post("/api/partidas")
        .set("Content-Type", "application/json")
        .send('{"videojuego": ');

      expect(respuesta.status).toBe(400);
      expect(typeof respuesta.body.requestId).toBe("string");
    });

    it("CA-DT2.3 un cuerpo válido sigue llegando al servicio (regresión)", async () => {
      const juego = await juegoValido();

      const respuesta = await request(app).post("/api/partidas").send({
        videojuego: juego.id,
        fecha: "2026-11-05",
        duracionMinutos: 60,
        porcentajeAvance: 10
      });

      expect(respuesta.status).toBe(201);
    });
  });

  describe("T-32 · DT-3 errores 400 de controladores por el manejo centralizado (RB-36)", () => {
    it("CA-DT3.1 un filtro de estado no permitido responde 400 con mensaje y requestId", async () => {
      esperarError(await request(app).get("/api/videojuegos?estado=xyz"), 400, "Filtro estado no válido");
    });

    it("CA-DT3.2 un cambio de logro con campos extra responde 400 con mensaje y requestId", async () => {
      const juego = await crearJuego();

      esperarError(
        await request(app)
          .patch(`/api/videojuegos/${juego._id}/logros/${juego.logros[0]._id}`)
          .send({ obtenido: true, extra: 1 }),
        400,
        "Solo se permite el campo obtenido"
      );
    });

    it("CA-DT3.3 un filtro válido y la lista sin filtro responden igual que antes (regresión)", async () => {
      await crearJuego();

      const filtrado = await request(app).get("/api/videojuegos?estado=jugando");
      const todos = await request(app).get("/api/videojuegos");
      const vacio = await request(app).get("/api/videojuegos?estado=completado");

      expect(filtrado.status).toBe(200);
      expect(filtrado.body).toHaveLength(1);
      expect(todos.status).toBe(200);
      expect(todos.body).toHaveLength(1);
      expect(vacio.body).toEqual([]);
    });

    it("CA-DT3.3 un cambio de logro válido sigue funcionando (regresión)", async () => {
      const juego = await crearJuego();

      const respuesta = await request(app)
        .patch(`/api/videojuegos/${juego._id}/logros/${juego.logros[0]._id}`)
        .send({ obtenido: true });

      expect(respuesta.status).toBe(200);
      expect(respuesta.body.logros[0].obtenido).toBe(true);
    });

    it("CA-DT1.2 los errores nuevos heredan de SolicitudInvalida", async () => {
      const errores = await import("../../src/errors/index.js");

      expect(new errores.FiltroEstadoInvalido()).toBeInstanceOf(errores.SolicitudInvalida);
      expect(new errores.CamposLogroNoPermitidos()).toBeInstanceOf(errores.SolicitudInvalida);
      expect(new errores.FiltroEstadoInvalido().message).toBe("Filtro estado no válido");
      expect(new errores.CamposLogroNoPermitidos().message).toBe("Solo se permite el campo obtenido");
    });
  });
});
