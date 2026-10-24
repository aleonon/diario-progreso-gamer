
import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="navbar">
      <NavLink to="/" className="logo">
        Diario Gamer
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
