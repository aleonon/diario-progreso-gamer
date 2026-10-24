
export interface Partida {
  _id: string;
  videojuego: string;
  fecha: string;
  duracionMinutos: number;
  porcentajeAvance: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CrearPartidaDTO {
  videojuego: string;
  fecha: string;
  duracionMinutos: number;
  porcentajeAvance: number;
}
