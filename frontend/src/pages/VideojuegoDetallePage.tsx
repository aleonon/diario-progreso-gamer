
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
    videojuegosApi
} from "../api/videojuegosApi";
import {
    partidasApi
} from "../api/partidasApi";

import type {
    Videojuego
} from "../types/videojuego.types";
import type {
    Partida
} from "../types/partidas.types";
import type {
    ResumenProgreso as Resumen
} from "../api/videojuegosApi";

import ResumenProgreso from "../components/ResumenProgreso";
import HistorialPartidas from "../components/HistorialPartidas";

export default function VideojuegoDetallePage() {
    const { id } = useParams<{ id: string }>();

    const [videojuego, setVideojuego] =
        useState<Videojuego | null>(null);

    const [resumen, setResumen] =
        useState<Resumen | null>(null);

    const [partidas, setPartidas] =
        useState<Partida[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] =
        useState<string | null>(null);

    const [errorLogro, setErrorLogro] =
        useState<string | null>(null);

    const [actualizandoLogro, setActualizandoLogro] =
        useState<string | null>(null);

    // Consultar los datos del backend
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
                const [
                    datosJuego,
                    datosResumen,
                    datosPartidas
                ] = await Promise.all([
                    videojuegosApi.obtener(id),
                    videojuegosApi.obtenerResumen(id),
                    partidasApi.porVideojuego(id)
                ]);

                if (!activo) return;

                setVideojuego(datosJuego);
                setResumen(datosResumen);
                setPartidas(datosPartidas);

            } catch (err) {
                if (!activo) return;

                setError(
                    err instanceof Error
                        ? err.message
                        : "No se pudieron cargar los datos"
                );
            } finally {
                if (activo) setLoading(false);
            }
        }

        cargarDatos();

        return () => {
            activo = false;
        };
    }, [id]);

    // Actualizar un logro
    async function cambiarLogro(
        logroId: string,
        obtenido: boolean
    ) {
        if (!id || actualizandoLogro) return;

        setActualizandoLogro(logroId);
        setErrorLogro(null);

        try {
            const actualizado =
                await videojuegosApi.actualizarLogro(
                    id,
                    logroId,
                    obtenido
                );

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
                <p role="status">
                    Cargando información del videojuego...
                </p>
            </main>
        );
    }

    if (error || !videojuego) {
        return (
            <main className="contenedor">
                <h1>Error al cargar</h1>
                <p role="alert">
                    {error ?? "Videojuego no encontrado"}
                </p>
                <Link to="/">Volver al catálogo</Link>
            </main>
        );
    }

    return (
        <main className="contenedor">
            <Link to="/">← Volver al catálogo</Link>

            <header className="encabezado">
                <div>
                    <h1>{videojuego.nombre}</h1>
                    <p>
                        {videojuego.plataforma} · {videojuego.genero}
                    </p>
                    <span className="etiqueta">
                        {videojuego.estado}
                    </span>
                </div>

                <Link
                    to={`/videojuegos/${videojuego._id}/editar`}
                    className="boton"
                >
                    Editar videojuego
                </Link>
            </header>

            {/* Estadísticas calculadas */}
            {resumen && (
                <ResumenProgreso resumen={resumen} />
            )}

            {/* Logros */}
            <section className="panel">
                <h2>Logros</h2>

                {errorLogro && (
                    <p role="alert" className="mensaje-error">
                        {errorLogro}
                    </p>
                )}

                {videojuego.logros.length === 0 ? (
                    <p>No hay logros registrados.</p>
                ) : (
                    <ul className="lista-logros">
                        {videojuego.logros.map((logro) => (
                            <li key={logro._id}>
                                <label className="logro-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={logro.obtenido}
                                        disabled={
                                            actualizandoLogro !== null ||
                                            !logro._id
                                        }
                                        onChange={(e) =>
                                            cambiarLogro(
                                                logro._id,
                                                e.target.checked
                                            )
                                        }
                                    />
                                    <span>{logro.nombre}</span>
                                </label>
                            </li>
                        ))}
                    </ul>
                )}

                <p className="resumen-logros">
                    Logros obtenidos:{" "}
                    {videojuego.logros.filter(
                        logro => logro.obtenido
                    ).length}
                    {" / "}
                    {videojuego.logros.length}
                </p>
            </section>

            {/* Sesiones registradas */}
            <HistorialPartidas partidas={partidas} />

            <Link
                to={`/partidas/nueva?videojuego=${videojuego._id}`}
                className="boton"
            >
                + Registrar partida
            </Link>
        </main>
    );
}
