
import type { Partida } from "../types/partidas.types";

interface Props {
  partidas: Partida[];
}

export default function HistorialPartidas({
  partidas
}: Props) {
  return (
    <section className="panel">
      <h2>Historial de partidas</h2>

      {partidas.length === 0 ? (
        <p className="texto-secundario">
          Todavía no tienes sesiones registradas.
        </p>
      ) : (
        <div className="tabla-contenedor">
          <table className="tabla-partidas">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Duración</th>
                <th>Avance</th>
              </tr>
            </thead>

            <tbody>
              {partidas.map((partida) => (
                <tr key={partida._id}>
                  <td>
                    {new Date(partida.fecha)
                      .toLocaleDateString("es-EC", {
                        timeZone: "UTC"
                      })}
                  </td>
                  <td>
                    {partida.duracionMinutos} min
                  </td>
                  <td>
                    {partida.porcentajeAvance}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
