// T-04 · Helper de MongoDB en memoria para los tests de integración (spec backend §8).
// No usa Atlas ni lee variables de entorno: cada archivo de test arranca su propia instancia.
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let servidor: MongoMemoryServer | null = null;

export async function iniciarMongo(): Promise<void> {
  servidor = await MongoMemoryServer.create();
  await mongoose.connect(servidor.getUri(), { dbName: "diario-gamer-test" });
}

export async function limpiarColecciones(): Promise<void> {
  const colecciones = await mongoose.connection.db?.collections();
  for (const coleccion of colecciones ?? []) {
    await coleccion.deleteMany({});
  }
}

export async function detenerMongo(): Promise<void> {
  await mongoose.disconnect();
  await servidor?.stop();
  servidor = null;
}
