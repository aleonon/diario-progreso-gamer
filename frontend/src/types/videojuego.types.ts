
export type EstadoVideojuego =
  | "jugando"
  | "pausado"
  | "completado"
  | "abandonado";

export type Plataforma =
  | "PC"
  | "PlayStation"
  | "Xbox"
  | "Switch"
  | "Movil";

export type Genero =
  | "accion"
  | "rol"
  | "estrategia"
  | "puzzle"
  | "deportes"
  | "otro";

export interface Logro {
  _id: string;
  nombre: string;
  obtenido: boolean;
}

export interface Videojuego {
  _id: string;
  nombre: string;
  plataforma: Plataforma;
  genero: Genero;
  estado: EstadoVideojuego;
  logros: Logro[];
  createdAt?: string;
  updatedAt?: string;
}

export type CrearVideojuegoDTO = Pick<
  Videojuego,
  "nombre" | "plataforma" | "genero" |
  "estado"
> & {
  logros: Array<{
    nombre: string;
    obtenido: boolean;
  }>;
};
