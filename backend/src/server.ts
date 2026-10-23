import app from "./app.js"; //resoluci´øn del archivo app.ts y conservaci´øn de un archivo compatible

//se determina el local host temporal
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `Servidor funcionando en http://localhost:${PORT}`
  );
});
