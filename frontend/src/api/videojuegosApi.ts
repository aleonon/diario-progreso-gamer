
import type {
    Videojuego,
    EstadoVideojuego,
    CrearVideojuegoDTO
} from "../types/videojuego.types";

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
    throw new Error(
        "Falta VITE_API_URL en el archivo .env"
    );
}

async function procesarRespuesta<T>(
    respuesta: Response
): Promise<T> {
    if (!respuesta.ok) {
        const error = await respuesta
            .json()
            .catch(() => ({}));

        throw new Error(
            error.mensaje ||
            `Error HTTP ${respuesta.status}`
        );
    }

    return respuesta.json() as Promise<T>;
}

export const videojuegosApi = {
    // Obtener todos o filtrar por estado
    listar: async (estado?: EstadoVideojuego) => {
        const query = estado
            ? `?estado=${encodeURIComponent(estado)}`
            : "";

        const respuesta = await fetch(
            `${API_URL}/videojuegos${query}`
        );

        return procesarRespuesta<Videojuego[]>(
            respuesta
        );
    },

    // Obtener un videojuego
    obtener: async (id: string) => {
        const respuesta = await fetch(
            `${API_URL}/videojuegos/${id}`
        );

        return procesarRespuesta<Videojuego>(
            respuesta
        );
    },

    // Crear
    crear: async (datos: CrearVideojuegoDTO) => {
        const respuesta = await fetch(
            `${API_URL}/videojuegos`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datos)
            }
        );

        return procesarRespuesta<Videojuego>(
            respuesta
        );
    },

    actualizar: async (
        id: string,
        datos: CrearVideojuegoDTO
    ) => {
        const respuesta = await fetch(
            `${API_URL}/videojuegos/${id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datos)
            }
        );

        return procesarRespuesta<Videojuego>(
            respuesta
        );
    }

};
