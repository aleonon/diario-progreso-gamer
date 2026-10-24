
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { partidasApi } from "../api/partidasApi";
import type { Partida } from "../types/partidas.types";

export default function PartidasPage() {
  const [partidas, setPartidas] =
    useState<Partida[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] =
    useState<string | null>(null);

  const [eliminando, setEliminando] =
    useState<string | null>(null);

  // Cargar sesiones desde MongoDB
  useEffect(() => {
    let activo = true;

    async function cargarPartidas() {
      setLoading(true);
      setError(null);

      try {
        const datos = await partidasApi.listar();

        if (activo) {
          setPartidas(datos);
        }
      } catch (err) {
        if (activo) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar las partidas"
          );
        }
      } finally {
        if (activo) setLoading(false);
      }
    }

    cargarPartidas();

    return () => {
      activo = false;
    };
  }, []);

  // Eliminar una partida
  async function eliminarPartida(id: string) {
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar esta partida?"
    );

    if (!confirmar || eliminando !== null) {
      return;
    }

    setEliminando(id);
    setError(null);

    try {
      await partidasApi.eliminar(id);

      // Actualizar la tabla sin recargar
      setPartidas(prev =>
        prev.filter(partida => partida._id !== id)
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar la partida"
      );
    } finally {
      setEliminando(null);
    }
  }

  function obtenerVideojuego(partida: Partida) {
    if (
      partida.videojuego &&
      typeof partida.videojuego === "object"
    ) {
      return partida.videojuego;
    }

    return null;
  }

  function formatearFecha(fecha: string) {
    return new Date(fecha).toLocaleDateString(
      "es-EC",
      {
        timeZone: "UTC",
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  }

  if (loading) {
    return (
      <main className="contenedor">
        <p role="status">
          Cargando partidas...
        </p>
      </main>
    );
  }

  return (
    <main className="contenedor">
      <div className="encabezado">
        <div>
          <h1>Historial de partidas</h1>
          <p>
            Consulta las sesiones registradas
            en tus videojuegos.
          </p>
        </div>

        <Link
          to="/partidas/nueva"
          className="boton"
        >
          + Nueva partida
        </Link>
      </div>

      {error && (
        <div className="mensaje-error" role="alert">
          {error}
        </div>
      )}

      {!error && partidas.length === 0 ? (
        <section className="panel">
          <h2>No hay partidas registradas</h2>

          <p className="texto-secundario">
            Registra tu primera sesión
            para comenzar a medir tu progreso.
          </p>

          <Link
            to="/partidas/nueva"
            className="boton"
          >
            Registrar primera partida
          </Link>
        </section>
      ) : partidas.length > 0 ? (
        <section className="panel">
          <h2>
            Sesiones registradas: {partidas.length}
          </h2>

          <div className="tabla-contenedor">
            <table className="tabla-partidas">
              <thead>
                <tr>
                  <th>Videojuego</th>
                  <th>Fecha</th>
                  <th>Duración</th>
                  <th>Avance</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {partidas.map(partida => {
                  const videojuego =
                    obtenerVideojuego(partida);

                  return (
                    <tr key={partida._id}>
                      <td>
                        {videojuego ? (
                          <Link
                            to={`/videojuegos/${videojuego._id}`}
                          >
                            {videojuego.nombre}
                          </Link>
                        ) : (
                          <span className="texto-secundario">
                            Videojuego no disponible
                          </span>
                        )}
                      </td>

                      <td>
                        {formatearFecha(partida.fecha)}
                      </td>

                      <td>
                        {partida.duracionMinutos} min
                      </td>

                      <td>
                        {partida.porcentajeAvance}%
                      </td>

                      <td>
                        <button
                          type="button"
                          className="boton-eliminar"
                          disabled={eliminando !== null}
                          onClick={() =>
                            eliminarPartida(partida._id)
                          }
                        >
                          {eliminando === partida._id
                            ? "Eliminando..."
                            : "Eliminar"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </main>
  );
}
