// T-13 · Modelo Meta contra MongoDB en memoria (spec backend §4, RB-02, RB-03, RB-04, RB-08).
// Las pruebas del CRUD HTTP (H-1 a H-5) se agregarán en T-14 a T-17.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import mongoose from "mongoose";

import { Meta } from "../../src/models/meta.js";
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
