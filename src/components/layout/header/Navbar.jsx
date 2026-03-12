import { NavLink, useLocation } from "react-router-dom";
import { ROUTES } from "@routes/index";
import logo from "../../../assets/icons/My__Logo.png";
import "./navbar.css";

const CATEGORIES = [
  { label: "Structure", ids: ["beam", "column", "slab", "foundation"] },
  { label: "Transport", ids: ["road", "bridge"] },
  { label: "Costing", ids: ["boq", "report"] },
];

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <NavLink to="/" className="sidebar__logo">
        <img src={logo} alt="Structure Design Logo" />
      </NavLink>

      <div className="sidebar__divider" />

      {/* Navigation */}
      <nav className="sidebar__nav">
        {CATEGORIES.map((cat) => (
          <div key={cat.label} className="sidebar__group">
            <span className="sidebar__group-label">{cat.label}</span>
            {ROUTES.filter((r) => cat.ids.includes(r.id)).map((route) => (
              <NavLink
                key={route.id}
                to={route.path}
                className={({ isActive }) =>
                  `sidebar__link${isActive ? " sidebar__link--active" : ""}`
                }
              >
                <span className="sidebar__link-icon">{route.icon}</span>
                <span className="sidebar__link-label">{route.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div style={{ flex: 1 }} />

      {/* Dashboard */}
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `sidebar__link sidebar__link--special${isActive ? " sidebar__link--active" : ""}`
        }
      >
        <span className="sidebar__link-icon">📊</span>
        <span className="sidebar__link-label">Dashboard</span>
      </NavLink>

      <div className="sidebar__divider" />

      {/* Badges */}
      <div className="sidebar__badges">
        <span className="sidebar__badge sidebar__badge--is">IS</span>
        <span className="sidebar__badge sidebar__badge--irc">IRC</span>
      </div>
    </aside>
  );
}
