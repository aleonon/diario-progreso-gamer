// Lista simple de metas desactivadas, sin gráficos (spec frontend §5, RF-21 · RO-06, D-11).
import type { Meta } from "../types/metas.types";

interface Props {
  metas: Meta[];
}

const formatoFecha = new Intl.DateTimeFormat("es-EC", {
  day: "numeric",
  month: "short",
  year: "numeric"
});

const enDias = (n: number) => (n === 1 ? "1 día" : `${n} días`);

export default function MetasAnteriores({ metas }: Props) {
  if (metas.length === 0) return null;

  return (
    <section className="panel" aria-labelledby="metas-anteriores-titulo">
      <h2 className="section-title" id="metas-anteriores-titulo">Metas anteriores</h2>

      <ul className="hito-lista">
        {metas.map((meta) => (
          <li key={meta._id} className="hito-item">
            <span className="hito-descripcion">
              {meta.horasSemanales.toLocaleString("es-EC", { maximumFractionDigits: 1 })} h · {enDias(meta.diasPorSemana)}
              {meta.hitos.length > 0 && (
                <span className="hito-objetivo">
                  {" "}· {meta.hitos.length} {meta.hitos.length === 1 ? "hito" : "hitos"}
                </span>
              )}
            </span>

            <span className="hito-estado">Creada el {formatoFecha.format(new Date(meta.createdAt))}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
