import { NavLink } from "react-router-dom";
import { C, F } from "@styles/tokens";
import logo from "../assets/icons/My__Logo.png";

export default function Navbar() {
  return (
    <header
      style={{
        background: "#ffffff",
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
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          height: 64,
          gap: 24,
        }}
      >
        {/* Logo */}
        <NavLink
          to="/"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
          }}
        >
          <img
            src={logo}
            alt="Structure Design Logo"
            style={{ width: 75, objectFit: "contain" }}
          />
        </NavLink>

        <div style={{ width: 1, height: 26, background: C.border }} />

        <nav style={{ display: "flex", gap: 10 }}>
          {/* Structure → goes to /beam (first module) */}
          <NavLink
            to="/beam"
            end={false}
            style={({ isActive }) => {
              // treat any non-dashboard page as "Structure" active
              return {
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "7px 16px",
                borderRadius: 8,
                textDecoration: "none",
                fontSize: 13.5,
                fontWeight: isActive ? 700 : 500,
                fontFamily: F.sans,
                color: "#fff",
                background: C.navy,
                border: `1.5px solid ${C.navy}`,
                transition: "all 0.15s ease",
                boxShadow: `0 2px 8px ${C.navyGlow}`,
              };
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect
                x="1"
                y="5"
                width="12"
                height="4"
                rx="1.5"
                fill="white"
                opacity="0.9"
              />
              <rect
                x="1"
                y="1"
                width="3"
                height="12"
                rx="1"
                fill="white"
                opacity="0.4"
              />
              <rect
                x="10"
                y="1"
                width="3"
                height="12"
                rx="1"
                fill="white"
                opacity="0.4"
              />
            </svg>
            Structure
          </NavLink>

          <NavLink
            to="/dashboard"
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "7px 16px",
              borderRadius: 8,
              textDecoration: "none",
              fontSize: 13.5,
              fontWeight: isActive ? 700 : 500,
              fontFamily: F.sans,
              color: isActive ? "#fff" : C.orange,
              background: isActive ? C.orange : C.orangeLight,
              border: `1.5px solid ${isActive ? C.orange : C.orange + "40"}`,
              transition: "all 0.15s ease",
            })}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect
                x="1"
                y="7"
                width="3.5"
                height="6"
                rx="1"
                fill="currentColor"
              />
              <rect
                x="5.25"
                y="4"
                width="3.5"
                height="9"
                rx="1"
                fill="currentColor"
                opacity="0.7"
              />
              <rect
                x="9.5"
                y="1"
                width="3.5"
                height="12"
                rx="1"
                fill="currentColor"
                opacity="0.5"
              />
            </svg>
            Dashboard
          </NavLink>
        </nav>

        <div style={{ flex: 1 }} />

        <div style={{ display: "flex", gap: 6 }}>
          <span
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              background: C.navyLight,
              color: C.navy,
              fontSize: 10.5,
              fontFamily: F.mono,
              fontWeight: 700,
              letterSpacing: "0.5px",
              border: `1px solid ${C.navy}18`,
            }}
          >
            IS Codes
          </span>
          <span
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              background: C.orangeLight,
              color: C.orange,
              fontSize: 10.5,
              fontFamily: F.mono,
              fontWeight: 700,
              letterSpacing: "0.5px",
              border: `1px solid ${C.orange}30`,
            }}
          >
            IRC
          </span>
        </div>
      </div>
    </header>
  );
}
