// ── COLOR PALETTE ─────────────────────────────────────────────
export const C = {
  // Surfaces
  bg:       '#f7f8f6',
  bgCard:   '#ffffff',
  bgAlt:    '#f2f4f1',
  bgInput:  '#f7f8f6',
  bgHover:  '#f0f4f0',

  // Borders
  border:      '#e4e8e2',
  borderMid:   '#d4d9d2',

  // Ink
  ink:      '#111612',
  inkMid:   '#3d4a3e',
  inkLight: '#7a8c7c',
  inkFaint: '#b8c4b9',

  // Green accent — the one brand color
  green:      '#16a34a',
  greenDim:   '#15803d',
  greenLight: '#f0fdf4',
  greenMid:   '#dcfce7',
  greenGlow:  'rgba(22,163,74,0.12)',

  // Supporting semantic colors
  blue:        '#2563eb',
  blueLight:   '#eff6ff',
  red:         '#dc2626',
  redLight:    '#fef2f2',
  orange:      '#ea580c',
  orangeLight: '#fff7ed',
  yellow:      '#ca8a04',
  yellowLight: '#fefce8',
  purple:      '#7c3aed',
  purpleLight: '#f5f3ff',
  teal:        '#0891b2',
  tealLight:   '#ecfeff',

  // Elevation
  shadowXs: '0 1px 2px rgba(17,22,18,0.05)',
  shadow:   '0 1px 6px rgba(17,22,18,0.07)',
  shadowMd: '0 4px 16px rgba(17,22,18,0.09)',
}

// ── TYPOGRAPHY ─────────────────────────────────────────────────
export const F = {
  sans: "'Plus Jakarta Sans', sans-serif",
  mono: "'DM Mono', monospace",
}

// ── REUSABLE STYLE OBJECTS ─────────────────────────────────────
export const inputBase = {
  background:  C.bgInput,
  border:      `1.5px solid ${C.border}`,
  borderRadius: 7,
  color:       C.ink,
  padding:     '8px 11px',
  fontFamily:  F.mono,
  fontSize:    12.5,
  width:       '100%',
  outline:     'none',
  transition:  'border-color 0.16s, box-shadow 0.16s',
}

export const sectionTitle = {
  margin:        '0 0 12px',
  fontSize:      10,
  color:         C.inkLight,
  textTransform: 'uppercase',
  letterSpacing: '2px',
  fontFamily:    F.sans,
  fontWeight:    700,
}

export const labelStyle = {
  display:       'block',
  fontSize:      10,
  color:         C.inkLight,
  marginBottom:  4,
  fontFamily:    F.sans,
  fontWeight:    600,
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
}

export const badge = (color, bg) => ({
  display:       'inline-flex',
  alignItems:    'center',
  background:    bg,
  color,
  fontFamily:    F.mono,
  fontSize:      9.5,
  padding:       '2px 8px',
  borderRadius:  4,
  fontWeight:    500,
  letterSpacing: '0.5px',
})