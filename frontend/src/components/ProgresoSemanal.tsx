// Panel «Progreso semanal» del detalle del videojuego (spec frontend §5 y §6).
// Muestra los datos tal como llegan del backend; no calcula estadísticas propias.
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import IndicadorDias from "./IndicadorDias";
import IndicadorHoras from "./IndicadorHoras";
import ListaHitos from "./ListaHitos";
import RachasJuego from "./RachasJuego";

import type { ProgresoSemanal as Progreso } from "../types/metas.types";

interface Props {
  progreso: Progreso;
  videojuegoId: string;
  /** D-07: solo los juegos «jugando» o «pausado» pueden tener meta activa. */
  puedeTenerMeta: boolean;
  /** Acciones de la meta activa (editar / desactivar), si existen. */
  acciones?: ReactNode;
}

// RF-13 · El rango se formatea en UTC (igual que las fechas de E1) para no desplazar un día.
const formatoDia = new Intl.DateTimeFormat("es-EC", { timeZone: "UTC", day: "numeric" });
const formatoMes = new Intl.DateTimeFormat("es-EC", { timeZone: "UTC", month: "short" });

function rangoSemana(inicio: string, fin: string): string {
  const desde = new Date(`${inicio}T00:00:00.000Z`);
  const hasta = new Date(`${fin}T00:00:00.000Z`);
  const mesDesde = formatoMes.format(desde);
  const mesHasta = formatoMes.format(hasta);

  return mesDesde === mesHasta
    ? `Semana del ${formatoDia.format(desde)} al ${formatoDia.format(hasta)} de ${mesHasta}`
    : `Semana del ${formatoDia.format(desde)} de ${mesDesde} al ${formatoDia.format(hasta)} de ${mesHasta}`;
}

export default function ProgresoSemanal({ progreso, videojuegoId, puedeTenerMeta, acciones }: Props) {
  const { meta } = progreso;
  const sinPartidasEstaSemana = progreso.horasSemana === 0 && progreso.diasJugadosSemana === 0;

  return (
    <section className="panel progreso-semanal" aria-labelledby="progreso-semanal-titulo">
      <div className="progreso-encabezado">
        <div>
          <h2 className="section-title" id="progreso-semanal-titulo">Progreso semanal</h2>
          <p className="texto-secundario progreso-semana">{rangoSemana(progreso.semana.inicio, progreso.semana.fin)}</p>
        </div>

        {meta && acciones}
      </div>

      {meta && <p className="progreso-aviso">El progreso se compara con tu meta actual.</p>}

      <div className="resumen-grid progreso-grid">
        <IndicadorHoras horas={progreso.horasSemana} meta={meta?.horasSemanales ?? null} porcentaje={progreso.porcentajeHoras} />
        <IndicadorDias dias={progreso.diasJugadosSemana} objetivo={meta?.diasPorSemana ?? null} />
        <RachasJuego actual={progreso.rachaActual} mejor={progreso.mejorRacha} />
      </div>

      {sinPartidasEstaSemana && <p className="texto-secundario progreso-nota">Aún no has jugado esta semana.</p>}

      {meta ? (
        <ListaHitos hitos={progreso.hitos} />
      ) : (
        <div className="empty-state progreso-sin-meta">
          {puedeTenerMeta ? (
            <>
              <p>Aún no tienes una meta para este juego. Crea una para seguir tu semana.</p>
              <Link to={`/videojuegos/${videojuegoId}/meta/nueva`} className="boton">
                <span aria-hidden="true">＋ </span>Crear meta
              </Link>
            </>
          ) : (
            <p>Los juegos completados o abandonados no pueden tener una meta activa.</p>
          )}
        </div>
      )}
    </section>
  );
}
