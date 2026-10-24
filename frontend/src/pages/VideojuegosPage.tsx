
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { videojuegosApi } from "../api/videojuegosApi";

import type {
    Videojuego,
    EstadoVideojuego
} from "../types/videojuego.types";

export default function VideojuegosPage() {
    const [videojuegos, setVideojuegos] = useState<
        Videojuego[]
    >([]);

    const [estado, setEstado] = useState<
        EstadoVideojuego | ""
    >("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(
        null
    );

    useEffect(() => {
        let activo = true;

        async function cargarVideojuegos() {
            setLoading(true);
            setError(null);

            try {
                const datos = await videojuegosApi.listar(
                    estado || undefined
                );

                if (activo) {
                    setVideojuegos(datos);
                }
            } catch (err) {
                if (activo) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "No se pudieron cargar los videojuegos"
                    );
                }
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
    }, [estado]);

    return (
        <main className="contenedor">
            <div className="encabezado">
                <div>
                    <h1>Mis videojuegos</h1>
                    <p>
                        Explora tu biblioteca y consulta tu progreso.
                    </p>
                </div>

                <Link
                    to="/videojuegos/nuevo"
                    className="boton"
                >
                    + Nuevo videojuego
                </Link>
            </div>

            <div className="filtros">
                <label htmlFor="estado">
                    Filtrar por estado
                </label>

                <select
                    id="estado"
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

            {loading && (
                <p role="status">
                    Cargando videojuegos...
                </p>
            )}

            {!loading && error && (
                <div role="alert" className="mensaje-error">
                    <p>{error}</p>
                    <button
                        onClick={() => setEstado("")}
                        disabled={estado === ""}
                    >
                        Quitar filtro
                    </button>
                </div>
            )}

            {!loading && !error &&
                videojuegos.length === 0 && (
                    <p>
                        No se encontraron videojuegos.
                    </p>
                )}

            {!loading && !error && (
                <section className="grid-videojuegos">
                    {videojuegos.map((juego) => {
                        const obtenidos = (
                            juego.logros ?? []
                        ).filter(
                            (logro) => logro.obtenido
                        ).length;

                        return (
                            <article
                                key={juego._id}
                                className="tarjeta"
                            >
                                <div className="tarjeta-imagen">
                                    🎮
                                </div>

                                <div className="tarjeta-contenido">
                                    <span className="etiqueta">
                                        {juego.estado}
                                    </span>

                                    <h2>{juego.nombre}</h2>

                                    <p>
                                        {juego.plataforma} · {juego.genero}
                                    </p>

                                    <p>
                                        Logros: {obtenidos}/
                                        {juego.logros?.length ?? 0}
                                    </p>

                                    <Link
                                        to={`/videojuegos/${juego._id}`}
                                    >
                                        Ver detalle →
                                    </Link>
                                </div>
                            </article>
                        );
                    })}
                </section>
            )}
        </main>
    );
}
