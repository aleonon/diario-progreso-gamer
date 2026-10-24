
import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
  Link
} from "react-router-dom";

import { videojuegosApi } from "../api/videojuegosApi";

import type {
  CrearVideojuegoDTO,
  Plataforma,
  Genero,
  EstadoVideojuego
} from "../types/videojuego.types";

const datosIniciales: CrearVideojuegoDTO = {
  nombre: "",
  plataforma: "PC",
  genero: "accion",
  estado: "jugando",
  logros: []
};

export default function VideojuegoFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const esEdicion = Boolean(id);

  const [formulario, setFormulario] =
    useState<CrearVideojuegoDTO>(datosIniciales);

  const [cargando, setCargando] = useState(
    Boolean(id)
  );

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(
    null
  );

  const [nuevoLogro, setNuevoLogro] = useState("");

  // Cargar datos al editar
  useEffect(() => {
    if (!id) return;

    let activo = true;

    async function cargarVideojuego() {
      try {
        const juego = await videojuegosApi.obtener(id!);

        if (activo) {
          setFormulario({
            nombre: juego.nombre,
            plataforma: juego.plataforma,
            genero: juego.genero,
            estado: juego.estado,

            logros: juego.logros.map((logro) => ({
              _id: logro._id,
              nombre: logro.nombre,
              obtenido: logro.obtenido
            }))

          });
        }
      } catch (err) {
        if (activo) {
          setError(
            err instanceof Error
              ? err.message
              : "Error al cargar el videojuego"
          );
        }
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargarVideojuego();

    return () => {
      activo = false;
    };
  }, [id]);

  function actualizarCampo<
    K extends keyof CrearVideojuegoDTO
  >(
    campo: K,
    valor: CrearVideojuegoDTO[K]
  ) {
    setFormulario(prev => ({
      ...prev,
      [campo]: valor
    }));
  }

  function agregarLogro() {
    const nombre = nuevoLogro.trim();

    if (!nombre) return;

    setFormulario(prev => ({
      ...prev,
      logros: [
        ...prev.logros,
        { nombre, obtenido: false }
      ]
    }));

    setNuevoLogro("");
  }

  function quitarLogro(indice: number) {
    setFormulario(prev => ({
      ...prev,
      logros: prev.logros.filter(
        (_, i) => i !== indice
      )
    }));
  }

  async function guardar(
    event: React.SubmitEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!formulario.nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    setGuardando(true);
    setError(null);

    try {
      if (id) {
        await videojuegosApi.actualizar(
          id,
          formulario
        );

        navigate(`/videojuegos/${id}`);
      } else {
        const creado = await videojuegosApi.crear(
          formulario
        );

        navigate(`/videojuegos/${creado._id}`);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo guardar el videojuego"
      );
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <main className="contenedor">
        <div className="loading-pulse" role="status" aria-label="Cargando videojuego" />
      </main>
    );
  }

  return (
    <main className="contenedor">
      <div className="form-title-wrap">
        <Link to="/" className="detalle-back">← Volver al catálogo</Link>
        <h1 className="page-title">
          {esEdicion ? "Editar videojuego" : "Nuevo videojuego"}
        </h1>
        <p className="texto-secundario">
          {esEdicion
            ? "Actualiza los datos de tu videojuego y sus logros."
            : "Añade un juego a tu biblioteca y empieza a registrar tu progreso."}
        </p>
      </div>

      {error && (
        <p className="mensaje-error form-title-wrap" role="alert">
          {error}
        </p>
      )}

      <form
        onSubmit={guardar}
        className="formulario"
      >
        <label htmlFor="nombre">
          Nombre del videojuego
        </label>

        <input
          id="nombre"
          required
          value={formulario.nombre}
          onChange={e =>
            actualizarCampo(
              "nombre",
              e.target.value
            )
          }
          placeholder="Ej. Hollow Knight"
        />

        <label htmlFor="plataforma">
          Plataforma
        </label>

        <select
          id="plataforma"
          value={formulario.plataforma}
          onChange={e =>
            actualizarCampo(
              "plataforma",
              e.target.value as Plataforma
            )
          }
        >
          <option value="PC">PC</option>
          <option value="PlayStation">
            PlayStation
          </option>
          <option value="Xbox">Xbox</option>
          <option value="Switch">Switch</option>
          <option value="Movil">Móvil</option>
        </select>

        <label htmlFor="genero">Género</label>

        <select
          id="genero"
          value={formulario.genero}
          onChange={e =>
            actualizarCampo(
              "genero",
              e.target.value as Genero
            )
          }
        >
          <option value="accion">Acción</option>
          <option value="rol">Rol</option>
          <option value="estrategia">
            Estrategia
          </option>
          <option value="puzzle">Puzzle</option>
          <option value="deportes">
            Deportes
          </option>
          <option value="otro">Otro</option>
        </select>

        <label htmlFor="estado">Estado</label>

        <select
          id="estado"
          value={formulario.estado}
          onChange={e =>
            actualizarCampo(
              "estado",
              e.target.value as EstadoVideojuego
            )
          }
        >
          <option value="jugando">Jugando</option>
          <option value="pausado">Pausado</option>
          <option value="completado">
            Completado
          </option>
          <option value="abandonado">
            Abandonado
          </option>
        </select>

        <h2>Logros</h2>

        <div className="fila-logro">
          <input
            value={nuevoLogro}
            onChange={e =>
              setNuevoLogro(e.target.value)
            }
            placeholder="Nombre del logro"
          />

          <button
            type="button"
            onClick={agregarLogro}
          >
            Agregar
          </button>
        </div>

        <ul className="lista-logros">
          {formulario.logros.map((logro, i) => (
            <li key={i}>
              <span>{logro.nombre}</span>

              <button
                type="button"
                onClick={() => quitarLogro(i)}
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>

        <div className="acciones-formulario">
          <Link to="/">Cancelar</Link>

          <button
            type="submit"
            className="boton"
            disabled={guardando}
          >
            {guardando
              ? "Guardando..."
              : esEdicion
                ? "Guardar cambios"
                : "Crear videojuego"}
          </button>
        </div>
      </form>
    </main>
  );
}
