
import type {
  ResumenProgreso as Resumen
} from "../api/videojuegosApi";

interface Props {
  resumen: Resumen;
}

export default function ResumenProgreso({
  resumen
}: Props) {
  const fecha = resumen.ultimaSesion
    ? new Date(resumen.ultimaSesion)
        .toLocaleDateString("es-EC", {
          timeZone: "UTC",
          day: "2-digit",
          month: "short",
          year: "numeric"
        })
    : "Sin sesiones";

  return (
    <section className="panel">
      <h2 className="section-title">Resumen de progreso</h2>

      <div className="resumen-grid">
        <div className="estadistica">
          <span className="stat-label">◷ · Horas jugadas</span>
          <strong>
            {resumen.horasTotales.toFixed(1)} h
          </strong>
        </div>

        <div className="estadistica">
          <span className="stat-label">✦ · Partidas registradas</span>
          <strong>{resumen.cantidadPartidas}</strong>
        </div>

        <div className="estadistica">
          <span className="stat-label">▥ · Avance actual</span>
          <strong>{resumen.porcentajeAvance}%</strong>
        </div>

        <div className="estadistica">
          <span className="stat-label">▦ · Última sesión</span>
          <strong>{fecha}</strong>
        </div>
      </div>

      <div
        className="barra-progreso"
        role="progressbar"
        aria-label="Avance del videojuego"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={resumen.porcentajeAvance}
      >
        <div
          className="barra-progreso-valor"
          style={{
            width: `${resumen.porcentajeAvance}%`
          }}
        />
      </div>
    </section>
  );
}
