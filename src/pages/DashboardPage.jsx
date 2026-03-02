import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { C, F } from "@styles/tokens";
import { SectionTitle } from "@components/ui";
import { loadProjects, saveProjects } from "../hooks/useSaveToProject";

// ── HELPERS ───────────────────────────────────────────────────
const MODULE_META = {
  beam: { label: "Beam Design", icon: "━", color: C.navy },
  column: { label: "Column Design", icon: "║", color: "#1a4080" },
  slab: { label: "Slab Design", icon: "▭", color: C.green },
  foundation: { label: "Foundation", icon: "⊓", color: "#0891b2" },
  road: { label: "Road Design", icon: "↗", color: "#7c3aed" },
  bridge: { label: "Bridge Loads", icon: "⌒", color: "#9333ea" },
  boq: { label: "Estimation & BOQ", icon: "₹", color: C.orange },
};

function timeAgo(iso) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000),
    h = Math.floor(diff / 3600000),
    d = Math.floor(diff / 86400000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ── MODULE SUMMARY ────────────────────────────────────────────
function ModuleSummaryCard({ moduleId, snapshot }) {
  const meta = MODULE_META[moduleId] || {
    label: moduleId,
    icon: "◈",
    color: C.navy,
  };
  const { data } = snapshot;
  const color = meta.color;

  const rows = [];
  if (moduleId === "beam" && data.result) {
    rows.push({ label: "Span", value: `${data.span} m`, tag: data.support });
    rows.push({
      label: "Section",
      value: `${data.b}×${data.d} mm`,
      tag: data.material,
    });
    rows.push({
      label: "Max Moment",
      value: `${data.result.maxM?.toFixed(2)} kNm`,
    });
    rows.push({
      label: "Max Shear",
      value: `${data.result.maxV?.toFixed(2)} kN`,
    });
    if (data.check) {
      rows.push({
        label: "Flexure",
        value: data.check.pass ? "PASS" : "FAIL",
        pass: data.check.pass,
      });
      rows.push({
        label: "Shear",
        value: data.check.shearPass ? "PASS" : "FAIL",
        pass: data.check.shearPass,
      });
      rows.push({
        label: "Deflection",
        value: data.check.deflPass ? "PASS" : "FAIL",
        pass: data.check.deflPass,
      });
      rows.push({
        label: "Ast prov.",
        value: `${data.check.nBars}⌀${data.check.barDia} (${data.check.Ast_prov} mm²)`,
      });
      rows.push({
        label: "Stirrups",
        value: `⌀${data.check.stirrupDia}@${data.check.stirrupSpc}mm`,
      });
    }
  } else if (moduleId === "column" && data.result) {
    rows.push({
      label: "Section",
      value: `${data.b}×${data.d} mm`,
      tag: data.material,
    });
    rows.push({ label: "Axial P", value: `${data.P} kN` });
    rows.push({ label: "Capacity Pu", value: `${data.result.Pu_cap} kN` });
    rows.push({
      label: "Slenderness",
      value: data.result.isSlender ? "SLENDER" : "SHORT",
    });
    rows.push({
      label: "Axial check",
      value: data.result.pass ? "PASS" : "FAIL",
      pass: data.result.pass,
    });
    rows.push({
      label: "Biaxial",
      value: data.result.biaxialPass ? "PASS" : "FAIL",
      pass: data.result.biaxialPass,
    });
  } else if (moduleId === "slab" && data.result) {
    rows.push({
      label: "Spans Lx×Ly",
      value: `${data.Lx}×${data.Ly} m`,
      tag: data.result.isTwoWay ? "Two-way" : "One-way",
    });
    rows.push({ label: "Thickness", value: `${data.thickness} mm` });
    rows.push({
      label: "Total load",
      value: `${(data.wDL || 0) + (data.wLL || 0)} kN/m²`,
    });
    rows.push({ label: "Mx", value: `${data.result.Mx} kNm/m` });
    rows.push({
      label: "Steel Lx",
      value: `⌀${data.result.selDiaX}@${data.result.spcX}mm`,
    });
    rows.push({
      label: "Flexure",
      value: data.result.pass ? "PASS" : "FAIL",
      pass: data.result.pass,
    });
    rows.push({
      label: "Deflection",
      value: data.result.deflPass ? "PASS" : "FAIL",
      pass: data.result.deflPass,
    });
  } else if (moduleId === "foundation" && data.result) {
    rows.push({ label: "Type", value: data.type });
    rows.push({ label: "Load P", value: `${data.P} kN` });
    rows.push({ label: "Size", value: `${data.result.B}×${data.result.L} m` });
    rows.push({ label: "Net pressure", value: `${data.result.qnet} kN/m²` });
    rows.push({
      label: "Ast/m",
      value: `⌀${data.result.barDia}@${data.result.spcOk}mm`,
    });
    rows.push({
      label: "Bearing",
      value: data.result.passSBC ? "PASS" : "FAIL",
      pass: data.result.passSBC,
    });
    rows.push({
      label: "Flexure",
      value: data.result.passM ? "PASS" : "FAIL",
      pass: data.result.passM,
    });
    rows.push({
      label: "Punching",
      value: data.result.punchPass ? "PASS" : "FAIL",
      pass: data.result.punchPass,
    });
  } else if (moduleId === "road") {
    if (data.hCurve) {
      rows.push({ label: "Speed", value: `${data.V} km/h` });
      rows.push({
        label: "Radius R",
        value: `${data.R} m`,
        tag: `Δ=${data.delta}°`,
      });
      rows.push({ label: "Curve L", value: `${data.hCurve.L} m` });
      rows.push({
        label: "Horiz curve",
        value: data.hCurve.passRadius ? "PASS" : "FAIL",
        pass: data.hCurve.passRadius,
      });
    }
    if (data.vCurve)
      rows.push({
        label: "Vert curve",
        value: data.vCurve.pass ? "PASS" : "FAIL",
        pass: data.vCurve.pass,
      });
    if (data.pavement)
      rows.push({
        label: "Pavement",
        value: `${data.pavement.total} mm total`,
      });
  } else if (moduleId === "bridge" && data.result) {
    rows.push({
      label: "Span",
      value: `${data.span} m`,
      tag: `Class ${data.vc}`,
    });
    rows.push({ label: "Design Mtotal", value: `${data.result.Mtotal} kNm` });
    rows.push({ label: "Impact factor", value: `${data.result.impactPct}%` });
  } else if (moduleId === "boq") {
    const vol = (data.length || 0) * (data.width || 0) * (data.height || 0);
    rows.push({ label: "Volume", value: `${vol.toFixed(2)} m³` });
    rows.push({ label: "Grade", value: data.grade || "—" });
  }

  const passRows = rows.filter((r) => r.pass !== undefined && r.pass !== null);
  const overallPass = passRows.length ? passRows.every((r) => r.pass) : null;

  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${C.border}`,
        borderTop: `3px solid ${color}`,
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      {/* Card header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "11px 14px 10px",
          borderBottom: `1px solid ${C.border}`,
          background: `${color}07`,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            background: `${color}18`,
            border: `1px solid ${color}28`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            color,
            fontFamily: F.mono,
            flexShrink: 0,
          }}
        >
          {meta.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 700,
              color: C.ink,
              fontFamily: F.sans,
            }}
          >
            {meta.label}
          </div>
          <div
            style={{
              fontSize: 9.5,
              color: C.inkLight,
              fontFamily: F.mono,
              marginTop: 1,
            }}
          >
            Saved {timeAgo(snapshot.savedAt)}
          </div>
        </div>
        {overallPass !== null && (
          <span
            style={{
              padding: "3px 9px",
              borderRadius: 20,
              background: overallPass ? C.greenLight : C.redLight,
              color: overallPass ? C.green : C.red,
              fontSize: 9.5,
              fontFamily: F.mono,
              fontWeight: 700,
              border: `1px solid ${overallPass ? C.green + "28" : C.red + "28"}`,
            }}
          >
            {overallPass ? "✓ PASS" : "✗ FAIL"}
          </span>
        )}
      </div>

      {/* Rows */}
      <div style={{ padding: "10px 14px" }}>
        {rows.map((row, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "4px 0",
              borderBottom:
                i < rows.length - 1 ? `1px solid ${C.border}` : "none",
            }}
          >
            <span style={{ fontSize: 11, color: C.inkMid, fontFamily: F.sans }}>
              {row.label}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              {row.tag && (
                <span
                  style={{
                    fontSize: 9,
                    color: C.inkFaint,
                    fontFamily: F.mono,
                    background: C.bgAlt,
                    padding: "1px 5px",
                    borderRadius: 3,
                  }}
                >
                  {row.tag}
                </span>
              )}
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  fontFamily: F.mono,
                  color:
                    row.pass === true
                      ? C.green
                      : row.pass === false
                        ? C.red
                        : C.ink,
                }}
              >
                {row.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PROJECT CARD ──────────────────────────────────────────────
function ProjectCard({ project, onDelete }) {
  const [expanded, setExpanded] = useState(true);
  const navigate = useNavigate();

  const GOTO = {
    beam: "/beam",
    column: "/column",
    slab: "/slab",
    foundation: "/foundation",
    road: "/road",
    bridge: "/bridge",
    boq: "/boq",
  };
  const mids = Object.keys(project.modules || {});

  // Aggregate pass/fail
  const allChecks = mids.flatMap((mid) => {
    const d = project.modules[mid]?.data;
    if (!d) return [];
    const c = [];
    if (d.check?.pass !== undefined) c.push(d.check.pass);
    if (d.check?.shearPass !== undefined) c.push(d.check.shearPass);
    if (d.check?.deflPass !== undefined) c.push(d.check.deflPass);
    if (d.result?.pass !== undefined) c.push(d.result.pass);
    if (d.result?.deflPass !== undefined) c.push(d.result.deflPass);
    if (d.result?.passSBC !== undefined) c.push(d.result.passSBC);
    if (d.result?.passM !== undefined) c.push(d.result.passM);
    if (d.result?.punchPass !== undefined) c.push(d.result.punchPass);
    if (d.result?.biaxialPass !== undefined) c.push(d.result.biaxialPass);
    if (d.hCurve?.passRadius !== undefined) c.push(d.hCurve.passRadius);
    return c;
  });
  const passCount = allChecks.filter(Boolean).length;
  const totalChecks = allChecks.length;
  const overallPass = totalChecks > 0 ? allChecks.every(Boolean) : null;

  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: C.shadow,
        marginBottom: 20,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "18px 22px",
          background: C.bgAlt,
          borderBottom: `1px solid ${C.border}`,
          cursor: "pointer",
        }}
        onClick={() => setExpanded((e) => !e)}
      >
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${C.navy}, ${C.navyBright})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            boxShadow: `0 4px 12px ${C.navyGlow}`,
            flexShrink: 0,
          }}
        >
          🏗
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 17,
              fontWeight: 800,
              color: C.navy,
              fontFamily: F.sans,
              letterSpacing: "-0.3px",
            }}
          >
            {project.name}
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 3,
              alignItems: "center",
            }}
          >
            <span
              style={{ fontSize: 10.5, color: C.inkLight, fontFamily: F.mono }}
            >
              Created {fmtDate(project.createdAt)}
            </span>
            <span style={{ color: C.inkFaint, fontSize: 10 }}>·</span>
            <span
              style={{ fontSize: 10.5, color: C.inkLight, fontFamily: F.mono }}
            >
              Updated {timeAgo(project.updatedAt)}
            </span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexShrink: 0,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: C.navy,
                fontFamily: F.mono,
                lineHeight: 1,
              }}
            >
              {mids.length}
            </div>
            <div
              style={{
                fontSize: 9,
                color: C.inkFaint,
                fontFamily: F.sans,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginTop: 2,
              }}
            >
              Modules
            </div>
          </div>
          {totalChecks > 0 && (
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  fontFamily: F.mono,
                  lineHeight: 1,
                  color: overallPass
                    ? C.green
                    : passCount > 0
                      ? C.yellow
                      : C.red,
                }}
              >
                {passCount}/{totalChecks}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: C.inkFaint,
                  fontFamily: F.sans,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginTop: 2,
                }}
              >
                Checks
              </div>
            </div>
          )}
          {overallPass !== null && (
            <span
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                background: overallPass ? C.greenLight : C.redLight,
                color: overallPass ? C.green : C.red,
                fontSize: 12,
                fontFamily: F.mono,
                fontWeight: 700,
                border: `1.5px solid ${overallPass ? C.green + "30" : C.red + "30"}`,
              }}
            >
              {overallPass ? "✓ ALL PASS" : "✗ ISSUES"}
            </span>
          )}
          <span
            style={{
              fontSize: 18,
              color: C.inkFaint,
              transition: "transform 0.2s",
              transform: expanded ? "rotate(180deg)" : "none",
              display: "inline-block",
            }}
          >
            ▾
          </span>
        </div>
      </div>

      {/* Module chips */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 22px",
          borderBottom: `1px solid ${C.border}`,
          flexWrap: "wrap",
        }}
      >
        {mids.map((mid) => {
          const meta = MODULE_META[mid] || {
            label: mid,
            icon: "◈",
            color: C.navy,
          };
          return (
            <button
              key={mid}
              onClick={(e) => {
                e.stopPropagation();
                navigate(GOTO[mid] || "/");
              }}
              title={`Open ${meta.label}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 10px",
                borderRadius: 6,
                border: `1px solid ${meta.color}25`,
                background: `${meta.color}0d`,
                color: meta.color,
                fontSize: 11.5,
                fontFamily: F.sans,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.12s",
              }}
            >
              <span style={{ fontFamily: F.mono }}>{meta.icon}</span>
              {meta.label}
            </button>
          );
        })}
        <div style={{ flex: 1 }} />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(project.id);
          }}
          style={{
            background: "none",
            border: `1px solid ${C.border}`,
            borderRadius: 6,
            color: C.red,
            cursor: "pointer",
            fontSize: 11,
            fontFamily: F.sans,
            fontWeight: 600,
            padding: "4px 10px",
          }}
        >
          Delete
        </button>
      </div>

      {/* Module cards */}
      {expanded && (
        <div style={{ padding: "18px 22px" }}>
          {mids.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "20px 0",
                color: C.inkFaint,
                fontFamily: F.mono,
                fontSize: 12,
              }}
            >
              No modules saved yet.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
                gap: 12,
              }}
            >
              {mids.map((mid) => (
                <ModuleSummaryCard
                  key={mid}
                  moduleId={mid}
                  snapshot={project.modules[mid]}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── EMPTY STATE ───────────────────────────────────────────────
function EmptyState({ navigate }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 0" }}>
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 20,
          background: C.navyLight,
          border: `2px dashed ${C.navy}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 32,
          margin: "0 auto 20px",
        }}
      >
        📋
      </div>
      <h3
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: C.navy,
          fontFamily: F.sans,
          marginBottom: 8,
        }}
      >
        No projects saved yet
      </h3>
      <p
        style={{
          fontSize: 13,
          color: C.inkLight,
          fontFamily: F.sans,
          marginBottom: 24,
          lineHeight: 1.8,
        }}
      >
        Open any module, run your calculations, then click
        <br />
        <strong style={{ color: C.navy }}>"Save to Dashboard"</strong> at the
        top of the results panel.
      </p>
      <div
        style={{
          display: "flex",
          gap: 10,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {Object.entries(MODULE_META)
          .slice(0, 4)
          .map(([id, meta]) => (
            <button
              key={id}
              onClick={() => navigate(`/${id}`)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "9px 18px",
                borderRadius: 8,
                border: `1.5px solid ${meta.color}30`,
                background: `${meta.color}09`,
                color: meta.color,
                fontSize: 13,
                fontFamily: F.sans,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <span style={{ fontFamily: F.mono }}>{meta.icon}</span>
              {meta.label}
            </button>
          ))}
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState(loadProjects);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const handler = () => setProjects(loadProjects());
    window.addEventListener("strux_projects_updated", handler);
    return () => window.removeEventListener("strux_projects_updated", handler);
  }, []);

  const deleteProject = useCallback(
    (id) => {
      const updated = projects.filter((p) => p.id !== id);
      saveProjects(updated);
      setProjects(updated);
    },
    [projects],
  );

  // KPIs
  const totalMods = projects.reduce(
    (s, p) => s + Object.keys(p.modules || {}).length,
    0,
  );
  const allResults = projects.flatMap((p) =>
    Object.values(p.modules || {}).flatMap((snap) => {
      const d = snap.data;
      if (!d) return [];
      return [
        d.check?.pass,
        d.check?.shearPass,
        d.check?.deflPass,
        d.result?.pass,
        d.result?.deflPass,
        d.result?.passSBC,
        d.result?.passM,
        d.result?.punchPass,
        d.result?.biaxialPass,
        d.hCurve?.passRadius,
      ].filter((v) => v !== undefined && v !== null);
    }),
  );
  const passRate = allResults.length
    ? Math.round((allResults.filter(Boolean).length / allResults.length) * 100)
    : 0;

  const filtered = projects.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (filter === "all") return true;
    const checks = Object.values(p.modules || {}).flatMap((snap) => {
      const d = snap.data;
      if (!d) return [];
      return [
        d.check?.pass,
        d.result?.pass,
        d.result?.passSBC,
        d.result?.passM,
      ].filter((v) => v !== undefined && v !== null);
    });
    if (filter === "pass") return checks.length > 0 && checks.every(Boolean);
    if (filter === "fail") return checks.some((v) => !v);
    return true;
  });

  return (
    <div style={{ animation: "fadeUp 0.3s ease both" }}>
      {/* KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {[
          {
            label: "Projects",
            value: projects.length,
            icon: "📁",
            color: C.navy,
            bg: C.navyLight,
          },
          {
            label: "Modules",
            value: totalMods,
            icon: "⚙",
            color: "#1a4080",
            bg: C.navyLight,
          },
          {
            label: "Code Checks",
            value: allResults.length,
            icon: "🔍",
            color: "#7c3aed",
            bg: "#f5f3ff",
          },
          {
            label: "Pass Rate",
            value: allResults.length ? `${passRate}%` : "—",
            icon: "✓",
            color: C.green,
            bg: C.greenLight,
          },
        ].map(({ label, value, icon, color, bg }) => (
          <div
            key={label}
            style={{
              background: "#fff",
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: "16px 18px",
              boxShadow: C.shadowXs,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  fontSize: 9.5,
                  fontFamily: F.sans,
                  fontWeight: 700,
                  color: C.inkLight,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                {label}
              </div>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                }}
              >
                {icon}
              </div>
            </div>
            <div
              style={{
                fontSize: 26,
                fontWeight: 800,
                color,
                fontFamily: F.mono,
                lineHeight: 1,
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", flex: "1 1 200px" }}>
          <span
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 13,
              opacity: 0.35,
            }}
          >
            🔍
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects…"
            style={{
              width: "100%",
              padding: "8px 12px 8px 32px",
              borderRadius: 8,
              border: `1.5px solid ${C.border}`,
              background: "#fff",
              fontFamily: F.sans,
              fontSize: 13,
              color: C.ink,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[
            ["all", "All"],
            ["pass", "Pass"],
            ["fail", "Issues"],
          ].map(([val, lbl]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              style={{
                padding: "7px 14px",
                borderRadius: 7,
                fontSize: 12.5,
                fontFamily: F.sans,
                fontWeight: 600,
                cursor: "pointer",
                border: `1.5px solid ${filter === val ? (val === "pass" ? C.green : val === "fail" ? C.red : C.navy) : C.border}`,
                background:
                  filter === val
                    ? val === "pass"
                      ? C.greenLight
                      : val === "fail"
                        ? C.redLight
                        : C.navyLight
                    : "#fff",
                color:
                  filter === val
                    ? val === "pass"
                      ? C.green
                      : val === "fail"
                        ? C.red
                        : C.navy
                    : C.inkLight,
              }}
            >
              {lbl}
            </button>
          ))}
        </div>
        <button
          onClick={() => navigate("/report")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            borderRadius: 8,
            border: `1.5px solid ${C.border}`,
            background: "#fff",
            color: C.navy,
            fontSize: 12.5,
            fontFamily: F.sans,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: C.shadowXs,
          }}
        >
          ↓ Export Report
        </button>
      </div>

      {/* Projects */}
      {projects.length === 0 && <EmptyState navigate={navigate} />}
      {projects.length > 0 && filtered.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "40px 0",
            color: C.inkFaint,
            fontFamily: F.mono,
            fontSize: 13,
          }}
        >
          No projects match your filter.
        </div>
      )}
      {filtered.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onDelete={deleteProject}
        />
      ))}

      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
