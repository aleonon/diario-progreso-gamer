import type { Partida } from "../types/partidas.types";

interface Props {
    partidas: Partida[];
}

export default function HistorialPartidas({ partidas }: Props) {
    return (
        <section className="panel">
            <h2 className="section-title">Historial de partidas</h2>

            {partidas.length === 0 ? (
                <div className="empty-state">
                    <h2>Sin sesiones por ahora</h2>
                    <p>Registra una partida para empezar a ver tu progreso.</p>
                </div>
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
                                        {new Date(partida.fecha).toLocaleDateString("es-EC", {
                                            timeZone: "UTC",
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric"
                                        })}
                                    </td>
                                    <td>{partida.duracionMinutos} min</td>
                                    <td>
                                        <div className="history-progress">
                                            <div
                                                className="progress-track"
                                                role="progressbar"
                                                aria-label={`Avance de la sesión: ${partida.porcentajeAvance}%`}
                                                aria-valuemin={0}
                                                aria-valuemax={100}
                                                aria-valuenow={partida.porcentajeAvance}
                                            >
                                                <div
                                                    className="progress-fill"
                                                    style={{ width: `${partida.porcentajeAvance}%` }}
                                                />
                                            </div>
                                            <span>{partida.porcentajeAvance}%</span>
                                        </div>
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
