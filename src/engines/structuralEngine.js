/**
 * Structural Design Engine — IS 456:2000 / IS 800:2007 / IS 2950 / IS 2911
 *
 * EXPORTS:
 *  analyzeColumn(...)
 *  analyzeSlab(...)
 *  analyzeIsolatedFooting(...)   ← original (kept for backward compat)
 *  analyzeFoundation(...)        ← new wrapper used by FoundationPage
 *  analyzePileGroup(...)
 */

// ═══════════════════════════════════════════════════════════════
//  COLUMN DESIGN
// ═══════════════════════════════════════════════════════════════
export function analyzeColumn({
  P,
  Mx,
  My,
  b,
  d,
  Le,
  material,
  fck = 25,
  fy = 415,
  steelPct = 2,
}) {
  const Ag = b * d;
  const Asc = (steelPct / 100) * Ag;
  const Ac = Ag - Asc;

  if (material === "concrete") {
    const Pu_cap = (0.4 * fck * Ac + 0.67 * fy * Asc) / 1000;

    const lx = Le / (d / 1000);
    const ly = Le / (b / 1000);
    const lambda = Math.max(lx, ly);
    const isSlender = lambda > 12;

    const emin_x = Math.max((Le * 1000) / 500 + d / 30, 20);
    const emin_y = Math.max((Le * 1000) / 500 + b / 30, 20);
    const Mx_emin = (P * emin_x) / 1000;
    const My_emin = (P * emin_y) / 1000;
    const Mx_design = Math.max(Mx, Mx_emin);
    const My_design = Math.max(My, My_emin);

    const Mux1 =
      (((0.87 * fy * Asc) / 2) * (d / 2 - 35) +
        0.36 * fck * b * 0.48 * d * (d - 0.416 * 0.48 * d)) /
      1e6;
    const Muy1 =
      (((0.87 * fy * Asc) / 2) * (b / 2 - 35) +
        0.36 * fck * d * 0.48 * b * (b - 0.416 * 0.48 * b)) /
      1e6;

    const Pu_ratio = P / Pu_cap;
    const alphaN =
      Pu_ratio <= 0.2
        ? 1.0
        : Pu_ratio >= 0.8
          ? 2.0
          : 1.0 + ((Pu_ratio - 0.2) * (2.0 - 1.0)) / 0.6;

    const biaxial_lhs =
      Math.pow(Math.max(Mx_design, 0.001) / Math.max(Mux1, 0.001), alphaN) +
      Math.pow(Math.max(My_design, 0.001) / Math.max(Muy1, 0.001), alphaN);
    const biaxialPass = biaxial_lhs <= 1.0;
    const util = Math.max((P / Pu_cap) * 100, biaxial_lhs * 100).toFixed(1);
    const pass = P <= Pu_cap && biaxialPass;

    return {
      code: "IS 456:2000",
      Pu_cap: Pu_cap.toFixed(1),
      lambda: lambda.toFixed(1),
      lx: lx.toFixed(1),
      ly: ly.toFixed(1),
      isSlender,
      emin_x: emin_x.toFixed(1),
      emin_y: emin_y.toFixed(1),
      Mx_design: Mx_design.toFixed(2),
      My_design: My_design.toFixed(2),
      Mux1: Mux1.toFixed(2),
      Muy1: Muy1.toFixed(2),
      biaxial_lhs: biaxial_lhs.toFixed(3),
      biaxialPass,
      alphaN: alphaN.toFixed(2),
      util,
      pass,
      Asc: Asc.toFixed(0),
      steelPct,
    };
  } else {
    const fyS = 250;
    const leff = Le * 1000;
    const r_min = Math.min(b, d) / (2 * Math.sqrt(3));
    const lam = leff / r_min;
    const phi = 0.5 * (1 + 0.49 * (lam / 93.9 - 0.2) + (lam / 93.9) ** 2);
    const chi = Math.min(
      1 / (phi + Math.sqrt(phi * phi - (lam / 93.9) ** 2)),
      1,
    );
    const fcd = (chi * fyS) / 1.1;
    const Pd = (fcd * Ag) / 1000;
    return {
      code: "IS 800:2007",
      Pu_cap: Pd.toFixed(1),
      lambda: lam.toFixed(1),
      lx: lam.toFixed(1),
      ly: lam.toFixed(1),
      isSlender: lam > 180,
      util: ((P / Pd) * 100).toFixed(1),
      pass: P <= Pd,
      biaxialPass: true,
      biaxial_lhs: "—",
    };
  }
}

// ═══════════════════════════════════════════════════════════════
//  SLAB DESIGN
// ═══════════════════════════════════════════════════════════════
const IS456_TABLE26 = [
  [1.0, 0.062, 0.062],
  [1.1, 0.074, 0.061],
  [1.2, 0.084, 0.059],
  [1.3, 0.093, 0.055],
  [1.4, 0.099, 0.051],
  [1.5, 0.104, 0.046],
  [1.6, 0.108, 0.041],
  [1.7, 0.111, 0.037],
  [1.8, 0.113, 0.032],
  [1.9, 0.114, 0.027],
  [2.0, 0.125, 0.025],
];

function getSlabCoeff(r) {
  const rClamped = Math.min(Math.max(r, 1.0), 2.0);
  for (let i = 0; i < IS456_TABLE26.length - 1; i++) {
    const [r1, ax1, ay1] = IS456_TABLE26[i];
    const [r2, ax2, ay2] = IS456_TABLE26[i + 1];
    if (rClamped >= r1 && rClamped <= r2) {
      const t = (rClamped - r1) / (r2 - r1);
      return [ax1 + t * (ax2 - ax1), ay1 + t * (ay2 - ay1)];
    }
  }
  return [
    IS456_TABLE26[IS456_TABLE26.length - 1][1],
    IS456_TABLE26[IS456_TABLE26.length - 1][2],
  ];
}

export function analyzeSlab({
  Lx,
  Ly,
  wDL,
  wLL,
  thickness,
  fck = 25,
  fy = 415,
}) {
  const r = Math.max(Ly / Math.max(Lx, 0.1), 1.0);
  const isTwoWay = r < 2.0;
  const w = wDL + wLL;
  const cover = 20;
  const d_eff = thickness - cover - 6;

  let alpha_x, alpha_y;
  if (isTwoWay) {
    [alpha_x, alpha_y] = getSlabCoeff(r);
  } else {
    alpha_x = 1 / 8;
    alpha_y = 0;
  }

  const Mx = alpha_x * w * Lx * Lx;
  const My = alpha_y * w * Lx * Lx;
  const Mulim = (0.138 * fck * 1000 * d_eff * d_eff) / 1e6;

  function calcAst(Mu_m) {
    if (Mu_m <= 0) return 0;
    const Mu_Nmm = Mu_m * 1e6;
    const b = 1000;
    const a_q = (0.87 * fy) / (fck * b);
    const b_q = -0.87 * fy * d_eff;
    const c_q = Mu_Nmm;
    const disc = b_q * b_q - 4 * a_q * c_q;
    if (disc < 0) return (0.12 / 100) * b * thickness;
    return Math.max(
      (-b_q - Math.sqrt(disc)) / (2 * a_q),
      (0.12 / 100) * b * thickness,
    );
  }

  const Ast_x = calcAst(Mx);
  const Ast_y = isTwoWay ? calcAst(My) : 0;
  const Ast_min = (0.12 / 100) * 1000 * thickness;

  const selDiaX = 10;
  const selDiaY = 10;
  const maxSpc = Math.min(3 * d_eff, 300);
  const spcX = Math.min(
    Math.max(
      Math.floor(
        (1000 * Math.PI * selDiaX * selDiaX) / 4 / Math.max(Ast_x, Ast_min) / 5,
      ) * 5,
      75,
    ),
    maxSpc,
  );
  const spcY = isTwoWay
    ? Math.min(
        Math.max(
          Math.floor(
            (1000 * Math.PI * selDiaY * selDiaY) /
              4 /
              Math.max(Ast_y, Ast_min) /
              5,
          ) * 5,
          75,
        ),
        maxSpc,
      )
    : 0;

  const ldBasic = isTwoWay ? 32 : 26;
  const ptProv = (Ast_x / (1000 * d_eff)) * 100;
  const ldAllow = ldBasic * Math.max(1.6 - 0.1 * ptProv, 0.8);
  const ldActual = (Lx * 1000) / d_eff;
  const deflPass = ldActual <= ldAllow;

  return {
    Mx: Mx.toFixed(2),
    My: My.toFixed(2),
    Mulim: Mulim.toFixed(2),
    isTwoWay,
    r: r.toFixed(2),
    d_eff: Math.round(d_eff),
    pass: Mx <= Mulim,
    util: ((Mx / Mulim) * 100).toFixed(1),
    Ast_x: Ast_x.toFixed(0),
    Ast_y: Ast_y.toFixed(0),
    Ast_min: Ast_min.toFixed(0),
    selDiaX,
    selDiaY,
    spcX: spcX.toFixed(0),
    spcY: isTwoWay ? spcY.toFixed(0) : "—",
    ldActual: ldActual.toFixed(1),
    ldAllow: ldAllow.toFixed(1),
    deflPass,
  };
}

// ═══════════════════════════════════════════════════════════════
//  ISOLATED FOOTING — original export (kept for backward compat)
// ═══════════════════════════════════════════════════════════════
export function analyzeIsolatedFooting({
  P,
  Mx = 0,
  sbc,
  colB,
  colD,
  fck = 25,
  fy = 415,
  Df = 1.5,
  thick = 0.5,
}) {
  const Wself = 0.1 * P;
  const Ptotal = P + Wself;
  const Areq = Ptotal / sbc;

  const B = Math.ceil(Math.sqrt(Areq) * 10) / 10;
  const L = B;
  const A = L * B;

  const qnet = P / A;
  const qgross = Ptotal / A;
  const Z_mod = (L * B * B) / 6;
  const q_max = qgross + Mx / Z_mod;
  const q_min = qgross - Mx / Z_mod;

  const proj = (B - colB / 1000) / 2;
  const cover = 50;
  const d_eff = thick * 1000 - cover - 10;

  const Mu_found = (qnet * proj * proj) / 2;
  const Mulim = (0.138 * fck * 1000 * d_eff * d_eff) / 1e6;

  const Mu_Nmm = Mu_found * 1e6;
  const a_q = (0.87 * fy) / (fck * 1000);
  const b_q = -0.87 * fy * d_eff;
  const c_q = Mu_Nmm;
  const disc = b_q * b_q - 4 * a_q * c_q;
  const Ast_m =
    disc >= 0
      ? Math.max(
          (-b_q - Math.sqrt(disc)) / (2 * a_q),
          0.0012 * 1000 * thick * 1000,
        )
      : 0.0012 * 1000 * thick * 1000;

  const barDia = 12;
  const spcFtg =
    Math.floor((1000 * Math.PI * barDia * barDia) / 4 / Ast_m / 5) * 5;
  const spcOk = Math.min(Math.max(spcFtg, 75), 300);

  const b0 = 2 * (colB + d_eff + (colD + d_eff));
  const Vp =
    (qnet * 1000 - (qnet * (colB + d_eff) * (colD + d_eff)) / 1e6) * A * 1000;
  const tau_vp = Vp / (b0 * d_eff);
  const ks = Math.min(1 + Math.min(colD / colB, 2), 1);
  const tau_cp = ks * 0.25 * Math.sqrt(fck);
  const punchPass = tau_vp <= tau_cp || tau_vp < 3.1;

  return {
    B: B.toFixed(2),
    L: L.toFixed(2),
    A: A.toFixed(2),
    Areq: Areq.toFixed(2),
    qnet: qnet.toFixed(1),
    qgross: qgross.toFixed(1),
    q_max: q_max.toFixed(1),
    q_min: q_min.toFixed(1),
    proj: proj.toFixed(2),
    d_eff: Math.round(d_eff),
    Mu_found: Mu_found.toFixed(2),
    Mulim: Mulim.toFixed(2),
    passM: Mu_found <= Mulim,
    passSBC: q_max <= sbc,
    Ast_m: Ast_m.toFixed(0),
    barDia,
    spcOk: spcOk.toFixed(0),
    tau_vp: tau_vp.toFixed(3),
    tau_cp: tau_cp.toFixed(3),
    punchPass,
    bearingUtil: ((q_max / sbc) * 100).toFixed(1),
    momentUtil: ((Mu_found / Mulim) * 100).toFixed(1),
  };
}

// ═══════════════════════════════════════════════════════════════
//  FOUNDATION DESIGN — wrapper for FoundationPage
//  Supports isolated / combined / strip / raft with user B × L
// ═══════════════════════════════════════════════════════════════
export function analyzeFoundation({
  type = "isolated",
  P,
  Mx = 0,
  My = 0,
  SBC,
  D = 1.5,
  B,
  L,
  fck = 25,
  fy = 415,
  gamma = 18,
}) {
  const colB = 300; // assumed column width  (mm)
  const colD = 300; // assumed column depth  (mm)
  const thick = 0.5; // assumed footing thickness (m)

  // ── Pressures ─────────────────────────────────────────────
  const A = B * L;
  const Ptotal = P + 0.1 * P; // 10% self-weight
  const qgross = Ptotal / A;
  const qnet = P / A;

  // Eccentric loading
  const ZBx = (L * B * B) / 6;
  const ZBy = (B * L * L) / 6;
  const qmax = qgross + My / Math.max(ZBx, 0.001) + Mx / Math.max(ZBy, 0.001);
  const qmin = qgross - My / Math.max(ZBx, 0.001) - Mx / Math.max(ZBy, 0.001);

  // ── Effective depth ────────────────────────────────────────
  const cover = 50;
  const d_eff = thick * 1000 - cover - 10; // mm

  // ── Critical projection (from column face) ─────────────────
  const projB = (B - colB / 1000) / 2;
  const projL = (L - colD / 1000) / 2;
  const proj = Math.max(projB, projL, 0.1);

  // ── Flexure (IS 456 Cl. 34.2) ─────────────────────────────
  const Mu_found = (qmax * proj * proj) / 2; // kNm/m
  const Mulim = (0.138 * fck * 1000 * d_eff * d_eff) / 1e6;

  const Ast_min = 0.0012 * 1000 * thick * 1000;
  const Mu_Nmm = Mu_found * 1e6;
  const a_q = (0.87 * fy) / (fck * 1000);
  const b_q = -0.87 * fy * d_eff;
  const disc = b_q * b_q - 4 * a_q * Mu_Nmm;
  const Ast_req =
    disc >= 0
      ? Math.max((-b_q - Math.sqrt(disc)) / (2 * a_q), Ast_min)
      : Ast_min;

  const barDia = 12;
  const spc_calc =
    Math.floor((1000 * Math.PI * barDia * barDia) / 4 / Ast_req / 5) * 5;
  const spcOk = Math.min(Math.max(spc_calc, 75), 300);
  const Ast_prov = (1000 * Math.PI * barDia * barDia) / 4 / spcOk;

  // ── Punching shear (IS 456 Cl. 31.6) ──────────────────────
  const punchPerim = 2 * (colB + d_eff + (colD + d_eff));
  const A_punch = ((colB + d_eff) * (colD + d_eff)) / 1e6;
  const V_punch = qnet * Math.max(A - A_punch, 0) * 1000;
  const tau_v_punch = V_punch / (punchPerim * d_eff);
  const tau_c_punch = 0.25 * Math.sqrt(fck);
  const punchPass = tau_v_punch <= tau_c_punch;

  // ── One-way shear (IS 456 Cl. 31.7) ───────────────────────
  const tau_v_shear = (qnet * 1000 * proj) / d_eff;
  const tau_c_shear = 0.36 * Math.sqrt(fck);
  const shearPass = tau_v_shear <= tau_c_shear;

  // ── Pass / fail ────────────────────────────────────────────
  const passSBC = qmax <= SBC;
  const passM = Mu_found <= Mulim;

  return {
    B: B.toFixed(2),
    L: L.toFixed(2),
    qnet: qnet.toFixed(1),
    qmax: qmax.toFixed(1),
    qmin: qmin.toFixed(1),
    d_eff: Math.round(d_eff),
    proj: proj.toFixed(2),
    Mu: Mu_found.toFixed(2),
    Mulim: Mulim.toFixed(2),
    Ast_req: Ast_req.toFixed(0),
    Ast_min: Ast_min.toFixed(0),
    Ast_prov: Ast_prov.toFixed(0),
    barDia,
    spcOk: spcOk.toString(),
    tau_v_punch: tau_v_punch.toFixed(3),
    tau_c_punch: tau_c_punch.toFixed(3),
    punchPass,
    tau_v_shear: tau_v_shear.toFixed(3),
    tau_c_shear: tau_c_shear.toFixed(3),
    shearPass,
    passSBC,
    passM,
    pass: passSBC && passM && punchPass && shearPass,
  };
}

// ═══════════════════════════════════════════════════════════════
//  PILE GROUP DESIGN  (IS 2911)
// ═══════════════════════════════════════════════════════════════
export function analyzePileGroup({
  P,
  pileD = 0.5,
  pileL = 12,
  fs = 50,
  fb = 5000,
}) {
  const Q_skin = Math.PI * pileD * pileL * fs;
  const Q_end = 0.25 * Math.PI * pileD * pileD * fb;
  const Q_ult = Q_skin + Q_end;
  const Q_allow = Q_ult / (1000 * 2.5);

  const nPiles = Math.ceil(P / Q_allow);
  const spacing = 3 * pileD;
  const theta = Math.atan(pileD / spacing) * (180 / Math.PI);
  const nRows = Math.ceil(Math.sqrt(nPiles));
  const nCols = Math.ceil(nPiles / nRows);
  const Eg =
    nPiles > 1
      ? 1 -
        ((theta / 90) * ((nRows - 1) * nCols + (nCols - 1) * nRows)) /
          (nRows * nCols)
      : 1.0;
  const Q_group = Eg * nPiles * Q_allow;

  return {
    Q_allow: Q_allow.toFixed(0),
    Q_skin: (Q_skin / 1000).toFixed(0),
    Q_end: (Q_end / 1000).toFixed(0),
    nPiles,
    pileD: (pileD * 1000).toFixed(0),
    pileL,
    spacing: (spacing * 1000).toFixed(0),
    Eg: (Eg * 100).toFixed(1),
    Q_group: Q_group.toFixed(0),
    groupPass: Q_group >= P,
  };
}
