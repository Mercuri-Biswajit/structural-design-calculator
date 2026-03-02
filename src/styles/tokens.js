// ── COLOR PALETTE — Light theme, Navy · Orange · Green for elements ─
export const C = {
  // Surfaces — clean white/light
  bg:       '#f5f7fa',
  bgCard:   '#ffffff',
  bgAlt:    '#f0f3f8',
  bgInput:  '#f8fafc',
  bgHover:  '#eef2f8',

  // Borders
  border:      '#d0dae8',
  borderMid:   '#b8c8d8',

  // Ink
  ink:      '#0d1e35',
  inkMid:   '#2c4160',
  inkLight: '#6b85a0',
  inkFaint: '#a8bfd0',

  // Navy — primary brand color
  navy:        '#0f2d5c',
  navyMid:     '#1a4080',
  navyLight:   '#e8f0f9',
  navyGlow:    'rgba(15,45,92,0.12)',
  navyBright:  '#2563b0',

  // Orange — secondary accent
  orange:      '#e8630a',
  orangeMid:   '#c85508',
  orangeLight: '#fff3eb',
  orangeGlow:  'rgba(232,99,10,0.15)',
  orangeBright:'#ff7a2a',

  // Green — tertiary accent / success
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
  yellow:      '#ca8a04',
  yellowLight: '#fefce8',
  purple:      '#7c3aed',
  purpleLight: '#f5f3ff',
  teal:        '#0891b2',
  tealLight:   '#ecfeff',

  // Elevation
  shadowXs: '0 1px 3px rgba(15,45,92,0.08)',
  shadow:   '0 2px 8px rgba(15,45,92,0.10)',
  shadowMd: '0 4px 20px rgba(15,45,92,0.13)',
  shadowLg: '0 8px 40px rgba(15,45,92,0.16)',
}

// ── TYPOGRAPHY ─────────────────────────────────────────────────
export const F = {
  sans: "'Plus Jakarta Sans', sans-serif",
  mono: "'DM Mono', monospace",
  display: "'Plus Jakarta Sans', sans-serif",
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
  fontSize:      11,
  padding:       '2px 8px',
  borderRadius:  4,
  fontWeight:    600,
  letterSpacing: '0.5px',
})