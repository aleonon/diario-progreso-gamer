import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { partidasApi } from "../api/partidasApi";
import type { Partida } from "../types/partidas.types";
import type { Videojuego } from "../types/videojuego.types";

function obtenerVideojuego(partida: Partida): Videojuego | null {
    return typeof partida.videojuego === "object" && partida.videojuego !== null
        ? partida.videojuego
        : null;
}

function formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString("es-EC", {
        timeZone: "UTC",
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

export default function PartidasHistoryPage() {
    const [partidas, setPartidas] = useState<Partida[]>([]);
    const [busqueda, setBusqueda] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [eliminando, setEliminando] = useState<string | null>(null);
    const [reload, setReload] = useState(0);

    useEffect(() => {
        let activo = true;

        async function cargarPartidas() {
            setLoading(true);
            setError(null);

            try {
                const datos = await partidasApi.listar();
                if (activo) setPartidas(datos);
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
    }, [reload]);

    const partidasFiltradas = useMemo(() => {
        const termino = busqueda.trim().toLocaleLowerCase("es");
        if (!termino) return partidas;

        return partidas.filter((partida) => {
            const videojuego = obtenerVideojuego(partida);
            return videojuego?.nombre.toLocaleLowerCase("es").includes(termino) ?? false;
        });
    }, [busqueda, partidas]);

    async function eliminarPartida(partida: Partida) {
        const videojuego = obtenerVideojuego(partida);
        const nombre = videojuego?.nombre ?? "esta partida";

        if (!window.confirm(`¿Eliminar la sesión de ${nombre} del ${formatearFecha(partida.fecha)}?`)) {
            return;
        }

        setEliminando(partida._id);
        setError(null);

        try {
            await partidasApi.eliminar(partida._id);
            setPartidas((actuales) => actuales.filter((item) => item._id !== partida._id));
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

    return (
        <main className="contenedor">
            <section className="hero">
                <div className="hero-copy-wrap">
                    <span className="eyebrow">Registra · revive · sigue tu historia</span>
                    <h1 className="hero-title">
                        Historial de
                        <span>partidas</span>
                    </h1>
                    <p className="hero-copy">
                        Cada sesión cuenta. Revisa tus partidas y vuelve a tu aventura cuando quieras.
                    </p>
                </div>
                <div className="hero-art" aria-hidden="true">
                    <div className="hero-orbit" />
                    <div className="hero-device">◷</div>
                </div>
            </section>

            <div className="partidas-layout">
                <section aria-labelledby="partidas-title">
                    <h2 className="section-title" id="partidas-title">Mis partidas</h2>
                    <div className="partidas-toolbar">
                        <input
                            className="search-field"
                            type="search"
                            value={busqueda}
                            onChange={(event) => setBusqueda(event.target.value)}
                            placeholder="Buscar por videojuego..."
                            aria-label="Buscar partidas por videojuego"
                        />
                        {!loading && !error && (
                            <span className="summary-chip">
                                {partidasFiltradas.length} {partidasFiltradas.length === 1 ? "sesión" : "sesiones"}
                            </span>
                        )}
                    </div>

                    {error && (
                        <div className="state-panel" role="alert">
                            <p>{error}</p>
                            <button className="button-secondary" onClick={() => setReload((value) => value + 1)}>
                                Intentar de nuevo
                            </button>
                        </div>
                    )}

                    {loading && (
                        <div className="loading-pulse" role="status" aria-label="Cargando partidas" />
                    )}

                    {!loading && !error && partidasFiltradas.length === 0 && (
                        <div className="empty-state">
                            <h2>{busqueda ? "No hay resultados" : "Aún no hay partidas"}</h2>
                            <p>
                                {busqueda
                                    ? "Prueba con otro nombre de videojuego."
                                    : "Registra una sesión para empezar a construir tu historial."}
                            </p>
                            {!busqueda && (
                                <Link to="/partidas/nueva" className="boton">＋ Registrar partida</Link>
                            )}
                        </div>
                    )}

                    {!loading && !error && partidasFiltradas.length > 0 && (
                        <div className="partidas-list">
                            {partidasFiltradas.map((partida) => {
                                const videojuego = obtenerVideojuego(partida);
                                return (
                                    <article className="partida-card" key={partida._id}>
                                        <div className="partida-game-mark" aria-hidden="true">✦</div>
                                        <div className="partida-card-main">
                                            <div className="partida-card-title">
                                                {videojuego ? (
                                                    <Link to={`/videojuegos/${videojuego._id}`}>
                                                        {videojuego.nombre}
                                                    </Link>
                                                ) : (
                                                    <span>Videojuego no disponible</span>
                                                )}
                                                {videojuego && (
                                                    <span className={`etiqueta status-${videojuego.estado}`}>
                                                        {videojuego.estado}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="partida-card-meta">
                                                {videojuego?.plataforma && <span>{videojuego.plataforma}</span>}
                                                <span>{formatearFecha(partida.fecha)}</span>
                                                <span>{partida.duracionMinutos} min</span>
                                            </div>
                                            <div
                                                className="progress-track"
                                                role="progressbar"
                                                aria-label={`Avance registrado: ${partida.porcentajeAvance}%`}
                                                aria-valuemin={0}
                                                aria-valuemax={100}
                                                aria-valuenow={partida.porcentajeAvance}
                                            >
                                                <div className="progress-fill" style={{ width: `${partida.porcentajeAvance}%` }} />
                                            </div>
                                        </div>
                                        <button
                                            className="boton-eliminar"
                                            type="button"
                                            disabled={eliminando !== null}
                                            onClick={() => eliminarPartida(partida)}
                                        >
                                            {eliminando === partida._id ? "Eliminando..." : "Eliminar"}
                                        </button>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>

                <aside className="partidas-aside">
                    <h2>Registra una nueva partida</h2>
                    <p>Añade una sesión a tu diario gamer y sigue construyendo tu historia.</p>
                    <Link to="/partidas/nueva" className="boton">＋ Registrar partida</Link>
                </aside>
            </div>
        </main>
    );
}
