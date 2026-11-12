// T-13 · Modelo Meta contra MongoDB en memoria (spec backend §4, RB-02, RB-03, RB-04, RB-08).
// T-14 a T-17 · CRUD HTTP de metas (spec backend §5, H-1 a H-5).
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import mongoose from "mongoose";

import app from "../../src/app.js";
import { Meta } from "../../src/models/meta.js";
import { Videojuego } from "../../src/models/videojuego.js";
import { detenerMongo, iniciarMongo, limpiarColecciones } from "../setup/mongo.js";

const idJuego = () => new mongoose.Types.ObjectId();
const metaValida = (videojuego = idJuego(), extra: Record<string, unknown> = {}) => ({
  videojuego,
  horasSemanales: 5,
  diasPorSemana: 4,
  ...extra
});

const esClaveDuplicada = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error && error.code === 11000;

describe("T-13 modelo Meta", () => {
  beforeAll(async () => {
    await iniciarMongo();
    await Meta.init(); // asegura que los índices existen antes de probar la unicidad
  });
  afterAll(detenerMongo);
  beforeEach(limpiarColecciones);

  describe("valores por defecto y timestamps (§4)", () => {
    it("crea la meta activa, sin hitos y con createdAt/updatedAt", async () => {
      const meta = await Meta.create(metaValida());

      expect(meta.activa).toBe(true);
      expect(meta.hitos).toHaveLength(0);
      expect(meta.createdAt).toBeInstanceOf(Date);
      expect(meta.updatedAt).toBeInstanceOf(Date);
      expect(Meta.collection.name).toBe("metas");
    });

    it("referencia al videojuego con un ObjectId obligatorio", async () => {
      expect(Meta.schema.path("videojuego").instance).toBe("ObjectId");
      expect(Meta.schema.path("videojuego").options.ref).toBe("Videojuego");

      await expect(new Meta({ horasSemanales: 5, diasPorSemana: 4 }).validate()).rejects.toThrow(
        mongoose.Error.ValidationError
      );
    });

    it("guarda los hitos embebidos con su descripción recortada", async () => {
      const meta = await Meta.create(
        metaValida(idJuego(), { hitos: [{ descripcion: "  Llegar al 50 %  ", porcentajeObjetivo: 50 }] })
      );

      expect(meta.hitos[0].descripcion).toBe("Llegar al 50 %");
      expect(meta.hitos[0].porcentajeObjetivo).toBe(50);
    });
  });

  describe("validaciones del esquema como segunda barrera (RB-08)", () => {
    const invalida = async (extra: Record<string, unknown>) =>
      expect(new Meta(metaValida(idJuego(), extra)).validate()).rejects.toThrow(
        mongoose.Error.ValidationError
      );

    it("CA-01.4 rechaza 0 h y 100,1 h; acepta 0,1 h y 100 h (CA-01.3)", async () => {
      await invalida({ horasSemanales: 0 });
      await invalida({ horasSemanales: 100.1 });
      await expect(new Meta(metaValida(idJuego(), { horasSemanales: 0.1 })).validate()).resolves.toBeUndefined();
      await expect(new Meta(metaValida(idJuego(), { horasSemanales: 100 })).validate()).resolves.toBeUndefined();
    });

    it("CA-01.6 rechaza 0, 8 y 3,5 días; acepta 1 y 7 (CA-01.5)", async () => {
      await invalida({ diasPorSemana: 0 });
      await invalida({ diasPorSemana: 8 });
      await invalida({ diasPorSemana: 3.5 });
      await expect(new Meta(metaValida(idJuego(), { diasPorSemana: 1 })).validate()).resolves.toBeUndefined();
      await expect(new Meta(metaValida(idJuego(), { diasPorSemana: 7 })).validate()).resolves.toBeUndefined();
    });

    it("CA-01.7 exige horasSemanales y diasPorSemana", async () => {
      await expect(new Meta({ videojuego: idJuego(), diasPorSemana: 4 }).validate()).rejects.toThrow(
        mongoose.Error.ValidationError
      );
      await expect(new Meta({ videojuego: idJuego(), horasSemanales: 5 }).validate()).rejects.toThrow(
        mongoose.Error.ValidationError
      );
    });

    it("CA-02.5 rechaza 6 hitos; CA-02.4 acepta 5", async () => {
      const hitos = (n: number) =>
        Array.from({ length: n }, (_, i) => ({ descripcion: `Hito ${i + 1}`, porcentajeObjetivo: (i + 1) * 10 }));

      await invalida({ hitos: hitos(6) });
      await expect(new Meta(metaValida(idJuego(), { hitos: hitos(5) })).validate()).resolves.toBeUndefined();
    });

    it("CA-02.3 rechaza objetivos de 0 % y 101 %; CA-02.6 rechaza la descripción vacía", async () => {
      await invalida({ hitos: [{ descripcion: "Inicio", porcentajeObjetivo: 0 }] });
      await invalida({ hitos: [{ descripcion: "Más que todo", porcentajeObjetivo: 101 }] });
      await invalida({ hitos: [{ descripcion: "   ", porcentajeObjetivo: 50 }] });
    });
  });

  describe("una sola meta activa por videojuego (RB-02)", () => {
    it("el índice único parcial rechaza una segunda meta activa del mismo juego (error 11000)", async () => {
      const videojuego = idJuego();
      await Meta.create(metaValida(videojuego));

      const error = await Meta.create(metaValida(videojuego)).catch((e: unknown) => e);

      expect(esClaveDuplicada(error)).toBe(true);
      expect(await Meta.countDocuments({ videojuego, activa: true })).toBe(1);
    });

    it("dos creaciones simultáneas: solo una queda activa", async () => {
      const videojuego = idJuego();

      const resultados = await Promise.allSettled([
        Meta.create(metaValida(videojuego)),
        Meta.create(metaValida(videojuego)),
        Meta.create(metaValida(videojuego))
      ]);

      const rechazadas = resultados.filter((r) => r.status === "rejected");
      expect(resultados.filter((r) => r.status === "fulfilled")).toHaveLength(1);
      expect(rechazadas).toHaveLength(2);
      expect(rechazadas.every((r) => esClaveDuplicada((r as PromiseRejectedResult).reason))).toBe(true);
      expect(await Meta.countDocuments({ videojuego, activa: true })).toBe(1);
    });

    it("permite varias metas inactivas y una activa del mismo juego (historial, D-11)", async () => {
      const videojuego = idJuego();
      await Meta.create(metaValida(videojuego, { activa: false }));
      await Meta.create(metaValida(videojuego, { activa: false }));
      await Meta.create(metaValida(videojuego));

      expect(await Meta.countDocuments({ videojuego })).toBe(3);
      expect(await Meta.countDocuments({ videojuego, activa: true })).toBe(1);
    });

    it("permite metas activas en juegos distintos", async () => {
      await Meta.create(metaValida());
      await Meta.create(metaValida());

      expect(await Meta.countDocuments({ activa: true })).toBe(2);
    });

    it("una actualización que dejaría dos metas activas también se rechaza", async () => {
      const videojuego = idJuego();
      await Meta.create(metaValida(videojuego));
      const inactiva = await Meta.create(metaValida(videojuego, { activa: false }));

      const error = await Meta.updateOne({ _id: inactiva._id }, { $set: { activa: true } }).catch(
        (e: unknown) => e
      );

      expect(esClaveDuplicada(error)).toBe(true);
      expect(await Meta.countDocuments({ videojuego, activa: true })).toBe(1);
    });

    it("desactivar la meta activa libera el lugar para una nueva (CA-01.10)", async () => {
      const videojuego = idJuego();
      const primera = await Meta.create(metaValida(videojuego));
      await Meta.updateOne({ _id: primera._id }, { $set: { activa: false } });

      await expect(Meta.create(metaValida(videojuego))).resolves.toBeTruthy();
      expect(await Meta.countDocuments({ videojuego, activa: true })).toBe(1);
    });
  });
});

// ── CRUD HTTP ───────────────────────────────────────────────

type Estado = "jugando" | "pausado" | "completado" | "abandonado";

const crearJuego = (estado: Estado = "jugando", nombre = "Hades") =>
  Videojuego.create({ nombre, plataforma: "PC", genero: "accion", estado });

const cuerpo = (extra: Record<string, unknown> = {}) => ({ horasSemanales: 5, diasPorSemana: 4, ...extra });
const idInexistente = () => new mongoose.Types.ObjectId().toString();

const esperarError = (respuesta: request.Response, status: number, mensaje: string) => {
  expect(respuesta.status).toBe(status);
  expect(respuesta.body.mensaje).toBe(mensaje);
  expect(typeof respuesta.body.requestId).toBe("string");
};

const MSG_DUPLICADA = "Este videojuego ya tiene una meta activa";
const MSG_CERRADO = "Solo los videojuegos en estado jugando o pausado pueden tener una meta activa";
const MSG_ID = "El ID proporcionado no es válido";
const MSG_META_404 = "Meta no encontrada";

describe("CRUD de metas", () => {
  beforeAll(async () => {
    await iniciarMongo();
    await Meta.init();
  });
  afterAll(detenerMongo);
  beforeEach(limpiarColecciones);

  const crearMetaHttp = (videojuegoId: string, datos: Record<string, unknown> = cuerpo()) =>
    request(app).post(`/api/videojuegos/${videojuegoId}/metas`).send(datos);

  describe("T-14 · POST /api/videojuegos/:id/metas", () => {
    it("CA-01.1 crea una meta activa de 5 h y 4 días (201)", async () => {
      const juego = await crearJuego();

      const respuesta = await crearMetaHttp(juego.id);

      expect(respuesta.status).toBe(201);
      expect(respuesta.body).toMatchObject({
        videojuego: juego.id,
        horasSemanales: 5,
        diasPorSemana: 4,
        activa: true,
        hitos: []
      });
      expect(respuesta.body._id).toBeTruthy();
      expect(respuesta.body.createdAt).toBeTruthy();
    });

    it("CA-01.2 permite crear la meta de un juego pausado", async () => {
      const juego = await crearJuego("pausado");

      expect((await crearMetaHttp(juego.id)).status).toBe(201);
    });

    it("CA-02.1 guarda los hitos con su descripción y porcentaje objetivo", async () => {
      const juego = await crearJuego();

      const respuesta = await crearMetaHttp(
        juego.id,
        cuerpo({ hitos: [{ descripcion: "Llegar al 50 %", porcentajeObjetivo: 50 }] })
      );

      expect(respuesta.status).toBe(201);
      expect(respuesta.body.hitos).toMatchObject([{ descripcion: "Llegar al 50 %", porcentajeObjetivo: 50 }]);
    });

    it("rechaza datos inválidos con 400 y el mensaje del catálogo (RB-03, RB-04)", async () => {
      const juego = await crearJuego();

      esperarError(
        await crearMetaHttp(juego.id, cuerpo({ horasSemanales: 0 })),
        400,
        "Las horas semanales deben ser un número mayor que 0 y como máximo 100"
      );
      esperarError(
        await crearMetaHttp(juego.id, cuerpo({ diasPorSemana: 8 })),
        400,
        "Los días por semana deben ser un número entero entre 1 y 7"
      );
      esperarError(await crearMetaHttp(juego.id, { diasPorSemana: 4 }), 400, "Falta el campo horasSemanales");
      expect(await Meta.countDocuments()).toBe(0);
    });

    it("rechaza campos internos o desconocidos con 400 (RB-07)", async () => {
      const juego = await crearJuego();

      esperarError(
        await crearMetaHttp(juego.id, cuerpo({ activa: false, videojuego: idInexistente() })),
        400,
        "Campos no permitidos: activa, videojuego"
      );
    });

    it("CA-12.1 videojuego inexistente: 404 y no se crea nada", async () => {
      esperarError(await crearMetaHttp(idInexistente()), 404, "Videojuego no encontrado");
      expect(await Meta.countDocuments()).toBe(0);
    });

    it("id de videojuego mal formado: 400", async () => {
      esperarError(await crearMetaHttp("abc"), 400, MSG_ID);
    });

    it("CA-01.9 rechaza con 409 un juego completado o abandonado", async () => {
      for (const estado of ["completado", "abandonado"] as const) {
        const juego = await crearJuego(estado);
        esperarError(await crearMetaHttp(juego.id), 409, MSG_CERRADO);
      }
      expect(await Meta.countDocuments()).toBe(0);
    });

    it("CA-01.8 una segunda meta activa da 409 y la primera no cambia", async () => {
      const juego = await crearJuego();
      const primera = await crearMetaHttp(juego.id);

      esperarError(await crearMetaHttp(juego.id, cuerpo({ horasSemanales: 9 })), 409, MSG_DUPLICADA);

      const activas = await Meta.find({ videojuego: juego._id, activa: true });
      expect(activas).toHaveLength(1);
      expect(activas[0].id).toBe(primera.body._id);
      expect(activas[0].horasSemanales).toBe(5);
    });

    it("CA-01.8 creaciones simultáneas: una 201 y el resto 409, con una sola meta activa (RB-02)", async () => {
      const juego = await crearJuego();

      const respuestas = await Promise.all([crearMetaHttp(juego.id), crearMetaHttp(juego.id), crearMetaHttp(juego.id)]);

      expect(respuestas.map((r) => r.status).sort()).toEqual([201, 409, 409]);
      for (const r of respuestas.filter((r) => r.status === 409)) expect(r.body.mensaje).toBe(MSG_DUPLICADA);
      expect(await Meta.countDocuments({ videojuego: juego._id, activa: true })).toBe(1);
    });

    it("CA-01.10 con dos metas desactivadas, crear una nueva da 201 y conserva el historial", async () => {
      const juego = await crearJuego();
      await Meta.create([
        { videojuego: juego._id, horasSemanales: 3, diasPorSemana: 2, activa: false },
        { videojuego: juego._id, horasSemanales: 4, diasPorSemana: 3, activa: false }
      ]);

      expect((await crearMetaHttp(juego.id)).status).toBe(201);
      expect(await Meta.countDocuments({ videojuego: juego._id })).toBe(3);
    });
  });

  describe("T-15 · GET /api/metas/:metaId y GET /api/videojuegos/:id/metas", () => {
    it("CA-03.4 consulta una meta por id con horas, días, hitos y estado", async () => {
      const juego = await crearJuego();
      const creada = await crearMetaHttp(
        juego.id,
        cuerpo({ hitos: [{ descripcion: "Llegar al 25 %", porcentajeObjetivo: 25 }] })
      );

      const respuesta = await request(app).get(`/api/metas/${creada.body._id}`);

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toMatchObject({
        _id: creada.body._id,
        videojuego: juego.id,
        horasSemanales: 5,
        diasPorSemana: 4,
        activa: true,
        hitos: [{ descripcion: "Llegar al 25 %", porcentajeObjetivo: 25 }]
      });
    });

    it("CA-12.3 meta inexistente: 404", async () => {
      esperarError(await request(app).get(`/api/metas/${idInexistente()}`), 404, MSG_META_404);
    });

    it("CA-12.4 id de meta mal formado: 400", async () => {
      esperarError(await request(app).get("/api/metas/abc"), 400, MSG_ID);
    });

    it("CA-03.2 lista la activa primero y después las anteriores, de la más reciente a la más antigua", async () => {
      const juego = await crearJuego();
      const antigua = await Meta.create({ videojuego: juego._id, horasSemanales: 2, diasPorSemana: 2, activa: false });
      const reciente = await Meta.create({ videojuego: juego._id, horasSemanales: 3, diasPorSemana: 3, activa: false });
      const activa = await crearMetaHttp(juego.id);

      const respuesta = await request(app).get(`/api/videojuegos/${juego.id}/metas`);

      expect(respuesta.status).toBe(200);
      expect(respuesta.body.map((m: { _id: string }) => m._id)).toEqual([activa.body._id, reciente.id, antigua.id]);
      expect(respuesta.body.map((m: { activa: boolean }) => m.activa)).toEqual([true, false, false]);
    });

    it("CA-03.1 el listado incluye la meta activa con sus hitos", async () => {
      const juego = await crearJuego();
      await crearMetaHttp(juego.id, cuerpo({ hitos: [{ descripcion: "Llegar al 50 %", porcentajeObjetivo: 50 }] }));

      const [meta] = (await request(app).get(`/api/videojuegos/${juego.id}/metas`)).body;

      expect(meta).toMatchObject({ activa: true, horasSemanales: 5, diasPorSemana: 4 });
      expect(meta.hitos).toHaveLength(1);
    });

    it("CA-03.3 un juego sin metas devuelve una lista vacía (200, no es un error)", async () => {
      const juego = await crearJuego();

      const respuesta = await request(app).get(`/api/videojuegos/${juego.id}/metas`);

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toEqual([]);
    });

    it("CA-03.5 no incluye metas de otro juego", async () => {
      const juegoA = await crearJuego("jugando", "Hades");
      const juegoB = await crearJuego("jugando", "Celeste");
      await crearMetaHttp(juegoA.id);
      await crearMetaHttp(juegoB.id);

      const respuesta = await request(app).get(`/api/videojuegos/${juegoA.id}/metas`);

      expect(respuesta.body).toHaveLength(1);
      expect(respuesta.body[0].videojuego).toBe(juegoA.id);
    });

    it("CA-12.1 listar las metas de un videojuego inexistente: 404; id mal formado: 400", async () => {
      esperarError(await request(app).get(`/api/videojuegos/${idInexistente()}/metas`), 404, "Videojuego no encontrado");
      esperarError(await request(app).get("/api/videojuegos/abc/metas"), 400, MSG_ID);
    });
  });

  describe("T-16 · PUT /api/metas/:metaId", () => {
    const editar = (metaId: string, datos: Record<string, unknown>) =>
      request(app).put(`/api/metas/${metaId}`).send(datos);

    it("CA-04.1 cambia la meta a 8 h y 5 días", async () => {
      const juego = await crearJuego();
      const creada = await crearMetaHttp(juego.id);

      const respuesta = await editar(creada.body._id, { horasSemanales: 8, diasPorSemana: 5, hitos: [] });

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toMatchObject({ _id: creada.body._id, horasSemanales: 8, diasPorSemana: 5, activa: true });
      expect((await Meta.findById(creada.body._id))?.horasSemanales).toBe(8);
    });

    it("CA-04.3 reemplaza la lista completa de hitos", async () => {
      const juego = await crearJuego();
      const creada = await crearMetaHttp(
        juego.id,
        cuerpo({
          hitos: [
            { descripcion: "Llegar al 25 %", porcentajeObjetivo: 25 },
            { descripcion: "Llegar al 50 %", porcentajeObjetivo: 50 }
          ]
        })
      );

      const respuesta = await editar(creada.body._id, {
        ...cuerpo(),
        hitos: [
          { descripcion: "Primer cuarto", porcentajeObjetivo: 25 },
          { descripcion: "Terminar el juego", porcentajeObjetivo: 100 }
        ]
      });

      expect(respuesta.status).toBe(200);
      expect(respuesta.body.hitos.map((h: { descripcion: string }) => h.descripcion)).toEqual([
        "Primer cuarto",
        "Terminar el juego"
      ]);
    });

    it("CA-04.4 una edición inválida da 400 y la meta conserva sus valores", async () => {
      const juego = await crearJuego();
      const creada = await crearMetaHttp(juego.id);
      const seisHitos = Array.from({ length: 6 }, (_, i) => ({ descripcion: `H${i}`, porcentajeObjetivo: 10 + i }));

      esperarError(
        await editar(creada.body._id, { horasSemanales: 0, diasPorSemana: 4, hitos: [] }),
        400,
        "Las horas semanales deben ser un número mayor que 0 y como máximo 100"
      );
      esperarError(
        await editar(creada.body._id, { horasSemanales: 5, diasPorSemana: 8, hitos: [] }),
        400,
        "Los días por semana deben ser un número entero entre 1 y 7"
      );
      esperarError(
        await editar(creada.body._id, { ...cuerpo(), hitos: seisHitos }),
        400,
        "Una meta puede tener como máximo 5 hitos"
      );
      esperarError(await editar(creada.body._id, cuerpo()), 400, "Falta el campo hitos");

      const meta = (await request(app).get(`/api/metas/${creada.body._id}`)).body;
      expect(meta).toMatchObject({ horasSemanales: 5, diasPorSemana: 4, hitos: [] });
    });

    it("CA-04.5 una meta desactivada no se puede editar (409)", async () => {
      const juego = await crearJuego();
      const inactiva = await Meta.create({ videojuego: juego._id, horasSemanales: 5, diasPorSemana: 4, activa: false });

      esperarError(
        await editar(inactiva.id, { ...cuerpo({ horasSemanales: 9 }), hitos: [] }),
        409,
        "Las metas desactivadas no se pueden editar"
      );
      expect((await Meta.findById(inactiva.id))?.horasSemanales).toBe(5);
    });

    it("no permite cambiar el videojuego, el id ni el estado activa (RB-07, RB-14)", async () => {
      const juego = await crearJuego();
      const creada = await crearMetaHttp(juego.id);

      esperarError(
        await editar(creada.body._id, { ...cuerpo(), hitos: [], videojuego: idInexistente() }),
        400,
        "Campos no permitidos: videojuego"
      );
      esperarError(await editar(creada.body._id, { ...cuerpo(), hitos: [], _id: idInexistente() }), 400, "Campos no permitidos: _id");
      expect((await Meta.findById(creada.body._id))?.videojuego.toString()).toBe(juego.id);
    });

    it("CA-12.3 editar una meta inexistente: 404; id mal formado: 400", async () => {
      esperarError(await editar(idInexistente(), { ...cuerpo(), hitos: [] }), 404, MSG_META_404);
      esperarError(await editar("abc", { ...cuerpo(), hitos: [] }), 400, MSG_ID);
    });
  });

  describe("T-17 · PATCH /api/metas/:metaId/desactivar", () => {
    const desactivar = (metaId: string) => request(app).patch(`/api/metas/${metaId}/desactivar`);

    it("CA-05.2 desactiva la meta, la conserva y aparece entre las anteriores", async () => {
      const juego = await crearJuego();
      const creada = await crearMetaHttp(juego.id);

      const respuesta = await desactivar(creada.body._id);

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toMatchObject({ _id: creada.body._id, activa: false });
      expect(await Meta.countDocuments({ _id: creada.body._id })).toBe(1); // no hay borrado físico

      const listado = (await request(app).get(`/api/videojuegos/${juego.id}/metas`)).body;
      expect(listado).toHaveLength(1);
      expect(listado[0].activa).toBe(false);
    });

    it("después de desactivar se puede crear una meta nueva (RB-01)", async () => {
      const juego = await crearJuego();
      const creada = await crearMetaHttp(juego.id);
      await desactivar(creada.body._id);

      expect((await crearMetaHttp(juego.id)).status).toBe(201);
      expect(await Meta.countDocuments({ videojuego: juego._id, activa: true })).toBe(1);
    });

    it("CA-05.4 desactivar una meta ya desactivada da 409", async () => {
      const juego = await crearJuego();
      const creada = await crearMetaHttp(juego.id);
      await desactivar(creada.body._id);

      esperarError(await desactivar(creada.body._id), 409, "La meta ya está desactivada");
    });

    it("CA-05.5 no se puede reactivar: enviar activa: true da 400 y la meta sigue desactivada", async () => {
      const juego = await crearJuego();
      const creada = await crearMetaHttp(juego.id);
      await desactivar(creada.body._id);

      esperarError(
        await request(app).put(`/api/metas/${creada.body._id}`).send({ ...cuerpo(), hitos: [], activa: true }),
        400,
        "Campos no permitidos: activa"
      );
      expect((await Meta.findById(creada.body._id))?.activa).toBe(false);
    });

    it("desactivaciones simultáneas: una 200 y la otra 409", async () => {
      const juego = await crearJuego();
      const creada = await crearMetaHttp(juego.id);

      const respuestas = await Promise.all([desactivar(creada.body._id), desactivar(creada.body._id)]);

      expect(respuestas.map((r) => r.status).sort()).toEqual([200, 409]);
    });

    it("CA-12.3 desactivar una meta inexistente: 404; id mal formado: 400", async () => {
      esperarError(await desactivar(idInexistente()), 404, MSG_META_404);
      esperarError(await desactivar("abc"), 400, MSG_ID);
    });
  });
});
