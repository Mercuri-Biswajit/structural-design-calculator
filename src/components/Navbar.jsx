import { NavLink } from "react-router-dom";
import { C, F, badge } from "@styles/tokens";
import { ROUTES } from "@routes/index";

export default function Navbar() {
  return (
    <header
      style={{
        background: C.bgCard,
        borderBottom: `1px solid ${C.border}`,
        boxShadow: C.shadow,
        position: "sticky",
        top: 0,
        zIndex: 200,
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "10px 24px",
          display: "flex",
          alignItems: "center",
          height: 75,
          gap: 20,
        }}
      >
        {/* Logo */}
        <NavLink
          to="/"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 9,
            flexShrink: 0,
          }}
        >
          {/* Logo mark — two stacked I-beam sections */}
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: C.green,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
              <rect x="2" y="2" width="13" height="2.5" fill="white" rx="0.5" />
              <rect
                x="2"
                y="12.5"
                width="13"
                height="2.5"
                fill="white"
                rx="0.5"
              />
              <rect x="7" y="4.5" width="3" height="8" fill="white" rx="0.5" />
            </svg>
          </div>

          <div>
            <div
              style={{
                fontFamily: F.sans,
                fontSize: 15,
                fontWeight: 800,
                color: C.ink,
                letterSpacing: "2.5px",
                lineHeight: 1,
              }}
            >
              STRUCTURE
            </div>
            <div
              style={{
                fontFamily: F.mono,
                fontSize: 9,
                color: C.inkLight,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                marginTop: 2,
              }}
            >
              DESIGN SUITE
            </div>
          </div>
        </NavLink>

        {/* Divider */}
        <div
          style={{ width: 1, height: 20, background: C.border, flexShrink: 0 }}
        />

        {/* Nav links */}
        <nav
          style={{
            display: "flex",
            gap: 2,
            overflowX: "auto",
            flex: 1,
            scrollbarWidth: "none",
          }}
        >
          {ROUTES.map((route) => (
            <NavLink
              key={route.id}
              to={route.path}
              title={route.fullLabel}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 11px",
                borderRadius: 6,
                textDecoration: "none",
                whiteSpace: "nowrap",
                flexShrink: 0,
                fontSize: 12.5,
                fontFamily: F.sans,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? C.green : C.inkLight,
                background: isActive ? C.greenLight : "transparent",
                transition: "all 0.14s ease",
              })}
            >
              <span style={{ fontSize: 11, opacity: 0.75 }}>{route.icon}</span>
              {route.label}
            </NavLink>
          ))}
        </nav>

        {/* Code standard badges */}
        <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
          <span style={badge(C.green, C.greenLight)}>IS Codes</span>
          <span style={badge(C.purple, C.purpleLight)}>IRC</span>
        </div>
      </div>
    </header>
  );
}
