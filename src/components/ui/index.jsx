import {
  C,
  F,
  inputBase,
  labelStyle,
  badge,
  sectionTitle,
} from "@styles/tokens";

// ── LABEL ─────────────────────────────────────────────────────
export function Label({ children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} style={labelStyle}>
      {children}
    </label>
  );
}

// ── INPUT / SELECT ─────────────────────────────────────────────
export function Inp({
  label,
  value,
  onChange,
  type = "number",
  options,
  min,
  max,
  step,
  small,
  id,
}) {
  const inputId =
    id || (label ? label.replace(/\W+/g, "-").toLowerCase() : undefined);
  const style = {
    ...inputBase,
    padding: "6px 9px",
    fontSize: 12,
    ...(small ? { padding: "4px 8px", fontSize: 11 } : {}),
  };
  const onFocus = (e) => {
    e.target.style.borderColor = C.green;
    e.target.style.boxShadow = `0 0 0 2px ${C.greenGlow}`;
    e.target.style.background = C.bgCard;
  };
  const onBlur = (e) => {
    e.target.style.borderColor = C.border;
    e.target.style.boxShadow = "none";
    e.target.style.background = C.bgInput;
  };
  return (
    <div style={{ marginBottom: 7 }}>
      {label && <Label htmlFor={inputId}>{label}</Label>}
      {options ? (
        <select
          id={inputId}
          style={style}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
        >
          {options.map((o) => (
            <option key={o.v ?? o} value={o.v ?? o}>
              {o.l ?? o}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={inputId}
          style={style}
          type={type}
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) =>
            onChange(
              type === "number"
                ? parseFloat(e.target.value) || 0
                : e.target.value,
            )
          }
          onFocus={onFocus}
          onBlur={onBlur}
        />
      )}
    </div>
  );
}

// ── TEXT INPUT ─────────────────────────────────────────────────
export function TextInp({ label, value, onChange, placeholder }) {
  const onFocus = (e) => {
    e.target.style.borderColor = C.green;
    e.target.style.boxShadow = `0 0 0 2px ${C.greenGlow}`;
    e.target.style.background = C.bgCard;
  };
  const onBlur = (e) => {
    e.target.style.borderColor = C.border;
    e.target.style.boxShadow = "none";
    e.target.style.background = C.bgInput;
  };
  return (
    <div style={{ marginBottom: 7 }}>
      {label && <Label>{label}</Label>}
      <input
        style={{ ...inputBase, padding: "6px 9px", fontSize: 12 }}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </div>
  );
}

// ── STAT BOX ──────────────────────────────────────────────────
export function StatBox({ label, value, unit, color }) {
  const col = color || C.green;
  return (
    <div
      style={{
        background: C.bgAlt,
        border: `1px solid ${C.border}`,
        borderRadius: 7,
        padding: "7px 8px",
        textAlign: "center",
        minWidth: 0,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          fontSize: 8.5,
          color: C.inkLight,
          fontFamily: F.sans,
          fontWeight: 700,
          marginBottom: 3,
          letterSpacing: "0.8px",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 800,
          color: col,
          fontFamily: F.mono,
          lineHeight: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </div>
      {unit && (
        <div
          style={{
            fontSize: 8.5,
            color: C.inkLight,
            fontFamily: F.mono,
            marginTop: 2,
          }}
        >
          {unit}
        </div>
      )}
    </div>
  );
}

// ── UTILIZATION BAR ───────────────────────────────────────────
export function UtilBar({ pct, label, color }) {
  const p = Math.min(Math.max(parseFloat(pct) || 0, 0), 150);
  const col = color || (p <= 70 ? C.green : p <= 100 ? C.yellow : C.red);
  return (
    <div style={{ marginBottom: 7 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 3,
        }}
      >
        <span
          style={{
            fontSize: 10.5,
            color: C.inkMid,
            fontFamily: F.sans,
            fontWeight: 500,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: 10.5,
            fontWeight: 700,
            color: col,
            fontFamily: F.mono,
          }}
        >
          {pct}%
        </span>
      </div>
      <div
        style={{
          height: 4,
          background: C.bgAlt,
          borderRadius: 99,
          overflow: "hidden",
          border: `1px solid ${C.border}`,
        }}
      >
        <div
          style={{
            width: `${Math.min(p, 100)}%`,
            height: "100%",
            background: col,
            borderRadius: 99,
            transition: "width 0.5s cubic-bezier(0.22,1,0.36,1)",
          }}
        />
      </div>
    </div>
  );
}

// ── PASS / FAIL ───────────────────────────────────────────────
export function PassFail({ pass, code }) {
  const color = pass ? C.green : C.red;
  const bg = pass ? C.greenLight : C.redLight;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
        gap: 8,
      }}
    >
      <span
        style={{
          fontSize: 10,
          color: C.inkLight,
          fontFamily: F.mono,
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {code}
      </span>
      <span
        style={{
          ...badge(color, bg),
          fontSize: 10,
          fontWeight: 700,
          padding: "2px 8px",
          borderRadius: 4,
          flexShrink: 0,
          whiteSpace: "nowrap",
        }}
      >
        {pass ? "✓ PASS" : "✗ FAIL"}
      </span>
    </div>
  );
}

// ── TAB BUTTON ────────────────────────────────────────────────
export function TabBtn({ active, onClick, children, color }) {
  const col = color || C.green;
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: "5px 0",
        borderRadius: 6,
        border: `1.5px solid ${active ? col : C.border}`,
        background: active ? C.bgCard : C.bgAlt,
        color: active ? col : C.inkLight,
        cursor: "pointer",
        fontSize: 11.5,
        fontFamily: F.sans,
        fontWeight: 600,
        letterSpacing: "0.2px",
        transition: "all 0.14s ease",
        boxShadow: active ? C.shadowXs : "none",
      }}
    >
      {children}
    </button>
  );
}

// ── INFO BOX ──────────────────────────────────────────────────
export function InfoBox({ color, lightColor, children }) {
  const col = color || C.green;
  const bg = lightColor || C.greenLight;
  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${col}22`,
        borderLeft: `3px solid ${col}`,
        borderRadius: "0 6px 6px 0",
        padding: "7px 10px",
        wordBreak: "break-word",
        overflowWrap: "break-word",
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: C.inkMid,
          fontFamily: F.sans,
          lineHeight: 1.65,
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ── SECTION TITLE ─────────────────────────────────────────────
export function SectionTitle({ children, style: extra }) {
  return (
    <h3
      style={{
        ...sectionTitle,
        fontSize: 9,
        letterSpacing: "1.5px",
        marginBottom: 8,
        ...extra,
      }}
    >
      {children}
    </h3>
  );
}

// ── CARD ──────────────────────────────────────────────────────
export function Card({ children, style: extra, accentColor }) {
  return (
    <div
      style={{
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: 9,
        padding: "11px 13px",
        boxShadow: C.shadowXs,
        marginBottom: 8,
        minWidth: 0,
        overflow: "hidden",
        ...(accentColor ? { borderLeft: `3px solid ${accentColor}` } : {}),
        ...extra,
      }}
    >
      {children}
    </div>
  );
}

// ── TWO-COLUMN LAYOUT ─────────────────────────────────────────
export function TwoCol({ left, right, leftWidth = "280px" }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `${leftWidth} 1fr`,
        gap: 14,
        alignItems: "start",
      }}
    >
      <div className="anim-slideRight stagger" style={{ minWidth: 0 }}>
        {left}
      </div>
      <div className="anim-fadeUp" style={{ minWidth: 0 }}>
        {right}
      </div>
    </div>
  );
}

// ── STAT GRID ─────────────────────────────────────────────────
export function StatGrid({ cols = 3, children }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 6,
        minWidth: 0,
      }}
    >
      {children}
    </div>
  );
}

// ── RESULT ROW ────────────────────────────────────────────────
export function ResultRow({ label, value, unit, highlight }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "4px 0",
        borderBottom: `1px solid ${C.border}`,
        gap: 10,
        minWidth: 0,
      }}
    >
      <span
        style={{
          fontSize: 11.5,
          color: C.inkMid,
          fontFamily: F.sans,
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          lineHeight: 1.3,
        }}
      >
        {label}
      </span>
      <span
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 3,
          fontSize: 11.5,
          fontWeight: highlight ? 700 : 600,
          color: highlight ? C.green : C.ink,
          fontFamily: F.mono,
          flexShrink: 0,
          whiteSpace: "nowrap",
        }}
      >
        {value}
        {unit && (
          <span style={{ fontSize: 9.5, color: C.inkLight, fontWeight: 400 }}>
            {unit}
          </span>
        )}
      </span>
    </div>
  );
}

// ── DIVIDER ───────────────────────────────────────────────────
export function Divider({ margin = "6px 0" }) {
  return <div style={{ height: 1, background: C.border, margin }} />;
}
