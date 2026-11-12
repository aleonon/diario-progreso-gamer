import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { metasApi } from "../api/metasApi";
import { partidasApi } from "../api/partidasApi";
import { videojuegosApi } from "../api/videojuegosApi";
import HistorialPartidas from "../components/HistorialPartidas";
import MetaAcciones from "../components/MetaAcciones";
import MetasAnteriores from "../components/MetasAnteriores";
import ProgresoSemanal from "../components/ProgresoSemanal";
import ResumenProgreso from "../components/ResumenProgreso";

import type { ResumenProgreso as Resumen } from "../api/videojuegosApi";
import type { Meta, ProgresoSemanal as Progreso } from "../types/metas.types";
import type { Partida } from "../types/partidas.types";
import type { Videojuego } from "../types/videojuego.types";

type EstadoCarga = "cargando" | "error" | "listo";

export default function VideojuegoDetallePage() {
    const { id } = useParams<{ id: string }>();
    const [videojuego, setVideojuego] = useState<Videojuego | null>(null);
    const [resumen, setResumen] = useState<Resumen | null>(null);
    const [partidas, setPartidas] = useState<Partida[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [errorLogro, setErrorLogro] = useState<string | null>(null);
    const [actualizandoLogro, setActualizandoLogro] = useState<string | null>(null);

    // E2 · Progreso semanal: carga independiente de E1 (RF-04). `recarga` fuerza una nueva consulta (RF-05).
    const [progreso, setProgreso] = useState<Progreso | null>(null);
    const [estadoProgreso, setEstadoProgreso] = useState<EstadoCarga>("cargando");
    const [errorProgreso, setErrorProgreso] = useState<string | null>(null);
    const [recarga, setRecarga] = useState(0);
    const [metas, setMetas] = useState<Meta[]>([]);
    const [desactivando, setDesactivando] = useState(false);
    const [errorMeta, setErrorMeta] = useState<string | null>(null);

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

    // RF-04 / RF-05 · Se vuelve a consultar al montar el detalle (p. ej. al volver tras registrar
    // o eliminar una partida), al cambiar de juego y cada vez que cambia `recarga`.
    useEffect(() => {
        let activo = true;

        async function cargarProgreso() {
            if (!id) return;

            setEstadoProgreso("cargando");
            setErrorProgreso(null);

            try {
                const [datosProgreso, datosMetas] = await Promise.all([
                    metasApi.obtenerProgreso(id),
                    metasApi.listarPorVideojuego(id)
                ]);

                if (!activo) return;
                setProgreso(datosProgreso);
                setMetas(datosMetas);
                setEstadoProgreso("listo");
            } catch (err) {
                if (!activo) return;
                setErrorProgreso(
                    err instanceof Error
                        ? err.message
                        : "No se pudo cargar el progreso semanal"
                );
                setEstadoProgreso("error");
            }
        }

        cargarProgreso();
        return () => {
            activo = false;
        };
    }, [id, recarga]);

    // RF-20 · Desactiva la meta activa (la confirmación la pide MetaAcciones) y vuelve a consultar.
    async function desactivarMeta(metaId: string) {
        if (desactivando) return;

        setDesactivando(true);
        setErrorMeta(null);

        try {
            await metasApi.desactivar(metaId);
            setRecarga((valor) => valor + 1);
        } catch (err) {
            setErrorMeta(
                err instanceof Error
                    ? err.message
                    : "No se pudo desactivar la meta"
            );
        } finally {
            setDesactivando(false);
        }
    }

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

    const metaActiva = metas.find((meta) => meta.activa) ?? null;
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

            {estadoProgreso === "cargando" && (
                <section className="panel" aria-label="Progreso semanal">
                    <div className="loading-pulse" role="status" aria-label="Cargando progreso semanal" />
                </section>
            )}

            {estadoProgreso === "error" && (
                <section className="panel" aria-label="Progreso semanal">
                    <div className="state-panel" role="alert">
                        <h2>No se pudo cargar el progreso</h2>
                        <p>{errorProgreso}</p>
                        <button
                            type="button"
                            className="button-secondary"
                            onClick={() => setRecarga((valor) => valor + 1)}
                        >
                            Intentar de nuevo
                        </button>
                    </div>
                </section>
            )}

            {estadoProgreso === "listo" && progreso && (
                <>
                    {errorMeta && (
                        <p role="alert" className="mensaje-error">{errorMeta}</p>
                    )}

                    <ProgresoSemanal
                        progreso={progreso}
                        videojuegoId={videojuego._id}
                        puedeTenerMeta={videojuego.estado === "jugando" || videojuego.estado === "pausado"}
                        acciones={metaActiva && (
                            <MetaAcciones
                                meta={metaActiva}
                                nombreJuego={videojuego.nombre}
                                desactivando={desactivando}
                                onDesactivar={() => desactivarMeta(metaActiva._id)}
                            />
                        )}
                    />

                    <MetasAnteriores metas={metas.filter((meta) => !meta.activa)} />
                </>
            )}

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
