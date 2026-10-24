
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { videojuegosApi } from "../api/videojuegosApi";

import type {
  Videojuego,
  EstadoVideojuego
} from "../types/videojuego.types";

function obtenerVarianteIcono(seed: string): number {
  const hash = Array.from(seed).reduce(
    (resultado, caracter) =>
      (resultado * 31 + caracter.charCodeAt(0)) >>> 0,
    0
  );

  return hash % 6;
}

function IconoVideojuego({
  seed,
  className
}: {
  seed: string;
  className: string;
}) {
  const variante = obtenerVarianteIcono(seed);

  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {variante === 0 && (
        <>
          <path d="M18 24h28c5 0 8 3 9 8l3 13c1 5-5 8-9 4l-7-7H22l-7 7c-4 4-10 1-9-4l3-13c1-5 4-8 9-8Z" />
          <path d="M20 31v10M15 36h10M43 33h.1M49 39h.1" />
        </>
      )}
      {variante === 1 && (
        <>
          <path d="m41 9 14 14-25 25-9 2 2-9L41 9Z" />
          <path d="m36 14 14 14M18 46l-7 7M16 42l6 6" />
        </>
      )}
      {variante === 2 && (
        <>
          <path d="M32 7 52 15v15c0 13-8 21-20 27C20 51 12 43 12 30V15L32 7Z" />
          <path d="m23 32 6 6 13-14" />
        </>
      )}
      {variante === 3 && (
        <>
          <path d="m32 6 7 18 19 8-19 7-7 19-7-19-19-7 19-8 7-18Z" />
          <circle cx="32" cy="32" r="5" />
        </>
      )}
      {variante === 4 && (
        <>
          <path d="M32 7c8 10 15 17 15 28a15 15 0 1 1-30 0C17 24 24 17 32 7Z" />
          <path d="M32 28c4 5 6 8 6 12a6 6 0 0 1-12 0c0-4 2-7 6-12Z" />
        </>
      )}
      {variante === 5 && (
        <>
          <path d="m32 7 22 13v24L32 57 10 44V20L32 7Z" />
          <path d="m10 20 22 13 22-13M32 33v24M22 14l22 13" />
        </>
      )}
    </svg>
  );
}

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
          <IconoVideojuego
            seed="diario-gamer-hero"
            className="catalogo-hero-icon"
          />
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
                    className={`tarjeta tarjeta-videojuego genero-${juego.genero} estado-card-${juego.estado}`}
                  >
                    {/* Imagen decorativa */}
                    <div className="tarjeta-imagen">
                      <span
                        className={`estado-badge estado-${juego.estado}`}
                      >
                        {juego.estado}
                      </span>

                      <IconoVideojuego
                        seed={juego._id}
                        className="tarjeta-placeholder"
                      />
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
