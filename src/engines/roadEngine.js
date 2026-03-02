/**
 * Road & Bridge Design Engine — IRC 37 / IRC 52 / IRC 73 / IRC 6
 *
 * FIXES:
 *  - Vertical curve: separate Kmin for summit vs sag (IRC 52)
 *  - Pavement: CBR-interpolated thickness per IRC 37 Table
 *  - Bridge: impact factor per IRC 6 Cl. 208, better Mmax
 */

// ── HORIZONTAL CURVE (IRC 73) ─────────────────────────────────
export function calcHorizontalCurve({ R, V, delta }) {
  const T    = R * Math.tan((delta * Math.PI) / 360)
  const L    = (Math.PI * R * delta) / 180
  const e    = Math.min(V * V / (127 * R), 0.07)
  // Stopping Sight Distance (IRC 66 — AASHTO method)
  const f    = 0.35   // friction coefficient
  const t    = 2.5    // reaction time, s
  const SD   = (V / 3.6) * t + (V * V) / (254 * f)
  // Minimum radius (IRC 73 Cl. 13.1)
  const minR = (V * V) / (127 * (e + f))
  // Widening on curve (IRC 73 — simplified)
  const widen = V >= 80 ? 0 : Math.max(0, (0.5 * V) / (R * 10))

  return {
    T:          T.toFixed(1),
    L:          L.toFixed(1),
    e:          (e * 100).toFixed(2),
    SD:         SD.toFixed(0),
    minR:       minR.toFixed(0),
    passRadius: R >= minR,
    widen:      widen.toFixed(2),
  }
}

// ── VERTICAL CURVE (IRC 52) ───────────────────────────────────
export function calcVerticalCurve({ g1, g2, Lvc, V = 80 }) {
  const A        = Math.abs(g1 - g2)
  const K        = A > 0 ? Lvc / A : 0
  const isSummit = g1 > g2

  // IRC 52 Table 1 — Kmin values
  // Summit: Kmin = SSD² / (2 * h1 + 2 * h2) approach, simplified to V²/400
  // Sag:    Kmin = SSD / (a + b*θ) — use different table
  const Kmin_summit = V <= 40 ? 5  : V <= 50 ? 10 : V <= 60 ? 20
                    : V <= 65 ? 30 : V <= 80 ? 55 : V <= 100 ? 90 : 130

  const Kmin_sag    = V <= 40 ? 6  : V <= 50 ? 12 : V <= 60 ? 20
                    : V <= 65 ? 27 : V <= 80 ? 45 : V <= 100 ? 70 : 100

  const Kmin = isSummit ? Kmin_summit : Kmin_sag
  const Lmin = Kmin * A

  return {
    A:         A.toFixed(1),
    K:         K.toFixed(1),
    Kmin:      Kmin.toString(),
    Lmin:      Lmin.toFixed(0),
    isSummit,
    curveType: isSummit ? 'Summit Curve' : 'Sag Curve',
    pass:      K >= Kmin && Lvc >= Lmin,
  }
}

// ── IRC 37 PAVEMENT THICKNESS TABLE ──────────────────────────
// CBR (%) → total granular thickness (mm) for various MSA
// Source: IRC 37:2018 Table 3
const IRC37_TABLE = [
  // [CBR, 1MSA, 2MSA, 5MSA, 10MSA, 20MSA, 30MSA, 50MSA, 100MSA, 150MSA, 300MSA]
  [2,   665, 745, 875, 990,1105,1175,1280,1415,1505,1655],
  [3,   565, 640, 750, 850, 950, 995,1090,1205,1275,1415],
  [4,   500, 565, 665, 755, 840, 890, 975,1080,1145,1265],
  [5,   450, 510, 600, 680, 755, 800, 875, 975,1035,1145],
  [6,   415, 465, 545, 620, 690, 730, 800, 890, 945,1045],
  [7,   380, 430, 505, 570, 635, 675, 740, 825, 875, 975],
  [8,   355, 400, 470, 535, 590, 630, 690, 770, 820, 910],
  [9,   330, 375, 440, 500, 560, 590, 650, 720, 770, 855],
  [10,  310, 355, 415, 470, 525, 555, 615, 680, 720, 800],
  [12,  275, 315, 370, 420, 470, 500, 550, 610, 645, 715],
  [15,  235, 270, 320, 360, 405, 430, 475, 530, 560, 625],
  [20,  190, 220, 260, 295, 335, 355, 395, 440, 465, 520],
]

const MSA_COLS = [1, 2, 5, 10, 20, 30, 50, 100, 150, 300]

function interpolatePavement(cbr, msa) {
  // Find CBR row
  let r0 = IRC37_TABLE[0], r1 = IRC37_TABLE[IRC37_TABLE.length - 1]
  for (let i = 0; i < IRC37_TABLE.length - 1; i++) {
    if (cbr >= IRC37_TABLE[i][0] && cbr <= IRC37_TABLE[i + 1][0]) {
      r0 = IRC37_TABLE[i]; r1 = IRC37_TABLE[i + 1]; break
    }
  }
  const tCBR = (cbr - r0[0]) / Math.max(r1[0] - r0[0], 1)

  // Find MSA column
  let c0 = 0, c1 = 1
  for (let i = 0; i < MSA_COLS.length - 1; i++) {
    if (msa >= MSA_COLS[i] && msa <= MSA_COLS[i + 1]) { c0 = i; c1 = i + 1; break }
    if (msa > MSA_COLS[MSA_COLS.length - 1]) { c0 = MSA_COLS.length - 2; c1 = MSA_COLS.length - 1; break }
  }
  const tMSA = (msa - MSA_COLS[c0]) / Math.max(MSA_COLS[c1] - MSA_COLS[c0], 1)

  const v00 = r0[c0 + 1], v01 = r0[c1 + 1]
  const v10 = r1[c0 + 1], v11 = r1[c1 + 1]
  const total = v00 + tCBR * (v10 - v00) + tMSA * (v01 - v00) + tCBR * tMSA * (v11 - v10 - v01 + v00)
  return Math.round(total)
}

export function calcPavement({ traffic, CBR }) {
  const MSAmap = { light: 2, medium: 20, heavy: 100, vheavy: 300 }
  const MSA    = MSAmap[traffic] ?? 20
  const cbr    = Math.min(Math.max(CBR, 2), 20)

  const totalGranular = interpolatePavement(cbr, MSA)

  // Layer breakdown (IRC 37:2018 typical)
  const BCThk  = MSA <= 5 ? 40 : MSA <= 30 ? 50 : MSA <= 100 ? 50 : 60
  const DBMThk = MSA <= 5 ? 50 : MSA <= 30 ? 75 : MSA <= 100 ? 100 : 120
  const GBThk  = Math.max(totalGranular - BCThk - DBMThk - 200, 150)
  const SGBThk = 200

  return {
    BCThk,
    DBMThk,
    GBThk,
    SGBThk,
    total:          BCThk + DBMThk + GBThk + SGBThk,
    totalGranular,
    MSA,
  }
}

// ── BRIDGE LOADS (IRC 6) ──────────────────────────────────────
export const IRC_VEHICLE_LOADS = {
  A:  { axles: [27, 27, 114, 114, 68, 68, 68, 68], spacing: [1.1, 3.2, 1.2, 4.3, 3.0, 3.0, 3.0], udl: 9.35 },
  B:  { axles: [13.5, 13.5, 57, 57, 34, 34, 34, 34], spacing: [1.1, 3.2, 1.2, 4.3, 3.0, 3.0, 3.0], udl: 4.67 },
  AA: { axles: [200, 200], spacing: [1.2], udl: 0 },
}

export function calcBridgeLoads({ span, width, vehicleClass }) {
  const load       = IRC_VEHICLE_LOADS[vehicleClass]
  const totalAxle  = load.axles.reduce((a, b) => a + b, 0)

  // ── Maximum moment via influence line (simply-supported) ───
  // Place heaviest axle at midspan and sum contributions
  let axlePos = []
  let pos     = span / 2  // start heaviest axle at midspan
  axlePos.push(pos)
  for (let i = 0; i < load.spacing.length && i < load.axles.length - 1; i++) {
    pos -= load.spacing[i]
    axlePos.push(pos)
  }

  let Mmax = 0
  axlePos.forEach((xi, i) => {
    if (xi >= 0 && xi <= span) {
      Mmax += load.axles[i] * xi * (span - xi) / span
    }
  })
  if (load.udl > 0) {
    Mmax += load.udl * span * span / 8
  }

  // ── Impact factor (IRC 6 Cl. 208.2) ───────────────────────
  let IF
  if (vehicleClass === 'AA') {
    IF = span <= 9 ? 0.25 : span >= 40 ? 0.10 : 0.25 - (span - 9) * 0.15 / 31
  } else {
    IF = span <= 3 ? 0.5 : span >= 45 ? 0.0857 : 4.5 / (6 + span)
  }
  const Mmax_imp = Mmax * (1 + IF)

  // ── Dead load moment ───────────────────────────────────────
  const DL  = 24 * 0.25 * width   // kN/m (slab + finishes)
  const MDL = DL * span * span / 8

  const Mtotal = Mmax_imp + MDL

  return {
    totalAxle,
    Mmax:       Mmax.toFixed(1),
    Mmax_imp:   Mmax_imp.toFixed(1),
    MDL:        MDL.toFixed(1),
    Mtotal:     Mtotal.toFixed(1),
    IF:         (IF * 100).toFixed(1),
    impactPct:  (IF * 100).toFixed(1),
  }
}