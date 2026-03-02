import { C, F, inputBase, labelStyle, badge, sectionTitle } from '@styles/tokens'

// ── LABEL ─────────────────────────────────────────────────────
export function Label({ children, htmlFor }) {
  return <label htmlFor={htmlFor} style={labelStyle}>{children}</label>
}

// ── INPUT / SELECT ─────────────────────────────────────────────
export function Inp({ label, value, onChange, type = 'number', options, min, max, step, small, id }) {
  const inputId = id || (label ? label.replace(/\W+/g, '-').toLowerCase() : undefined)
  const style   = { ...inputBase, ...(small ? { padding: '5px 9px', fontSize: 12 } : {}) }

  const onFocus = e => {
    e.target.style.borderColor = C.green
    e.target.style.boxShadow   = `0 0 0 3px ${C.greenGlow}`
    e.target.style.background  = C.bgCard
  }
  const onBlur = e => {
    e.target.style.borderColor = C.border
    e.target.style.boxShadow   = 'none'
    e.target.style.background  = C.bgInput
  }

  return (
    <div style={{ marginBottom: 10 }}>
      {label && <Label htmlFor={inputId}>{label}</Label>}
      {options ? (
        <select id={inputId} style={style} value={value}
          onChange={e => onChange(e.target.value)} onFocus={onFocus} onBlur={onBlur}>
          {options.map(o => <option key={o.v ?? o} value={o.v ?? o}>{o.l ?? o}</option>)}
        </select>
      ) : (
        <input id={inputId} style={style} type={type} value={value}
          min={min} max={max} step={step}
          onChange={e => onChange(type === 'number' ? (parseFloat(e.target.value) || 0) : e.target.value)}
          onFocus={onFocus} onBlur={onBlur}
        />
      )}
    </div>
  )
}

// ── TEXT INPUT ─────────────────────────────────────────────────
export function TextInp({ label, value, onChange, placeholder }) {
  const onFocus = e => { e.target.style.borderColor = C.green; e.target.style.boxShadow = `0 0 0 3px ${C.greenGlow}`; e.target.style.background = C.bgCard }
  const onBlur  = e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; e.target.style.background = C.bgInput }

  return (
    <div style={{ marginBottom: 10 }}>
      {label && <Label>{label}</Label>}
      <input style={inputBase} type="text" value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)} onFocus={onFocus} onBlur={onBlur} />
    </div>
  )
}

// ── STAT BOX ───────────────────────────────────────────────────
export function StatBox({ label, value, unit, color }) {
  const col = color || C.green

  return (
    <div style={{
      background:   C.bgAlt,
      border:       `1px solid ${C.border}`,
      borderRadius: 8,
      padding:      '12px 10px',
      textAlign:    'center',
    }}>
      <div style={{
        fontSize:      9.5,
        color:         C.inkLight,
        fontFamily:    F.sans,
        fontWeight:    600,
        marginBottom:  6,
        letterSpacing: '1px',
        textTransform: 'uppercase',
      }}>
        {label}
      </div>
      <div style={{
        fontSize:      20,
        fontWeight:    700,
        color:         col,
        fontFamily:    F.mono,
        lineHeight:    1,
        letterSpacing: '-0.3px',
      }}>
        {value}
      </div>
      {unit && (
        <div style={{
          fontSize:      9.5,
          color:         C.inkLight,
          fontFamily:    F.mono,
          marginTop:     4,
          letterSpacing: '0.5px',
        }}>
          {unit}
        </div>
      )}
    </div>
  )
}

// ── UTILIZATION BAR ────────────────────────────────────────────
export function UtilBar({ pct, label, color }) {
  const p   = Math.min(Math.max(parseFloat(pct) || 0, 0), 150)
  const col = color || (p <= 70 ? C.green : p <= 100 ? C.yellow : C.red)

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 11.5, color: C.inkMid, fontFamily: F.sans, fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: col, fontFamily: F.mono }}>{pct}%</span>
      </div>
      <div style={{
        height:       5,
        background:   C.bgAlt,
        borderRadius: 99,
        overflow:     'hidden',
        border:       `1px solid ${C.border}`,
      }}>
        <div style={{
          width:        `${Math.min(p, 100)}%`,
          height:       '100%',
          background:   col,
          borderRadius: 99,
          transition:   'width 0.55s cubic-bezier(0.22,1,0.36,1)',
        }} />
      </div>
    </div>
  )
}

// ── PASS / FAIL ────────────────────────────────────────────────
export function PassFail({ pass, code }) {
  const color = pass ? C.green : C.red
  const bg    = pass ? C.greenLight : C.redLight

  return (
    <div style={{
      display:        'flex',
      justifyContent: 'space-between',
      alignItems:     'center',
      marginBottom:   12,
    }}>
      <span style={{ fontSize: 11, color: C.inkLight, fontFamily: F.mono }}>{code}</span>
      <span style={{
        ...badge(color, bg),
        fontSize:   11,
        fontWeight: 700,
        padding:    '3px 10px',
        borderRadius: 5,
      }}>
        {pass ? '✓ PASS' : '✗ FAIL'}
      </span>
    </div>
  )
}

// ── TAB BUTTON ─────────────────────────────────────────────────
export function TabBtn({ active, onClick, children, color }) {
  const col = color || C.green

  return (
    <button onClick={onClick} style={{
      flex:          1,
      padding:       '7px 0',
      borderRadius:  7,
      border:        `1.5px solid ${active ? col : C.border}`,
      background:    active ? C.bgCard : C.bgAlt,
      color:         active ? col : C.inkLight,
      cursor:        'pointer',
      fontSize:      12,
      fontFamily:    F.sans,
      fontWeight:    600,
      letterSpacing: '0.2px',
      transition:    'all 0.14s ease',
      boxShadow:     active ? C.shadowXs : 'none',
    }}>
      {children}
    </button>
  )
}

// ── INFO BOX ───────────────────────────────────────────────────
export function InfoBox({ color, lightColor, children }) {
  const col = color || C.green
  const bg  = lightColor || C.greenLight

  return (
    <div style={{
      background:   bg,
      border:       `1px solid ${col}22`,
      borderLeft:   `3px solid ${col}`,
      borderRadius: '0 7px 7px 0',
      padding:      '11px 13px',
    }}>
      <div style={{
        fontSize:   12,
        color:      C.inkMid,
        fontFamily: F.sans,
        lineHeight: 1.85,
      }}>
        {children}
      </div>
    </div>
  )
}

// ── SECTION TITLE ──────────────────────────────────────────────
export function SectionTitle({ children, style: extra }) {
  return <h3 style={{ ...sectionTitle, ...extra }}>{children}</h3>
}

// ── CARD ───────────────────────────────────────────────────────
export function Card({ children, style: extra, accentColor }) {
  return (
    <div style={{
      background:   C.bgCard,
      border:       `1px solid ${C.border}`,
      borderRadius: 10,
      padding:      '16px 18px',
      boxShadow:    C.shadow,
      marginBottom: 12,
      ...(accentColor ? { borderLeft: `3px solid ${accentColor}` } : {}),
      ...extra,
    }}>
      {children}
    </div>
  )
}

// ── TWO-COLUMN LAYOUT ──────────────────────────────────────────
export function TwoCol({ left, right, leftWidth = '292px' }) {
  return (
    <div style={{
      display:             'grid',
      gridTemplateColumns: `${leftWidth} 1fr`,
      gap:                 16,
      alignItems:          'start',
    }}>
      <div className="anim-slideRight stagger">{left}</div>
      <div className="anim-fadeUp">{right}</div>
    </div>
  )
}

// ── STAT GRID ──────────────────────────────────────────────────
export function StatGrid({ cols = 3, children }) {
  return (
    <div style={{
      display:             'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap:                 8,
    }}>
      {children}
    </div>
  )
}

// ── RESULT ROW ─────────────────────────────────────────────────
export function ResultRow({ label, value, unit, highlight }) {
  return (
    <div style={{
      display:        'flex',
      justifyContent: 'space-between',
      alignItems:     'baseline',
      padding:        '6px 0',
      borderBottom:   `1px solid ${C.border}`,
    }}>
      <span style={{ fontSize: 12.5, color: C.inkMid, fontFamily: F.sans }}>{label}</span>
      <span style={{
        fontSize:   12.5,
        fontWeight: highlight ? 700 : 500,
        color:      highlight ? C.green : C.ink,
        fontFamily: F.mono,
      }}>
        {value}
        {unit && <span style={{ fontSize: 10.5, color: C.inkLight, marginLeft: 3 }}>{unit}</span>}
      </span>
    </div>
  )
}

// ── DIVIDER ────────────────────────────────────────────────────
export function Divider({ margin = '10px 0' }) {
  return <div style={{ height: 1, background: C.border, margin }} />
}