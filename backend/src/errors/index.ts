// Errores de dominio (T-05 · DT-1 / diagnóstico B4 · spec backend RB-33).
// Cada error hereda de una categoría; errorHandler decide el código HTTP por la categoría,
// así que agregar un error nuevo no exige tocar el middleware.
// Los nombres y mensajes de E1 se conservan sin cambios.

// ── Categorías ──────────────────────────────────────────────

/** 400 · Datos o identificadores inválidos. */
export class SolicitudInvalida extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = new.target.name;
  }
}

/** 404 · Recurso inexistente. */
export class RecursoNoEncontrado extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = new.target.name;
  }
}

/** 409 · Conflicto con el estado actual del recurso. */
export class Conflicto extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = new.target.name;
  }
}

// ── E1 · Videojuegos, partidas y logros ─────────────────────

export class IdInvalido extends SolicitudInvalida {
  constructor() {
    super("El ID proporcionado no es válido");
  }
}

export class DatosPartidaInvalidos extends SolicitudInvalida {}

export class DatosLogroInvalidos extends SolicitudInvalida {
  constructor() {
    super("El campo obtenido debe ser verdadero o falso");
  }
}

export class VideojuegoNoEncontrado extends RecursoNoEncontrado {
  constructor() {
    super("Videojuego no encontrado");
  }
}

export class PartidaNoEncontrada extends RecursoNoEncontrado {
  constructor() {
    super("Partida no encontrada");
  }
}

export class LogroNoEncontrado extends RecursoNoEncontrado {
  constructor() {
    super("Logro no encontrado");
  }
}

// T-32 · DT-3: antes se respondían directamente desde el controlador, sin requestId (RB-36).
export class FiltroEstadoInvalido extends SolicitudInvalida {
  constructor() {
    super("Filtro estado no válido");
  }
}

export class CamposLogroNoPermitidos extends SolicitudInvalida {
  constructor() {
    super("Solo se permite el campo obtenido");
  }
}

export class VideojuegoConPartidas extends Conflicto {
  constructor() {
    super("No se puede eliminar el videojuego porque tiene partidas registradas");
  }
}

// ── E2 · Metas ──────────────────────────────────────────────

export class DatosMetaInvalidos extends SolicitudInvalida {}

export class MetaNoEncontrada extends RecursoNoEncontrado {
  constructor() {
    super("Meta no encontrada");
  }
}

/** RB-01 · Ya existe una meta activa para el videojuego. */
export class MetaActivaDuplicada extends Conflicto {
  constructor() {
    super("Este videojuego ya tiene una meta activa");
  }
}

/** RB-06 / D-07 · Solo los juegos en estado jugando o pausado pueden tener meta activa. */
export class VideojuegoCerrado extends Conflicto {
  constructor() {
    super("Solo los videojuegos en estado jugando o pausado pueden tener una meta activa");
  }
}

/** RB-11 y RB-13 / D-11 · Operación no permitida sobre una meta desactivada. */
export class MetaDesactivada extends Conflicto {}
