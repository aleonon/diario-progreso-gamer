
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { videojuegosApi } from "../api/videojuegosApi";

import type {
  Videojuego,
  EstadoVideojuego
} from "../types/videojuego.types";

export default function VideojuegosPage() {
  // Videojuegos obtenidos de la API
  const [videojuegos, setVideojuegos] =
    useState<Videojuego[]>([]);

  // Filtro seleccionado
  const [estado, setEstado] =
    useState<EstadoVideojuego | "">("");

  // Estados de la interfaz
  const [loading, setLoading] = useState(true);
  const [error, setError] =
    useState<string | null>(null);

  // Permite repetir una solicitud
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    let activo = true;

    async function cargarVideojuegos() {
      setLoading(true);
      setError(null);

      try {
        // No enviar filtro cuando está en "Todos"
        const datos = await videojuegosApi.listar(
          estado || undefined
        );

        if (!activo) return;

        console.log(
          "Videojuegos recibidos desde la API:",
          datos.length
        );

        setVideojuegos(datos);
      } catch (err) {
        if (!activo) return;

        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar los videojuegos"
        );
      } finally {
        if (activo) {
          setLoading(false);
        }
      }
    }

    cargarVideojuegos();

    return () => {
      activo = false;
    };
  }, [estado, recarga]);

  // Calcular progreso de logros de cada videojuego
  function obtenerProgreso(juego: Videojuego) {
    const logros = juego.logros ?? [];

    const obtenidos = logros.filter(
      logro => logro.obtenido
    ).length;

    const total = logros.length;

    const porcentaje = total > 0
      ? Math.round((obtenidos / total) * 100)
      : 0;

    return {
      obtenidos,
      total,
      porcentaje
    };
  }

  return (
    <main className="contenedor catalogo-page">

      {/* Hero principal */}
      <section className="catalogo-hero">
        <div className="catalogo-hero-contenido">
          <span className="catalogo-eyebrow">
            EXPLORA · ORGANIZA · VIVE TU HISTORIA
          </span>

          <h1>
            Tu universo{" "}
            <span className="texto-acento">
              gamer
            </span>
          </h1>

          <p>
            Explora tu biblioteca, registra tus partidas
            y sigue tu progreso en todos tus videojuegos.
          </p>

          <Link
            to="/videojuegos/nuevo"
            className="boton"
          >
            + Nuevo videojuego
          </Link>
        </div>

        <div
          className="catalogo-hero-decoracion"
          aria-hidden="true"
        >
          <span>🎮</span>
        </div>
      </section>

      {/* Encabezado del catálogo */}
      <section className="catalogo-seccion">
        <div className="catalogo-encabezado">
          <div>
            <h2>Mi biblioteca</h2>

            <p className="texto-secundario">
              {loading
                ? "Cargando biblioteca..."
                : `${videojuegos.length} videojuegos encontrados`}
            </p>
          </div>

          <div className="catalogo-filtros">
            <label htmlFor="filtro-estado">
              Filtrar por estado
            </label>

            <select
              id="filtro-estado"
              value={estado}
              onChange={(e) =>
                setEstado(
                  e.target.value as EstadoVideojuego | ""
                )
              }
            >
              <option value="">Todos</option>
              <option value="jugando">Jugando</option>
              <option value="pausado">Pausado</option>
              <option value="completado">
                Completado
              </option>
              <option value="abandonado">
                Abandonado
              </option>
            </select>
          </div>
        </div>

        {/* Estado de carga */}
        {loading && (
          <div className="catalogo-mensaje" role="status">
            <p>Cargando videojuegos...</p>
          </div>
        )}

        {/* Estado de error */}
        {!loading && error && (
          <div
            className="mensaje-error"
            role="alert"
          >
            <p>{error}</p>

            <button
              type="button"
              className="boton"
              onClick={() =>
                setRecarga(valor => valor + 1)
              }
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Estado vacío */}
        {!loading && !error &&
          videojuegos.length === 0 && (
            <div className="catalogo-mensaje">
              <h3>No se encontraron videojuegos</h3>

              <p>
                {estado
                  ? "No hay videojuegos con el estado seleccionado."
                  : "Tu biblioteca todavía está vacía."}
              </p>

              {estado ? (
                <button
                  type="button"
                  className="boton"
                  onClick={() => setEstado("")}
                >
                  Mostrar todos
                </button>
              ) : (
                <Link
                  to="/videojuegos/nuevo"
                  className="boton"
                >
                  Agregar primer videojuego
                </Link>
              )}
            </div>
          )}

        {/* Catálogo completo */}
        {!loading && !error &&
          videojuegos.length > 0 && (
            <div className="grid-videojuegos">
              {videojuegos.map((juego) => {
                const progreso =
                  obtenerProgreso(juego);

                return (
                  <article
                    key={juego._id}
                    className="tarjeta tarjeta-videojuego"
                  >
                    {/* Imagen decorativa */}
                    <div className="tarjeta-imagen">
                      <span
                        className={`estado-badge estado-${juego.estado}`}
                      >
                        {juego.estado}
                      </span>

                      <span
                        className="tarjeta-placeholder"
                        aria-hidden="true"
                      >
                        🎮
                      </span>
                    </div>

                    {/* Información */}
                    <div className="tarjeta-contenido">
                      <h3>{juego.nombre}</h3>

                      <p className="tarjeta-metadata">
                        {juego.plataforma}
                        {" · "}
                        {juego.genero}
                      </p>

                      {/* Progreso de logros */}
                      <div className="tarjeta-progreso">
                        <div className="tarjeta-progreso-info">
                          <span>Logros</span>

                          <span>
                            {progreso.obtenidos}/
                            {progreso.total}
                          </span>
                        </div>

                        <div
                          className="barra-progreso"
                          role="progressbar"
                          aria-label={`Logros de ${juego.nombre}`}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={
                            progreso.porcentaje
                          }
                        >
                          <div
                            className="barra-progreso-valor"
                            style={{
                              width:
                                `${progreso.porcentaje}%`
                            }}
                          />
                        </div>

                        <span className="tarjeta-porcentaje">
                          {progreso.porcentaje}%
                        </span>
                      </div>

                      {/* Acciones */}
                      <div className="tarjeta-acciones">
                        <Link
                          to={`/videojuegos/${juego._id}`}
                          className="boton"
                        >
                          Ver detalle →
                        </Link>

                        <Link
                          to={`/videojuegos/${juego._id}/editar`}
                          className="boton-secundario"
                        >
                          Editar
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
      </section>
    </main>
  );
}
