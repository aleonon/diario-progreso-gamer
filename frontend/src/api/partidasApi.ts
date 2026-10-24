
import type {
  Partida,
  CrearPartidaDTO
} from "../types/partidas.types";

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error("Falta VITE_API_URL");
}

async function procesarRespuesta<T>(
  respuesta: Response
): Promise<T> {
  if (!respuesta.ok) {
    const error = await respuesta.json().catch(
      () => ({})
    );

    throw new Error(
      error.mensaje ||
      `Error HTTP ${respuesta.status}`
    );
  }

  if (respuesta.status === 204) {
    return undefined as T;
  }

  return respuesta.json() as Promise<T>;
}

export const partidasApi = {
  // Todas las partidas
  listar: async () => {
    const respuesta = await fetch(
      `${API_URL}/partidas`
    );

    return procesarRespuesta<Partida[]>(respuesta);
  },

  // Partidas de un videojuego
  porVideojuego: async (id: string) => {
    const respuesta = await fetch(
      `${API_URL}/videojuegos/${encodeURIComponent(id)}/partidas`
    );

    return procesarRespuesta<Partida[]>(respuesta);
  },

  // Registrar una nueva sesión
  crear: async (datos: CrearPartidaDTO) => {
    const respuesta = await fetch(
      `${API_URL}/partidas`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(datos)
      }
    );

    return procesarRespuesta<Partida>(respuesta);
  },

  // Eliminar una sesión
  eliminar: async (id: string): Promise<void> => {
    const respuesta = await fetch(
      `${API_URL}/partidas/${encodeURIComponent(id)}`,
      {
        method: "DELETE"
      }
    );

    await procesarRespuesta<void>(respuesta);
  }
};
