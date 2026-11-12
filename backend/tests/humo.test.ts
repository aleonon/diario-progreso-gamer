// T-04 · Test de humo de la infraestructura.
// Comprueba que Vitest resuelve los imports `.js` del backend (NodeNext),
// que Supertest puede llamar a la app sin levantar el servidor
// y que MongoDB en memoria arranca, acepta escrituras y se detiene.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import mongoose from "mongoose";

import app from "../src/app.js";
import { detenerMongo, iniciarMongo, limpiarColecciones } from "./setup/mongo.js";

describe("T-04 infraestructura de tests", () => {
  beforeAll(iniciarMongo);
  afterAll(detenerMongo);

  it("la app responde en la ruta de comprobación sin cargar .env", async () => {
    const respuesta = await request(app).get("/");

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toEqual({ mensaje: "API Diario Gamer funcionando" });
    expect(respuesta.headers["x-request-id"]).toBeTruthy();
  });

  it("una ruta inexistente responde 404 con requestId (regresión E1)", async () => {
    const respuesta = await request(app).get("/api/no-existe");

    expect(respuesta.status).toBe(404);
    expect(respuesta.body.mensaje).toBe("Ruta no encontrada");
    expect(respuesta.body.requestId).toBeTruthy();
  });

  it("MongoDB en memoria acepta escrituras y se limpia entre tests", async () => {
    const coleccion = mongoose.connection.collection("humo");
    await coleccion.insertOne({ ok: true });
    expect(await coleccion.countDocuments()).toBe(1);

    await limpiarColecciones();
    expect(await coleccion.countDocuments()).toBe(0);
  });
});
