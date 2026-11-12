// Lista de hitos con su estado (spec frontend §5, RF-12 · RO-13, D-06).
// El estado se indica con texto («✓ Alcanzado» / «Pendiente»), no solo con color.
import type { HitoEvaluado } from "../types/metas.types";

interface Props {
  hitos: HitoEvaluado[];
}

export default function ListaHitos({ hitos }: Props) {
  return (
    <div className="progreso-hitos">
      <h3 className="progreso-subtitulo">Hitos de avance</h3>

      {hitos.length === 0 ? (
        <p className="texto-secundario">Esta meta no tiene hitos.</p>
      ) : (
        <ul className="hito-lista">
          {hitos.map((hito, indice) => (
            <li
              key={`${indice}-${hito.descripcion}`}
              className={`hito-item ${hito.alcanzado ? "hito-alcanzado" : "hito-pendiente"}`}
            >
              <span className="hito-descripcion">
                {hito.descripcion}
                <span className="hito-objetivo"> · {hito.porcentajeObjetivo} %</span>
              </span>

              <span className="hito-estado">
                {hito.alcanzado ? (
                  <>
                    <span aria-hidden="true">✓ </span>Alcanzado
                  </>
                ) : (
                  "Pendiente"
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
