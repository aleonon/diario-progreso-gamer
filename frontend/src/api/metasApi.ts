// Servicio de metas y progreso semanal · E2 (spec frontend §4, RF-01 a RF-03).
// Es el único punto del frontend que llama a las rutas de E2; los componentes no usan fetch.
import type {
  Meta,
  MetaFormDTO,
  ProgresoSemanal
} from "../types/metas.types";

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error("Falta VITE_API_URL");
}

// Mismo patrón que los servicios de E1 (decisión C-7: el cliente HTTP compartido, B5, está diferido).
// Si la respuesta no es ok, lanza el `mensaje` del backend tal cual (RF-16).
async function procesarRespuesta<T>(respuesta: Response): Promise<T> {
  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));

    throw new Error(error.mensaje || `Error HTTP ${respuesta.status}`);
  }

  return respuesta.json() as Promise<T>;
}

// RF-03 · Solo se envían los campos que acepta el backend; nunca _id, activa ni videojuego.
const cuerpoMeta = (datos: MetaFormDTO): string =>
  JSON.stringify({
    horasSemanales: datos.horasSemanales,
    diasPorSemana: datos.diasPorSemana,
    hitos: datos.hitos.map(({ descripcion, porcentajeObjetivo }) => ({ descripcion, porcentajeObjetivo }))
  });

const JSON_HEADERS = { "Content-Type": "application/json" };

export const metasApi = {
  // H-2 · GET /videojuegos/:id/metas (la activa primero)
  listarPorVideojuego: async (videojuegoId: string) => {
    const respuesta = await fetch(`${API_URL}/videojuegos/${encodeURIComponent(videojuegoId)}/metas`);

    return procesarRespuesta<Meta[]>(respuesta);
  },

  // H-3 · GET /metas/:metaId
  obtener: async (metaId: string) => {
    const respuesta = await fetch(`${API_URL}/metas/${encodeURIComponent(metaId)}`);

    return procesarRespuesta<Meta>(respuesta);
  },

  // H-1 · POST /videojuegos/:id/metas
  crear: async (videojuegoId: string, datos: MetaFormDTO) => {
    const respuesta = await fetch(`${API_URL}/videojuegos/${encodeURIComponent(videojuegoId)}/metas`, {
      method: "POST",
      headers: JSON_HEADERS,
      body: cuerpoMeta(datos)
    });

    return procesarRespuesta<Meta>(respuesta);
  },

  // H-4 · PUT /metas/:metaId (horas, días e hitos son obligatorios)
  actualizar: async (metaId: string, datos: MetaFormDTO) => {
    const respuesta = await fetch(`${API_URL}/metas/${encodeURIComponent(metaId)}`, {
      method: "PUT",
      headers: JSON_HEADERS,
      body: cuerpoMeta(datos)
    });

    return procesarRespuesta<Meta>(respuesta);
  },

  // H-5 · PATCH /metas/:metaId/desactivar (sin cuerpo)
  desactivar: async (metaId: string) => {
    const respuesta = await fetch(`${API_URL}/metas/${encodeURIComponent(metaId)}/desactivar`, {
      method: "PATCH"
    });

    return procesarRespuesta<Meta>(respuesta);
  },

  // H-6 · GET /videojuegos/:id/progreso-semanal
  obtenerProgreso: async (videojuegoId: string) => {
    const respuesta = await fetch(
      `${API_URL}/videojuegos/${encodeURIComponent(videojuegoId)}/progreso-semanal`
    );

    return procesarRespuesta<ProgresoSemanal>(respuesta);
  }
};
