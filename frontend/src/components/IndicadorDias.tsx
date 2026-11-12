// Indicador de días jugados frente a los días objetivo (spec frontend §5, RF-06).

interface Props {
  dias: number;
  objetivo: number | null;
}

const enDias = (n: number) => (n === 1 ? "1 día" : `${n} días`);

export default function IndicadorDias({ dias, objetivo }: Props) {
  return (
    <div className="estadistica">
      <span className="stat-label"><span aria-hidden="true">▦ · </span>Días jugados</span>

      <strong>
        {objetivo !== null ? (
          <>
            {dias}
            <span className="progreso-objetivo"> de {enDias(objetivo)}</span>
          </>
        ) : (
          enDias(dias)
        )}
      </strong>

      <span className="progreso-porcentaje">
        {objetivo !== null ? "días distintos esta semana" : "esta semana"}
      </span>
    </div>
  );
}
