
import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="navbar">
      <NavLink to="/" className="logo">
        <span className="logo-mark" aria-hidden="true">✦</span>
        <span>Diario <span className="logo-accent">Gamer</span></span>
      </NavLink>

      <nav>
        <NavLink to="/">
          Videojuegos
        </NavLink>

        <NavLink to="/partidas">
          Partidas
        </NavLink>
      </nav>
    </header>
  );
}
