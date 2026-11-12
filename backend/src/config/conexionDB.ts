import mongoose from "mongoose";
import { env } from "./env.js";

export const conectarDB = async (): Promise<void> => {
    try {
        await mongoose.connect(env.MONGODB_URI);

        console.log("MongoDB Atlas conectado correctamente");
        console.log(`Base de datos: ${mongoose.connection.name}`);

    } catch (error) {
        console.error("Error al conectar con MongoDB:", error);
        throw error;
    }
};
