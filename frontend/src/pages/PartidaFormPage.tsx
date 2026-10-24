
import { useEffect, useState } from "react";
import {
    Link,
    useNavigate,
    useSearchParams
} from "react-router-dom";

import { videojuegosApi } from "../api/videojuegosApi";
import { partidasApi } from "../api/partidasApi";

import type {
    Videojuego
} from "../types/videojuego.types";

import type {
    CrearPartidaDTO
} from "../types/partidas.types";


function obtenerFechaLocal(): string {
    const fecha = new Date();

    const anio = fecha.getFullYear();
    const mes = String(
        fecha.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        fecha.getDate()
    ).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
}


export default function PartidaFormPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Identificador recibido desde el detalle
    const videojuegoPreseleccionado =
        searchParams.get("videojuego") ?? "";

    const [videojuegos, setVideojuegos] =
        useState<Videojuego[]>([]);

    const [seleccionVideojuego, setSeleccionVideojuego] = useState({
        parametro: videojuegoPreseleccionado,
        valor: videojuegoPreseleccionado
    });
    const videojuegoId =
        seleccionVideojuego.parametro === videojuegoPreseleccionado
            ? seleccionVideojuego.valor
            : videojuegoPreseleccionado;


    const [fecha, setFecha] = useState(
        obtenerFechaLocal
    );


    const [duracion, setDuracion] = useState("");
    const [avance, setAvance] = useState("");

    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);

    const [error, setError] =
        useState<string | null>(null);

    // Cargar videojuegos para el selector
    useEffect(() => {
        let activo = true;

        async function cargarVideojuegos() {
            setCargando(true);
            setError(null);

            try {
                const datos = await videojuegosApi.listar();

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
                    setCargando(false);
                }
            }
        }

        cargarVideojuegos();

        return () => {
            activo = false;
        };
    }, []);

    async function guardar(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (guardando) return;

        setError(null);

        if (!videojuegoId) {
            setError("Selecciona un videojuego");
            return;
        }

        if (!videojuegos.some(j => j._id === videojuegoId)) {
            setError("El videojuego seleccionado no existe en el catálogo");
            return;
        }

        if (!fecha) {
            setError("Selecciona una fecha");
            return;
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
            setError("La fecha no es válida");
            return;
        }

        const minutos = Number(duracion);
        const porcentaje = Number(avance);

        if (
            !duracion.trim() ||
            !Number.isInteger(minutos) ||
            minutos < 1
        ) {
            setError(
                "La duración debe ser un número entero mayor a 0"
            );
            return;
        }

        if (
            !avance.trim() ||
            !Number.isFinite(porcentaje) ||
            porcentaje < 0 ||
            porcentaje > 100
        ) {
            setError(
                "El avance debe estar entre 0 y 100"
            );
            return;
        }

        const datos: CrearPartidaDTO = {
            videojuego: videojuegoId,
            fecha,
            duracionMinutos: minutos,
            porcentajeAvance: porcentaje
        };

        setGuardando(true);

        try {
            await partidasApi.crear(datos);

            // La pantalla detalle consultará
            // nuevamente las estadísticas
            navigate(`/videojuegos/${videojuegoId}`);

        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudo registrar la partida"
            );
        } finally {
            setGuardando(false);
        }
    }

    if (cargando) {
        return (
            <main className="contenedor">
                <div className="loading-pulse" role="status" aria-label="Cargando videojuegos" />
            </main>
        );
    }

    return (
        <main className="contenedor">
            <div className="form-title-wrap">
            <Link to="/partidas" className="detalle-back">
                ← Volver a partidas
            </Link>

            <h1 className="page-title">Registrar nueva partida</h1>
            <p className="texto-secundario">
                Registra una sesión para actualizar
                tu progreso.
            </p>
            </div>

            {error && (
                <p role="alert" className="mensaje-error form-title-wrap">
                    {error}
                </p>
            )}

            {videojuegos.length === 0 ? (
                <div className="panel form-title-wrap">
                    <p>
                        No tienes videojuegos registrados.
                    </p>
                    <Link to="/videojuegos/nuevo" className="boton">
                        Crear videojuego
                    </Link>
                </div>
            ) : (
                <form
                    className="formulario"
                    onSubmit={guardar}
                >
                    <label htmlFor="videojuego">
                        Videojuego
                    </label>

                    <select
                        id="videojuego"
                        required
                        value={videojuegoId}
                        onChange={e => setSeleccionVideojuego({
                            parametro: videojuegoPreseleccionado,
                            valor: e.target.value
                        })}
                    >
                        <option value="">
                            Selecciona un videojuego
                        </option>

                        {videojuegos.map(juego => (
                            <option
                                key={juego._id}
                                value={juego._id}
                            >
                                {juego.nombre} ({juego.plataforma})
                            </option>
                        ))}
                    </select>

                    <label htmlFor="fecha">
                        Fecha de la partida
                    </label>

                    <input
                        id="fecha"
                        type="date"
                        required
                        value={fecha}
                        onChange={e => setFecha(e.target.value)}
                    />

                    <label htmlFor="duracion">
                        Duración en minutos
                    </label>

                    <input
                        id="duracion"
                        type="number"
                        min="1"
                        step="1"
                        required
                        placeholder="Ej. 90"
                        value={duracion}
                        onChange={e => setDuracion(e.target.value)}
                    />

                    <label htmlFor="avance">
                        Porcentaje de avance
                    </label>

                    <input
                        id="avance"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        required
                        placeholder="Ej. 45"
                        value={avance}
                        onChange={e => setAvance(e.target.value)}
                    />

                    <div className="acciones-formulario">
                        <Link to="/">
                            Cancelar
                        </Link>

                        <button
                            type="submit"
                            className="boton"
                            disabled={guardando}
                        >
                            {guardando
                                ? "Guardando..."
                                : "Registrar partida"}
                        </button>
                    </div>
                </form>
            )}
        </main>
    );
}
