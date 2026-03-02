/**
 * Road & Bridge Design Engine — IRC 37 / IRC 52 / IRC 73 / IRC 6
 *
 * Original exports (kept for backward compat):
 *   calcHorizontalCurve, calcVerticalCurve, calcPavement, calcBridgeLoads
 *
 * New wrapper exports (used by RoadPage / BridgePage):
 *   analyzeHorizontalCurve  — maps { V, R, delta, e, road } → hCurve result
 *   analyzeVerticalCurve    — maps { g1, g2, L, V }         → vCurve result
 *   analyzePavement         — maps { msaLog, cbr, layers }   → pavement result
 *   analyzeBridge           — maps { span, vc, lanes, wDL, fck, fy, b, d } → full result
 */

// ═══════════════════════════════════════════════════════════════
//  HORIZONTAL CURVE  (IRC 73)
// ═══════════════════════════════════════════════════════════════
export function calcHorizontalCurve({ R, V, delta }) {
  const T = R * Math.tan((delta * Math.PI) / 360);
  const L = (Math.PI * R * delta) / 180;
  const e = Math.min((V * V) / (127 * R), 0.07);
  const f = 0.35;
  const t = 2.5;
  const SD = (V / 3.6) * t + (V * V) / (254 * f);
  const minR = (V * V) / (127 * (e + f));
  const widen = V >= 80 ? 0 : Math.max(0, (0.5 * V) / (R * 10));

  return {
    T: T.toFixed(1),
    L: L.toFixed(1),
    Ls: (L * 0.4).toFixed(1), // transition length ≈ 40% of curve length
    SSD: SD.toFixed(0),
    SD: SD.toFixed(0),
    Rmin: minR.toFixed(0),
    minR: minR.toFixed(0),
    passRadius: R >= minR,
    widen: widen.toFixed(2),
    e: (e * 100).toFixed(2),
  };
}

// Wrapper used by RoadPage: { V, R, delta, e, road }
export function analyzeHorizontalCurve({ V, R, delta, e: eUser, road }) {
  // Use user-specified superelevation where provided, else compute
  const f = 0.35;
  const eVal =
    eUser != null ? eUser / 100 : Math.min((V * V) / (127 * R), 0.07);
  const T = R * Math.tan((delta * Math.PI) / 360);
  const L = (Math.PI * R * delta) / 180;
  const Ls = L * 0.4; // transition spiral length

  const SSD = (V / 3.6) * 2.5 + (V * V) / (254 * f);
  const Rmin = (V * V) / (127 * (eVal + f));

  return {
    T: T.toFixed(1),
    L: L.toFixed(1),
    Ls: Ls.toFixed(1),
    SSD: SSD.toFixed(0),
    Rmin: Rmin.toFixed(0),
    passRadius: R >= Rmin,
    e: (eVal * 100).toFixed(2),
  };
}

// ═══════════════════════════════════════════════════════════════
//  VERTICAL CURVE  (IRC 52)
// ═══════════════════════════════════════════════════════════════
export function calcVerticalCurve({ g1, g2, Lvc, V = 80 }) {
  const A = Math.abs(g1 - g2);
  const K = A > 0 ? Lvc / A : 0;
  const isSummit = g1 > g2;

  const Kmin_summit =
    V <= 40
      ? 5
      : V <= 50
        ? 10
        : V <= 60
          ? 20
          : V <= 65
            ? 30
            : V <= 80
              ? 55
              : V <= 100
                ? 90
                : 130;
  const Kmin_sag =
    V <= 40
      ? 6
      : V <= 50
        ? 12
        : V <= 60
          ? 20
          : V <= 65
            ? 27
            : V <= 80
              ? 45
              : V <= 100
                ? 70
                : 100;
  const Kmin = isSummit ? Kmin_summit : Kmin_sag;
  const Lmin = Kmin * A;

  return {
    A: A.toFixed(1),
    K: K.toFixed(1),
    Kmin: Kmin.toString(),
    Lmin: Lmin.toFixed(0),
    isSummit,
    curveType: isSummit ? "Summit Curve" : "Sag Curve",
    pass: K >= Kmin && Lvc >= Lmin,
    type: isSummit ? "Summit" : "Sag",
  };
}

// Wrapper used by RoadPage: { g1, g2, L, V }
// RoadPage uses L (not Lvc) for curve length
export function analyzeVerticalCurve({ g1, g2, L, V = 80 }) {
  return calcVerticalCurve({ g1, g2, Lvc: L, V });
}

// ═══════════════════════════════════════════════════════════════
//  PAVEMENT  (IRC 37:2018)
// ═══════════════════════════════════════════════════════════════
const IRC37_TABLE = [
  [2, 665, 745, 875, 990, 1105, 1175, 1280, 1415, 1505, 1655],
  [3, 565, 640, 750, 850, 950, 995, 1090, 1205, 1275, 1415],
  [4, 500, 565, 665, 755, 840, 890, 975, 1080, 1145, 1265],
  [5, 450, 510, 600, 680, 755, 800, 875, 975, 1035, 1145],
  [6, 415, 465, 545, 620, 690, 730, 800, 890, 945, 1045],
  [7, 380, 430, 505, 570, 635, 675, 740, 825, 875, 975],
  [8, 355, 400, 470, 535, 590, 630, 690, 770, 820, 910],
  [9, 330, 375, 440, 500, 560, 590, 650, 720, 770, 855],
  [10, 310, 355, 415, 470, 525, 555, 615, 680, 720, 800],
  [12, 275, 315, 370, 420, 470, 500, 550, 610, 645, 715],
  [15, 235, 270, 320, 360, 405, 430, 475, 530, 560, 625],
  [20, 190, 220, 260, 295, 335, 355, 395, 440, 465, 520],
];
const MSA_COLS = [1, 2, 5, 10, 20, 30, 50, 100, 150, 300];

function interpolatePavement(cbr, msa) {
  let r0 = IRC37_TABLE[0],
    r1 = IRC37_TABLE[IRC37_TABLE.length - 1];
  for (let i = 0; i < IRC37_TABLE.length - 1; i++) {
    if (cbr >= IRC37_TABLE[i][0] && cbr <= IRC37_TABLE[i + 1][0]) {
      r0 = IRC37_TABLE[i];
      r1 = IRC37_TABLE[i + 1];
      break;
    }
  }
  const tCBR = (cbr - r0[0]) / Math.max(r1[0] - r0[0], 1);

  let c0 = 0,
    c1 = 1;
  for (let i = 0; i < MSA_COLS.length - 1; i++) {
    if (msa >= MSA_COLS[i] && msa <= MSA_COLS[i + 1]) {
      c0 = i;
      c1 = i + 1;
      break;
    }
    if (msa > MSA_COLS[MSA_COLS.length - 1]) {
      c0 = MSA_COLS.length - 2;
      c1 = MSA_COLS.length - 1;
      break;
    }
  }
  const tMSA = (msa - MSA_COLS[c0]) / Math.max(MSA_COLS[c1] - MSA_COLS[c0], 1);

  const v00 = r0[c0 + 1],
    v01 = r0[c1 + 1];
  const v10 = r1[c0 + 1],
    v11 = r1[c1 + 1];
  return Math.round(
    v00 +
      tCBR * (v10 - v00) +
      tMSA * (v01 - v00) +
      tCBR * tMSA * (v11 - v10 - v01 + v00),
  );
}

export function calcPavement({ traffic, CBR }) {
  const MSAmap = { light: 2, medium: 20, heavy: 100, vheavy: 300 };
  const MSA = MSAmap[traffic] ?? 20;
  const cbr = Math.min(Math.max(CBR, 2), 20);
  const totalGranular = interpolatePavement(cbr, MSA);
  const BCThk = MSA <= 5 ? 40 : MSA <= 30 ? 50 : 60;
  const DBMThk = MSA <= 5 ? 50 : MSA <= 30 ? 75 : MSA <= 100 ? 100 : 120;
  const GBThk = Math.max(totalGranular - BCThk - DBMThk - 200, 150);
  const SGBThk = 200;
  return {
    BCThk,
    DBMThk,
    GBThk,
    SGBThk,
    total: BCThk + DBMThk + GBThk + SGBThk,
    totalGranular,
    MSA,
  };
}

// Wrapper used by RoadPage: { msaLog, cbr, layers }
// msaLog is log10(MSA), e.g. 7.5 = 10^7.5 / 1e6 = 31.6 MSA
// layers is user-edited array: [{ name, t }] in mm
export function analyzePavement({ msaLog, cbr, layers }) {
  const MSA = Math.pow(10, msaLog) / 1e6; // convert log(cumulative axles) → MSA
  const cbrClamped = Math.min(Math.max(cbr, 2), 20);
  const required = interpolatePavement(
    cbrClamped,
    Math.min(Math.max(MSA, 1), 300),
  );
  const total = layers.reduce((s, l) => s + (l.t || 0), 0);

  return {
    required,
    total,
    pass: total >= required,
    MSA: MSA.toFixed(1),
    layers,
  };
}

// ═══════════════════════════════════════════════════════════════
//  BRIDGE LOADS  (IRC 6)
// ═══════════════════════════════════════════════════════════════
export const IRC_VEHICLE_LOADS = {
  A: {
    axles: [27, 27, 114, 114, 68, 68, 68, 68],
    spacing: [1.1, 3.2, 1.2, 4.3, 3.0, 3.0, 3.0],
    udl: 9.35,
  },
  B: {
    axles: [13.5, 13.5, 57, 57, 34, 34, 34, 34],
    spacing: [1.1, 3.2, 1.2, 4.3, 3.0, 3.0, 3.0],
    udl: 4.67,
  },
  AA: { axles: [200, 200], spacing: [1.2], udl: 0 },
  "70R": { axles: [350, 350], spacing: [1.22], udl: 0 },
};

export function calcBridgeLoads({ span, width, vehicleClass }) {
  const vc = vehicleClass in IRC_VEHICLE_LOADS ? vehicleClass : "A";
  const load = IRC_VEHICLE_LOADS[vc];
  const totalAxle = load.axles.reduce((a, b) => a + b, 0);

  let axlePos = [span / 2];
  let pos = span / 2;
  for (let i = 0; i < load.spacing.length && i < load.axles.length - 1; i++) {
    pos -= load.spacing[i];
    axlePos.push(pos);
  }

  let Mmax = 0;
  axlePos.forEach((xi, i) => {
    if (xi >= 0 && xi <= span)
      Mmax += (load.axles[i] * xi * (span - xi)) / span;
  });
  if (load.udl > 0) Mmax += (load.udl * span * span) / 8;

  let IF;
  if (vc === "AA" || vc === "70R") {
    IF = span <= 9 ? 0.25 : span >= 40 ? 0.1 : 0.25 - ((span - 9) * 0.15) / 31;
  } else {
    IF = span <= 3 ? 0.5 : span >= 45 ? 0.0857 : 4.5 / (6 + span);
  }

  const Mmax_imp = Mmax * (1 + IF);
  const DL = 24 * 0.25 * width;
  const MDL = (DL * span * span) / 8;
  const Mtotal = Mmax_imp + MDL;

  return {
    totalAxle,
    Mmax: Mmax.toFixed(1),
    Mmax_imp: Mmax_imp.toFixed(1),
    MDL: MDL.toFixed(1),
    Mtotal: Mtotal.toFixed(1),
    IF: (IF * 100).toFixed(1),
    impactPct: (IF * 100).toFixed(1),
  };
}

// Wrapper used by BridgePage: { span, vc, lanes, wDL, fck, fy, b, d }
// vc = 'AA' | 'A' | 'B' | '70R'
// Includes girder section design (IS 456)
export function analyzeBridge({
  span,
  vc,
  lanes,
  wDL,
  fck = 30,
  fy = 500,
  b = 800,
  d = 1200,
}) {
  const vcKey = vc in IRC_VEHICLE_LOADS ? vc : "AA";
  const load = IRC_VEHICLE_LOADS[vcKey];

  // ── Live load moment (influence line — simply supported) ───
  let axlePos = [span / 2];
  let pos = span / 2;
  for (let i = 0; i < load.spacing.length && i < load.axles.length - 1; i++) {
    pos -= load.spacing[i];
    axlePos.push(pos);
  }
  let Mll = 0;
  axlePos.forEach((xi, i) => {
    if (xi >= 0 && xi <= span) Mll += (load.axles[i] * xi * (span - xi)) / span;
  });
  if (load.udl > 0) Mll += (load.udl * span * span) / 8;

  // Lane factor (IRC 6 Cl. 204.4)
  const laneFactor =
    lanes === 1 ? 1.0 : lanes === 2 ? 1.0 : lanes === 3 ? 0.9 : 0.8;
  Mll *= laneFactor;

  // ── Impact factor (IRC 6 Cl. 208.2) ───────────────────────
  let IF;
  if (vcKey === "AA" || vcKey === "70R") {
    IF = span <= 9 ? 0.25 : span >= 40 ? 0.1 : 0.25 - ((span - 9) * 0.15) / 31;
  } else {
    IF = span <= 3 ? 0.5 : span >= 45 ? 0.0857 : 4.5 / (6 + span);
  }
  const Mimp = Mll * IF;

  // ── Dead load moment ───────────────────────────────────────
  const Mdl = (wDL * span * span) / 8;
  const Mtotal = Mll + Mimp + Mdl;

  // ── Shear ──────────────────────────────────────────────────
  const Vll =
    load.axles.reduce((s, ax, i) => {
      const xi = axlePos[i] ?? 0;
      return s + (xi >= 0 && xi <= span ? (ax * (span - xi)) / span : 0);
    }, 0) * laneFactor;
  const Vtotal = Vll * (1 + IF) + (wDL * span) / 2;

  // ── Girder flexure design (IS 456) ────────────────────────
  const cover = 40; // mm
  const barDia = 25;
  const d_eff = d - cover - 8 - barDia / 2; // mm

  const Mulim = (0.138 * fck * b * d_eff * d_eff) / 1e6; // kNm
  const Mu_Nmm = Mtotal * 1e6;
  const a_q = (0.87 * fy) / (fck * b);
  const b_q = -0.87 * fy * d_eff;
  const disc = b_q * b_q - 4 * a_q * Mu_Nmm;
  const Ast_min = (0.85 * b * d_eff) / fy;
  const Ast_req =
    disc >= 0
      ? Math.max((-b_q - Math.sqrt(disc)) / (2 * a_q), Ast_min)
      : Ast_min;

  const nBars = Math.ceil(Ast_req / ((Math.PI * barDia * barDia) / 4));
  const Ast_prov = (nBars * Math.PI * barDia * barDia) / 4;

  // ── Shear design ──────────────────────────────────────────
  const tau_v = (Vtotal * 1000) / (b * d_eff);
  const pt = (Ast_prov / (b * d_eff)) * 100;
  const beta = Math.max((0.8 * fck) / (6.89 * Math.max(pt, 0.15)), 1);
  const tau_c = Math.min(
    (0.85 * Math.sqrt(0.8 * fck) * (Math.sqrt(1 + 5 * beta) - 1)) / (6 * beta),
    3.5,
  );
  const needLinks = tau_v > tau_c;
  const stirrupDia = 12;
  const Asv = (2 * Math.PI * stirrupDia * stirrupDia) / 4;
  const Vus = Math.max((tau_v - tau_c) * b * d_eff, 1);
  const stirrupSpc = needLinks
    ? Math.max(
        Math.floor(
          Math.min((0.87 * fy * Asv * d_eff) / Vus, 0.75 * d_eff, 300) / 5,
        ) * 5,
        75,
      )
    : Math.floor(Math.min(0.75 * d_eff, 300) / 5) * 5;

  return {
    // Loads
    Mll: Mll.toFixed(1),
    Mimp: Mimp.toFixed(1),
    Mdl: Mdl.toFixed(1),
    Mtotal: Mtotal.toFixed(1),
    Vtotal: Vtotal.toFixed(1),
    impactPct: (IF * 100).toFixed(1),
    // Section
    d_eff: Math.round(d_eff),
    Mulim: Mulim.toFixed(1),
    Ast_req: Ast_req.toFixed(0),
    Ast_prov: Ast_prov.toFixed(0),
    nBars,
    barDia,
    // Shear
    tau_v: tau_v.toFixed(3),
    tau_c: tau_c.toFixed(3),
    needLinks,
    stirrupDia,
    stirrupSpc: stirrupSpc.toString(),
    // Pass/fail
    passM: Mtotal <= Mulim,
    passV: tau_v <= (fck <= 25 ? 3.1 : 3.5),
    utilM: ((Mtotal / Mulim) * 100).toFixed(1),
    utilV: ((tau_v / (fck <= 25 ? 3.1 : 3.5)) * 100).toFixed(1),
  };
}
