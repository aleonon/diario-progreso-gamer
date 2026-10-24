import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { partidasApi } from "../api/partidasApi";
import { videojuegosApi } from "../api/videojuegosApi";
import HistorialPartidas from "../components/HistorialPartidas";
import ResumenProgreso from "../components/ResumenProgreso";

import type { ResumenProgreso as Resumen } from "../api/videojuegosApi";
import type { Partida } from "../types/partidas.types";
import type { Videojuego } from "../types/videojuego.types";

export default function VideojuegoDetallePage() {
    const { id } = useParams<{ id: string }>();
    const [videojuego, setVideojuego] = useState<Videojuego | null>(null);
    const [resumen, setResumen] = useState<Resumen | null>(null);
    const [partidas, setPartidas] = useState<Partida[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [errorLogro, setErrorLogro] = useState<string | null>(null);
    const [actualizandoLogro, setActualizandoLogro] = useState<string | null>(null);

    useEffect(() => {
        let activo = true;

        async function cargarDatos() {
            if (!id) {
                setError("ID de videojuego inválido");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            setErrorLogro(null);
            setVideojuego(null);
            setResumen(null);
            setPartidas([]);

            try {
                const [datosJuego, datosResumen, datosPartidas] = await Promise.all([
                    videojuegosApi.obtener(id),
                    videojuegosApi.obtenerResumen(id),
                    partidasApi.porVideojuego(id)
                ]);

                if (!activo) return;
                setVideojuego(datosJuego);
                setResumen(datosResumen);
                setPartidas(datosPartidas);
            } catch (err) {
                if (activo) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "No se pudieron cargar los datos"
                    );
                }
            } finally {
                if (activo) setLoading(false);
            }
        }

        cargarDatos();
        return () => {
            activo = false;
        };
    }, [id]);

    async function cambiarLogro(logroId: string, obtenido: boolean) {
        if (!id || actualizandoLogro) return;

        setActualizandoLogro(logroId);
        setErrorLogro(null);

        try {
            const actualizado = await videojuegosApi.actualizarLogro(id, logroId, obtenido);
            setVideojuego(actualizado);
        } catch (err) {
            setErrorLogro(
                err instanceof Error
                    ? err.message
                    : "No se pudo actualizar el logro"
            );
        } finally {
            setActualizandoLogro(null);
        }
    }

    if (loading) {
        return (
            <main className="contenedor">
                <div className="loading-pulse" role="status" aria-label="Cargando videojuego" />
            </main>
        );
    }

    if (error || !videojuego) {
        return (
            <main className="contenedor">
                <div className="state-panel" role="alert">
                    <h1>Error al cargar</h1>
                    <p>{error ?? "Videojuego no encontrado"}</p>
                    <Link to="/" className="button-secondary">Volver al catálogo</Link>
                </div>
            </main>
        );
    }

    const logros = videojuego.logros ?? [];
    const obtenidos = logros.filter((logro) => logro.obtenido).length;
    const porcentajeLogros = logros.length
        ? Math.round((obtenidos / logros.length) * 100)
        : 0;

    return (
        <main className="contenedor">
            <Link to="/" className="detalle-back">← Volver a mi biblioteca</Link>

            <section className="detail-hero">
                <div className="detail-cover" aria-hidden="true">✦</div>
                <div className="detail-content">
                    <span className={`etiqueta status-${videojuego.estado}`}>
                        {videojuego.estado}
                    </span>
                    <h1>{videojuego.nombre}</h1>
                    <div className="detail-meta">
                        <span>{videojuego.plataforma}</span>
                        <span aria-hidden="true">·</span>
                        <span>{videojuego.genero}</span>
                    </div>
                    <div className="detail-actions">
                        <Link to={`/videojuegos/${videojuego._id}/editar`} className="button-secondary">
                            Editar videojuego
                        </Link>
                        <Link to={`/partidas/nueva?videojuego=${videojuego._id}`} className="boton">
                            ＋ Registrar partida
                        </Link>
                    </div>
                    <p className="resumen-logros">
                        Logros: {obtenidos}/{logros.length}
                    </p>
                    <div
                        className="progress-track"
                        role="progressbar"
                        aria-label="Logros obtenidos"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={porcentajeLogros}
                    >
                        <div className="progress-fill" style={{ width: `${porcentajeLogros}%` }} />
                    </div>
                </div>
            </section>

            {resumen && <ResumenProgreso resumen={resumen} />}

            <section className="panel">
                <h2 className="section-title">Logros</h2>
                {errorLogro && (
                    <p role="alert" className="mensaje-error">{errorLogro}</p>
                )}
                {logros.length === 0 ? (
                    <p className="texto-secundario">No hay logros registrados.</p>
                ) : (
                    <ul className="logro-list">
                        {logros.map((logro) => (
                            <li key={logro._id}>
                                <label className="logro-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={logro.obtenido}
                                        disabled={actualizandoLogro !== null || !logro._id}
                                        onChange={(event) =>
                                            cambiarLogro(logro._id, event.target.checked)
                                        }
                                    />
                                    <span>{logro.nombre}</span>
                                </label>
                            </li>
                        ))}
                    </ul>
                )}
                <p className="resumen-logros">
                    {obtenidos} de {logros.length} logros obtenidos
                </p>
            </section>

            <HistorialPartidas partidas={partidas} />
        </main>
    );
}
