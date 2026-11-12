// Racha actual y mejor racha (spec frontend §5, RF-06 · D-01).
// Se muestran tal como las calcula el backend: no se recalculan en el cliente.

interface Props {
  actual: number;
  mejor: number;
}

const enDias = (n: number) => (n === 1 ? "1 día" : `${n} días`);

export default function RachasJuego({ actual, mejor }: Props) {
  return (
    <>
      <div className="estadistica">
        <span className="stat-label"><span aria-hidden="true">✦ · </span>Racha actual</span>
        <strong>{enDias(actual)}</strong>
        <span className="progreso-porcentaje">seguidos jugando</span>
      </div>

      <div className="estadistica">
        <span className="stat-label"><span aria-hidden="true">▥ · </span>Mejor racha</span>
        <strong>{enDias(mejor)}</strong>
        <span className="progreso-porcentaje">en todo tu historial</span>
      </div>
    </>
  );
}
