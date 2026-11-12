// Acciones sobre la meta activa: editar y desactivar con confirmación (spec frontend §5, RF-20).
import { Link } from "react-router-dom";

import type { Meta } from "../types/metas.types";

interface Props {
  meta: Meta;
  nombreJuego: string;
  desactivando: boolean;
  onDesactivar: () => void;
}

export default function MetaAcciones({ meta, nombreJuego, desactivando, onDesactivar }: Props) {
  function confirmarDesactivacion() {
    // RF-20 · Si se cancela, no se llama a la API.
    if (window.confirm(`¿Desactivar la meta de ${nombreJuego}?`)) {
      onDesactivar();
    }
  }

  return (
    <div className="detail-actions progreso-acciones">
      <Link to={`/videojuegos/${meta.videojuego}/meta/editar`} className="button-secondary">
        Editar meta
      </Link>

      <button type="button" className="boton-eliminar" onClick={confirmarDesactivacion} disabled={desactivando}>
        {desactivando ? "Desactivando…" : "Desactivar meta"}
      </button>
    </div>
  );
}
