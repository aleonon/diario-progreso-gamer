import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { videojuegosApi } from "../api/videojuegosApi";

import type {
    EstadoVideojuego,
    Videojuego
} from "../types/videojuego.types";

const estados: Array<{ valor: EstadoVideojuego | ""; etiqueta: string }> = [
    { valor: "", etiqueta: "Todos" },
    { valor: "jugando", etiqueta: "Jugando" },
    { valor: "pausado", etiqueta: "Pausado" },
    { valor: "completado", etiqueta: "Completado" },
    { valor: "abandonado", etiqueta: "Abandonado" }
];

export default function VideojuegosPage() {
    const [videojuegos, setVideojuegos] = useState<Videojuego[]>([]);
    const [estado, setEstado] = useState<EstadoVideojuego | "">("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reload, setReload] = useState(0);

    useEffect(() => {
        let activo = true;

        async function cargarVideojuegos() {
            setLoading(true);
            setError(null);

            try {
                const datos = await videojuegosApi.listar(estado || undefined);
                if (activo) setVideojuegos(datos);
            } catch (err) {
                if (activo) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "No se pudieron cargar los videojuegos"
                    );
                }
            } finally {
                if (activo) setLoading(false);
            }
        }

        cargarVideojuegos();
        return () => {
            activo = false;
        };
    }, [estado, reload]);

    return (
        <main className="contenedor">
            <section className="hero">
                <div className="hero-copy-wrap">
                    <span className="eyebrow">Explora · organiza · vive tu historia</span>
                    <h1 className="hero-title">
                        Tu universo
                        <span>gamer</span>
                    </h1>
                    <p className="hero-copy">
                        Explora tu biblioteca, registra tus partidas y sigue tu progreso
                        en todos tus videojuegos.
                    </p>
                    <Link to="/videojuegos/nuevo" className="boton">
                        <span aria-hidden="true">＋</span> Nuevo videojuego
                    </Link>
                </div>
                <div className="hero-art" aria-hidden="true">
                    <div className="hero-orbit" />
                    <div className="hero-device">✦</div>
                </div>
            </section>

            <section aria-labelledby="biblioteca-titulo">
                <div className="biblioteca-heading">
                    <h2 className="section-title" id="biblioteca-titulo">
                        Mi biblioteca
                    </h2>
                </div>

                <div className="biblioteca-toolbar">
                    <div className="filtros">
                        <label htmlFor="estado">Filtrar por estado</label>
                        <select
                            id="estado"
                            value={estado}
                            onChange={(event) =>
                                setEstado(event.target.value as EstadoVideojuego | "")
                            }
                        >
                            {estados.map((opcion) => (
                                <option key={opcion.etiqueta} value={opcion.valor}>
                                    {opcion.etiqueta}
                                </option>
                            ))}
                        </select>
                    </div>
                    {!loading && !error && (
                        <span className="result-count">
                            {videojuegos.length} {videojuegos.length === 1 ? "juego" : "juegos"}
                        </span>
                    )}
                </div>

                {loading && (
                    <div className="loading-pulse" role="status" aria-label="Cargando videojuegos" />
                )}

                {!loading && error && (
                    <div className="state-panel" role="alert">
                        <h2>No se pudo cargar la biblioteca</h2>
                        <p>{error}</p>
                        <button className="button-secondary" onClick={() => setReload((value) => value + 1)}>
                            Intentar de nuevo
                        </button>
                    </div>
                )}

                {!loading && !error && videojuegos.length === 0 && (
                    <div className="empty-state">
                        <h2>{estado ? "No hay juegos con este estado" : "Tu biblioteca empieza aquí"}</h2>
                        <p>
                            {estado
                                ? "Prueba otro filtro o revisa más tarde."
                                : "Agrega tu primer videojuego para empezar a registrar tu progreso."}
                        </p>
                        {estado ? (
                            <button className="button-secondary" onClick={() => setEstado("")}>
                                Ver todos
                            </button>
                        ) : (
                            <Link to="/videojuegos/nuevo" className="boton">
                                ＋ Agregar videojuego
                            </Link>
                        )}
                    </div>
                )}

                {!loading && !error && videojuegos.length > 0 && (
                    <div className="grid-videojuegos">
                        {videojuegos.map((juego) => {
                            const logros = juego.logros ?? [];
                            const obtenidos = logros.filter((logro) => logro.obtenido).length;
                            const porcentajeLogros = logros.length
                                ? Math.round((obtenidos / logros.length) * 100)
                                : 0;

                            return (
                                <article className="tarjeta" key={juego._id}>
                                    <div className="tarjeta-imagen">
                                        <span className={`etiqueta status-${juego.estado}`}>
                                            {juego.estado}
                                        </span>
                                        <span className="cover-symbol" aria-hidden="true">✦</span>
                                    </div>
                                    <div className="tarjeta-contenido">
                                        <h2 title={juego.nombre}>{juego.nombre}</h2>
                                        <div className="tarjeta-meta">
                                            <span>{juego.plataforma}</span>
                                            <span aria-hidden="true">·</span>
                                            <span>{juego.genero}</span>
                                        </div>
                                        <div className="achievement-label">
                                            <span>Logros</span>
                                            <strong>{obtenidos}/{logros.length}</strong>
                                        </div>
                                        <div
                                            className="progress-track"
                                            role="progressbar"
                                            aria-label={`Logros obtenidos de ${juego.nombre}`}
                                            aria-valuemin={0}
                                            aria-valuemax={100}
                                            aria-valuenow={porcentajeLogros}
                                        >
                                            <div className="progress-fill" style={{ width: `${porcentajeLogros}%` }} />
                                        </div>
                                        <div className="card-actions">
                                            <Link to={`/videojuegos/${juego._id}`} className="boton">
                                                Ver detalle →
                                            </Link>
                                            <Link to={`/videojuegos/${juego._id}/editar`} className="button-secondary">
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
