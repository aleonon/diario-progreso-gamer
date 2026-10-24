import app from "./app.js"; //resoluci´øn del archivo app.ts y conservaci´øn de un archivo compatible
import { conectarDB } from "./config/conexionDB.js";
import { env } from "./config/env.js";

const iniciarServidor = async (): Promise<void> => {
  try {
    await conectarDB();

    app.listen(env.PORT, () => {
      console.log(
        `Servidor funcionando en http://localhost:${env.PORT}`
      );
    });

  } catch (error) {
    console.error("No se pudo iniciar el servidor");
    process.exit(1);
  }
};

import { Videojuego } from "./models/videojuego.js";

// Después de await conectarDB()
console.log(
  "Base de datos:",
  Videojuego.db.name
);

console.log(
  "Colección:",
  Videojuego.collection.name
);

iniciarServidor();

