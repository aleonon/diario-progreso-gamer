
import type {
  Videojuego,
  EstadoVideojuego,
  CrearVideojuegoDTO
} from "../types/videojuego.types";

// URL base del backend
const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error(
    "Falta VITE_API_URL en el archivo .env"
  );
}

// Interfaz del resumen calculado
export interface ResumenProgreso {
  videojuegoId: string;
  cantidadPartidas: number;
  horasTotales: number;
  ultimaSesion: string | null;
  porcentajeAvance: number;
}

// Función centralizada para procesar respuestas HTTP
async function procesarRespuesta<T>(
  respuesta: Response
): Promise<T> {

  // DELETE devuelve 204 sin contenido
  if (respuesta.status === 204) {
    return undefined as T;
  }

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

// Servicios de videojuegos
export const videojuegosApi = {

  // GET: listar todos o filtrar por estado
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

  // GET: obtener videojuego por ID
  obtener: async (id: string) => {
    const respuesta = await fetch(
      `${API_URL}/videojuegos/${encodeURIComponent(id)}`
    );

    return procesarRespuesta<Videojuego>(
      respuesta
    );
  },

  // POST: crear videojuego
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

  // PUT: actualizar videojuego
  actualizar: async (
    id: string,
    datos: CrearVideojuegoDTO
  ) => {
    const respuesta = await fetch(
      `${API_URL}/videojuegos/${encodeURIComponent(id)}`,
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
  },

  // DELETE: eliminar videojuego
  eliminar: async (id: string): Promise<void> => {
    const respuesta = await fetch(
      `${API_URL}/videojuegos/${encodeURIComponent(id)}`,
      {
        method: "DELETE"
      }
    );

    await procesarRespuesta<void>(respuesta);
  },

  // PATCH: marcar o desmarcar un logro
  actualizarLogro: async (
    videojuegoId: string,
    logroId: string,
    obtenido: boolean
  ) => {
    const respuesta = await fetch(
      `${API_URL}/videojuegos/${encodeURIComponent(videojuegoId)}/logros/${encodeURIComponent(logroId)}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          obtenido
        })
      }
    );

    return procesarRespuesta<Videojuego>(
      respuesta
    );
  },

  // GET: obtener estadísticas de progreso
  obtenerResumen: async (id: string) => {
    const respuesta = await fetch(
      `${API_URL}/videojuegos/${encodeURIComponent(id)}/resumen`
    );

    return procesarRespuesta<ResumenProgreso>(
      respuesta
    );
  }

};

