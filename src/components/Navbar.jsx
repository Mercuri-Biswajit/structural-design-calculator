import { NavLink } from "react-router-dom";
import { C, F, badge } from "@styles/tokens";
import { ROUTES } from "@routes/index";

import logo from "../assets/icons/My__Logo.png";

import "../styles/navbar.css";

export default function Navbar() {
  return (
    <header
      className="navbar-header"
      style={{
        background: C.bgCard,
        borderBottom: `1px solid ${C.border}`,
        boxShadow: C.shadow,
      }}
    >
      <div className="navbar-container">
        {/* Logo */}
        <NavLink to="/" className="navbar-logo-link">
          {/* Logo mark — replace with your image */}
          <img src={logo} alt="Structure Logo" style={{ width: 75 }} />
        </NavLink>

        {/* Divider */}
        <div className="navbar-divider" style={{ background: C.border }} />

        {/* Nav links */}
        <nav className="navbar-nav">
          {ROUTES.map((route) => (
            <NavLink
              key={route.id}
              to={route.path}
              title={route.fullLabel}
              className={({ isActive }) =>
                `navbar-link ${isActive ? "active" : ""}`
              }
              style={({ isActive }) => ({
                fontFamily: F.sans,
                color: isActive ? C.green : C.inkLight,
                background: isActive ? C.greenLight : "transparent",
              })}
            >
              <span className="navbar-icon">{route.icon}</span>
              {route.label}
            </NavLink>
          ))}
        </nav>

        {/* Code standard badges */}
        <div className="navbar-badges">
          <span style={badge(C.green, C.greenLight)}>IS Codes</span>
          <span style={badge(C.purple, C.purpleLight)}>IRC</span>
        </div>
      </div>
    </header>
  );
}
