
import mongoose from "mongoose";

import { conectarDB } from "../config/conexionDB.js";
import { Videojuego } from "../models/videojuego.js";

async function repararLogros() {
    await conectarDB();

    const coleccion = Videojuego.collection;

    const videojuegos = await coleccion.find({}).toArray();

    let juegosReparados = 0;
    let logrosReparados = 0;

    for (const juego of videojuegos) {
        const logros = juego.logros ?? [];

        let cambios = 0;

        const logrosActualizados = logros.map((logro: { _id: any; }) => {
            if (logro._id) {
                return logro;
            }

            cambios++;

            return {
                ...logro,
                _id: new mongoose.Types.ObjectId()
            };
        });

        if (cambios === 0) continue;

        const resultado = await coleccion.updateOne(
            { _id: juego._id },
            {
                $set: {
                    logros: logrosActualizados
                }
            }
        );

        if (resultado.modifiedCount === 1) {
            juegosReparados++;
            logrosReparados += cambios;

            console.log(
                `${juego.nombre}: ${cambios} logros reparados`
            );
        }
    }

    console.log("Reparación finalizada");
    console.log("Videojuegos:", juegosReparados);
    console.log("Logros:", logrosReparados);
}

async function ejecutarReparacion() {
    try {
        await repararLogros();
    } catch (error) {
        console.error("Error al reparar logros:", error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

void ejecutarReparacion();
