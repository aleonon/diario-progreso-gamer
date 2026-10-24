
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Navbar from "./components/Navbar";
import VideojuegosPage from "./pages/VideojuegosPage";
import VideojuegoFormPage from "./pages/VideojuegoFormPage";



function PaginaPendiente() {
  return (
    <main className="contenedor">
      <h1>Próximamente</h1>
      <p>
        Esta pantalla se implementará
        en la siguiente etapa.
      </p>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={<VideojuegosPage />}
        />

        <Route
          path="/videojuegos/nuevo"
          element={<VideojuegoFormPage />}
        />

        <Route
          path="/videojuegos/:id/editar"
          element={<VideojuegoFormPage />}
        />

        <Route
          path="/videojuegos/:id"
          element={<PaginaPendiente />}
        />

        <Route
          path="/partidas"
          element={<PaginaPendiente />}
        />

        <Route
          path="/partidas/nueva"
          element={<PaginaPendiente />}
        />

        <Route
          path="*"
          element={<h1>Página no encontrada</h1>}
        />
      </Routes>
    </BrowserRouter>
  );
}

