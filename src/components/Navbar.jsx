import { NavLink } from "react-router-dom";
import logo from "../assets/icons/My__Logo.png";
import "../styles/navbar.css";

export default function Navbar() {
  return (
    <header className="navbar-header">
      <div className="navbar-container">

        {/* Logo */}
        <NavLink to="/" className="navbar-logo-link">
          <div className="navbar-logo-mark">
            <img src={logo} alt="STRUX Logo" />
          </div>
        </NavLink>

        <div className="navbar-divider" />

        <nav className="navbar-nav">
          <NavLink
            to="/beam"
            end={false}
            className={({ isActive }) =>
              `navbar-link navbar-link--structure${isActive ? " active" : ""}`
            }
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1"  y="5" width="12" height="4"  rx="1.5" fill="white" opacity="0.9" />
              <rect x="1"  y="1" width="3"  height="12" rx="1"   fill="white" opacity="0.4" />
              <rect x="10" y="1" width="3"  height="12" rx="1"   fill="white" opacity="0.4" />
            </svg>
            Structure
          </NavLink>

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `navbar-link navbar-link--dashboard${isActive ? " active" : ""}`
            }
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1"    y="7" width="3.5" height="6"  rx="1" fill="currentColor" />
              <rect x="5.25" y="4" width="3.5" height="9"  rx="1" fill="currentColor" opacity="0.7" />
              <rect x="9.5"  y="1" width="3.5" height="12" rx="1" fill="currentColor" opacity="0.5" />
            </svg>
            Dashboard
          </NavLink>
        </nav>

        <div style={{ flex: 1 }} />

        <div className="navbar-badges">
          <span className="navbar-badge navbar-badge--is">IS Codes</span>
          <span className="navbar-badge navbar-badge--irc">IRC</span>
        </div>

      </div>
    </header>
  );
}