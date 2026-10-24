
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Navbar from "./components/Navbar";
import VideojuegosPage from "./pages/VideojuegosPage";
import VideojuegoFormPage from "./pages/VideojuegoFormPage";
import VideojuegoDetallePage from "./pages/VideojuegoDetallePage";

import PartidaFormPage from "./pages/PartidaFormPage";
import PartidasHistoryPage from "./pages/PartidasHistoryPage";



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
          element={<VideojuegoDetallePage />}
        />



        <Route
          path="/partidas"
          element={<PartidasHistoryPage />}
        />



        <Route
          path="/partidas/nueva"
          element={<PartidaFormPage />}
        />


        <Route
          path="*"
          element={<h1>Página no encontrada</h1>}
        />
      </Routes>
    </BrowserRouter>
  );
}
