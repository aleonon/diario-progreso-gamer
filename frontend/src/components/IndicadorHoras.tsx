// Indicador de horas de la semana frente a la meta (spec frontend §5, RF-07, RF-13).
// D-05: el porcentaje se muestra sin tope (140 %), pero la barra se llena al 100 % sin desbordarse.

interface Props {
  horas: number;
  meta: number | null;
  porcentaje: number | null;
}

const formatoHoras = (valor: number) => valor.toLocaleString("es-EC", { maximumFractionDigits: 1 });

export default function IndicadorHoras({ horas, meta, porcentaje }: Props) {
  const conMeta = meta !== null && porcentaje !== null;
  const ancho = conMeta ? Math.min(porcentaje, 100) : 0;

  return (
    <div className="estadistica">
      <span className="stat-label"><span aria-hidden="true">◷ · </span>Horas esta semana</span>

      <strong>
        {formatoHoras(horas)} h
        {conMeta && <span className="progreso-objetivo"> de {formatoHoras(meta)} h</span>}
      </strong>

      {conMeta && (
        <>
          <span className="progreso-porcentaje">{porcentaje} % de tu meta</span>
          <div
            className="progress-track"
            role="progressbar"
            aria-label="Horas jugadas esta semana frente a tu meta"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={ancho}
            aria-valuetext={`${porcentaje} % de tu meta (${formatoHoras(horas)} de ${formatoHoras(meta)} h)`}
          >
            <div className="progress-fill" style={{ width: `${ancho}%` }} />
          </div>
        </>
      )}
    </div>
  );
}
