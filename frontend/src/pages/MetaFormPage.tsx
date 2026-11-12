// Formulario para crear y editar la meta de un videojuego (spec frontend §3.3, RF-14 a RF-19).
// Rutas: /videojuegos/:id/meta/nueva y /videojuegos/:id/meta/editar.
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { metasApi } from "../api/metasApi";
import { videojuegosApi } from "../api/videojuegosApi";

import type { Meta, MetaFormDTO } from "../types/metas.types";
import type { Videojuego } from "../types/videojuego.types";

const MAX_HITOS = 5;

interface Props {
  modo: "crear" | "editar";
}

interface HitoFormulario {
  clave: number;
  descripcion: string;
  porcentaje: string;
}

// RF-15 · Mismas reglas y mismos mensajes que validarDatosMeta del backend.
const MENSAJES = {
  horas: "Las horas semanales deben ser un número mayor que 0 y como máximo 100",
  dias: "Los días por semana deben ser un número entero entre 1 y 7",
  faltaHoras: "Falta el campo horasSemanales",
  faltaDias: "Falta el campo diasPorSemana",
  hitosMaximo: "Una meta puede tener como máximo 5 hitos",
  descripcion: "Cada hito necesita una descripción",
  porcentaje: "El porcentaje objetivo de cada hito debe estar entre 1 y 100"
};

function validarFormulario(
  horas: string,
  dias: string,
  hitos: HitoFormulario[]
): { datos: MetaFormDTO } | { error: string } {
  if (!horas.trim()) return { error: MENSAJES.faltaHoras };

  const horasSemanales = Number(horas);
  if (!Number.isFinite(horasSemanales) || horasSemanales <= 0 || horasSemanales > 100) {
    return { error: MENSAJES.horas };
  }

  if (!dias.trim()) return { error: MENSAJES.faltaDias };

  const diasPorSemana = Number(dias);
  if (!Number.isInteger(diasPorSemana) || diasPorSemana < 1 || diasPorSemana > 7) {
    return { error: MENSAJES.dias };
  }

  if (hitos.length > MAX_HITOS) return { error: MENSAJES.hitosMaximo };

  const hitosValidos: MetaFormDTO["hitos"] = [];

  for (const hito of hitos) {
    if (!hito.descripcion.trim()) return { error: MENSAJES.descripcion };

    const porcentajeObjetivo = Number(hito.porcentaje);
    if (!hito.porcentaje.trim() || !Number.isFinite(porcentajeObjetivo) || porcentajeObjetivo < 1 || porcentajeObjetivo > 100) {
      return { error: MENSAJES.porcentaje };
    }

    hitosValidos.push({ descripcion: hito.descripcion.trim(), porcentajeObjetivo });
  }

  return { datos: { horasSemanales, diasPorSemana, hitos: hitosValidos } };
}

export default function MetaFormPage({ modo }: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const siguienteClave = useRef(0);

  const [videojuego, setVideojuego] = useState<Videojuego | null>(null);
  const [metaActiva, setMetaActiva] = useState<Meta | null>(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  const [horas, setHoras] = useState("");
  const [dias, setDias] = useState("");
  const [hitos, setHitos] = useState<HitoFormulario[]>([]);

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nuevaClave = () => {
    siguienteClave.current += 1;
    return siguienteClave.current;
  };

  useEffect(() => {
    let activo = true;

    async function cargar() {
      if (!id) return;

      try {
        const [juego, metas] = await Promise.all([videojuegosApi.obtener(id), metasApi.listarPorVideojuego(id)]);
        if (!activo) return;

        const activa = metas.find((meta) => meta.activa) ?? null;
        setVideojuego(juego);
        setMetaActiva(activa);

        if (modo === "editar" && activa) {
          setHoras(String(activa.horasSemanales));
          setDias(String(activa.diasPorSemana));
          setHitos(
            activa.hitos.map((hito, indice) => ({
              clave: -(indice + 1), // claves estables para los hitos cargados
              descripcion: hito.descripcion,
              porcentaje: String(hito.porcentajeObjetivo)
            }))
          );
        }
      } catch (err) {
        if (activo) setErrorCarga(err instanceof Error ? err.message : "No se pudo cargar el videojuego");
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargar();
    return () => {
      activo = false;
    };
  }, [id, modo]);

  function agregarHito() {
    if (hitos.length >= MAX_HITOS) return;
    setHitos((actuales) => [...actuales, { clave: nuevaClave(), descripcion: "", porcentaje: "" }]);
  }

  function actualizarHito(clave: number, campo: "descripcion" | "porcentaje", valor: string) {
    setHitos((actuales) => actuales.map((hito) => (hito.clave === clave ? { ...hito, [campo]: valor } : hito)));
  }

  function quitarHito(clave: number) {
    setHitos((actuales) => actuales.filter((hito) => hito.clave !== clave));
  }

  async function guardar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (guardando || !id) return;

    const resultado = validarFormulario(horas, dias, hitos);

    if ("error" in resultado) {
      setError(resultado.error);
      return;
    }

    setError(null);
    setGuardando(true);

    try {
      if (modo === "editar" && metaActiva) {
        await metasApi.actualizar(metaActiva._id, resultado.datos);
      } else {
        await metasApi.crear(id, resultado.datos);
      }

      navigate(`/videojuegos/${id}`); // el detalle vuelve a consultar el progreso (RF-05)
    } catch (err) {
      // RF-16 · Se muestra el mensaje del backend y se conservan los valores escritos.
      setError(err instanceof Error ? err.message : "No se pudo guardar la meta");
    } finally {
      setGuardando(false);
    }
  }

  const volver = (
    <Link to={id ? `/videojuegos/${id}` : "/"} className="detalle-back">
      ← Volver al videojuego
    </Link>
  );

  if (cargando) {
    return (
      <main className="contenedor">
        <div className="loading-pulse" role="status" aria-label="Cargando meta" />
      </main>
    );
  }

  if (errorCarga || !videojuego || !id) {
    return (
      <main className="contenedor">
        <div className="state-panel" role="alert">
          <h1>Error al cargar</h1>
          <p>{errorCarga ?? "Videojuego no encontrado"}</p>
          <Link to="/" className="button-secondary">Volver al catálogo</Link>
        </div>
      </main>
    );
  }

  const puedeTenerMeta = videojuego.estado === "jugando" || videojuego.estado === "pausado";
  const titulo = modo === "editar" ? "Editar meta" : "Nueva meta";

  // Estados en los que no se muestra el formulario.
  let aviso: React.ReactNode = null;

  if (modo === "crear" && metaActiva) {
    aviso = (
      <>
        <p>Este videojuego ya tiene una meta activa.</p>
        <Link to={`/videojuegos/${id}/meta/editar`} className="boton">Editar meta</Link>
      </>
    );
  } else if (modo === "crear" && !puedeTenerMeta) {
    aviso = <p>Los juegos completados o abandonados no pueden tener una meta activa.</p>;
  } else if (modo === "editar" && !metaActiva) {
    aviso = (
      <>
        <p>Este videojuego no tiene una meta activa.</p>
        {puedeTenerMeta && <Link to={`/videojuegos/${id}/meta/nueva`} className="boton"><span aria-hidden="true">＋ </span>Crear meta</Link>}
      </>
    );
  }

  return (
    <main className="contenedor">
      <div className="form-title-wrap">
        {volver}
        <h1 className="page-title">{titulo}</h1>
        <p className="texto-secundario">
          {videojuego.nombre} · Define cuántas horas y cuántos días quieres jugar cada semana.
        </p>
      </div>

      {aviso ? (
        <div className="empty-state progreso-sin-meta form-title-wrap">{aviso}</div>
      ) : (
        <form className="formulario" onSubmit={guardar} noValidate>
          {error && (
            <p role="alert" className="mensaje-error">
              {error}
            </p>
          )}

          <label htmlFor="horasSemanales">Horas por semana</label>
          <input
            id="horasSemanales"
            type="number"
            inputMode="decimal"
            min="0.1"
            max="100"
            step="0.1"
            required
            placeholder="Ej. 5"
            value={horas}
            onChange={(e) => setHoras(e.target.value)}
          />

          <label htmlFor="diasPorSemana">Días por semana</label>
          <input
            id="diasPorSemana"
            type="number"
            inputMode="numeric"
            min="1"
            max="7"
            step="1"
            required
            placeholder="Ej. 4"
            value={dias}
            onChange={(e) => setDias(e.target.value)}
          />

          <fieldset className="meta-hitos">
            <legend>Hitos de avance (opcional, máximo {MAX_HITOS})</legend>

            {hitos.length === 0 && <p className="texto-secundario">Aún no agregas hitos.</p>}

            <ul className="lista-logros meta-hitos-lista">
              {hitos.map((hito, indice) => (
                <li key={hito.clave} className="meta-hito-fila">
                  <div className="meta-hito-campo">
                    <label htmlFor={`hito-descripcion-${hito.clave}`}>Descripción del hito {indice + 1}</label>
                    <input
                      id={`hito-descripcion-${hito.clave}`}
                      value={hito.descripcion}
                      placeholder="Ej. Llegar al 50 %"
                      onChange={(e) => actualizarHito(hito.clave, "descripcion", e.target.value)}
                    />
                  </div>

                  <div className="meta-hito-campo meta-hito-porcentaje">
                    <label htmlFor={`hito-porcentaje-${hito.clave}`}>Porcentaje objetivo del hito {indice + 1}</label>
                    <input
                      id={`hito-porcentaje-${hito.clave}`}
                      type="number"
                      inputMode="decimal"
                      min="1"
                      max="100"
                      placeholder="50"
                      value={hito.porcentaje}
                      onChange={(e) => actualizarHito(hito.clave, "porcentaje", e.target.value)}
                    />
                  </div>

                  <button type="button" onClick={() => quitarHito(hito.clave)}>
                    Quitar
                  </button>
                </li>
              ))}
            </ul>

            <div className="meta-hitos-acciones">
              <button
                type="button"
                className="button-secondary"
                onClick={agregarHito}
                disabled={hitos.length >= MAX_HITOS}
              >
                <span aria-hidden="true">＋ </span>Agregar hito
              </button>
              {hitos.length >= MAX_HITOS && <span className="texto-secundario">Máximo 5 hitos</span>}
            </div>
          </fieldset>

          <div className="acciones-formulario">
            <Link to={`/videojuegos/${id}`}>Cancelar</Link>
            <button type="submit" className="boton" disabled={guardando}>
              {guardando ? "Guardando…" : modo === "editar" ? "Guardar cambios" : "Guardar meta"}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
