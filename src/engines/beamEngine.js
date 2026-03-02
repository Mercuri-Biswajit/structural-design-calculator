/**
 * Beam Analysis & Design Engine — IS 456:2000 / IS 800:2007
 *
 * FIXES:
 *  - Fixed-fixed beam now uses force method (fixed-end moments)
 *  - Reinforcement design: Ast required, bar selection
 *  - Shear design: τv vs τc check, stirrup spacing
 *  - Deflection: L/d ratio check per IS 456 Cl. 23.2
 *  - fck, fy now user-configurable
 */

// ── BEAM ANALYSIS ─────────────────────────────────────────────
export function analyzeBeam(span, loads, support) {
  const n  = 400
  const dx = span / n
  const x  = Array.from({ length: n + 1 }, (_, i) => i * dx)

  let totalLoad    = 0
  let momentAboutA = 0

  loads.forEach(l => {
    if (l.type === 'udl') {
      const W = l.w * (l.end - l.start)
      totalLoad    += W
      momentAboutA += W * (l.start + l.end) / 2
    }
    if (l.type === 'point') {
      totalLoad    += l.p
      momentAboutA += l.p * l.pos
    }
  })

  let Ra, Rb, Ma = 0, Mb = 0

  if (support === 'cantilever') {
    Ra = totalLoad
    Rb = 0

  } else if (support === 'fixed') {
    // Fixed-end moments via force method
    loads.forEach(l => {
      const L = span
      if (l.type === 'udl') {
        const a = l.start, len = l.end - l.start, w = l.w
        // Standard partial UDL fixed-end moment formula
        const b_end = L - a - len
        Ma += (w * len / (L * L)) * (a * len * len / 2 + len * len * len / 6 + a * a * len / 2 + a * a * a / 3 - a * a * L / 2 - a * len * L + a * L * L / 3)
        Mb += (w * len / (L * L)) * (len * len * len / 6 + b_end * len * len / 2 + b_end * b_end * len / 2 + b_end * b_end * b_end / 3 - b_end * b_end * L / 2 - b_end * len * L + b_end * L * L / 3)
      }
      if (l.type === 'point') {
        const a = l.pos, b_dist = L - a, P = l.p
        Ma += P * a * b_dist * b_dist / (L * L)
        Mb += P * a * a * b_dist / (L * L)
      }
    })
    // Reactions from FEM + vertical equilibrium
    Rb  = span > 0 ? (momentAboutA - Ma + Mb) / span : 0
    Ra  = totalLoad - Rb

  } else {
    // Simply supported
    Rb = span > 0 ? momentAboutA / span : 0
    Ra = totalLoad - Rb
  }

  // SFD
  const q = xi => loads
    .filter(l => l.type === 'udl' && xi >= l.start && xi <= l.end)
    .reduce((s, l) => s + l.w, 0)

  const sfd = [Ra]
  for (let i = 1; i <= n; i++) {
    const pl = loads
      .filter(l => l.type === 'point' && Math.abs(x[i] - l.pos) < dx * 1.5)
      .reduce((s, l) => s + l.p, 0)
    sfd.push(sfd[i - 1] - q(x[i - 1]) * dx - pl)
  }

  // BMD — starts at -Ma for fixed end
  const bmd = [support === 'fixed' ? -Ma : 0]
  for (let i = 1; i <= n; i++) bmd.push(bmd[i - 1] + sfd[i - 1] * dx)

  const maxV = Math.max(...sfd.map(Math.abs))
  const maxM = Math.max(...bmd.map(Math.abs))

  return { x, sfd, bmd, Ra, Rb, Ma, Mb, totalLoad, maxV, maxM }
}

// ── SECTION DESIGN ────────────────────────────────────────────
export function checkBeamSection(
  material, b, d, Mu, Vu = 0, span = 1,
  fck = 25, fy = 415, fySteel = 250
) {
  if (material === 'concrete') {
    const cover = 25
    const barDiaEst = 20
    const d_eff = d - cover - 8 - barDiaEst / 2   // effective depth mm

    // ── Flexure capacity (IS 456 Cl. G-1.1) ────────────────
    const Mulim = 0.138 * fck * b * d_eff * d_eff / 1e6  // kNm

    // ── Ast required (quadratic from moment equation) ───────
    const Mu_Nmm = Mu * 1e6
    const a_q = (0.87 * fy) / (fck * b)
    const b_q = -0.87 * fy * d_eff
    const c_q = Mu_Nmm
    const disc = b_q * b_q - 4 * a_q * c_q
    let Ast = disc >= 0 ? (-b_q - Math.sqrt(Math.max(disc, 0))) / (2 * a_q) : 0

    // Min Ast (IS 456 Cl. 26.5.1.1)
    const Ast_min = 0.85 * b * d_eff / fy
    const Ast_max = 0.04 * b * d
    const Ast_req = Math.max(Ast, Ast_min)

    // ── Bar selection ───────────────────────────────────────
    const barSizes = [8, 10, 12, 16, 20, 25, 32]
    let selDia = 16, selN = 4
    for (const dia of barSizes) {
      const area = Math.PI * dia * dia / 4
      const n    = Math.ceil(Ast_req / area)
      if (n >= 2 && n <= 8) { selDia = dia; selN = n; break }
    }
    const Ast_prov = selN * Math.PI * selDia * selDia / 4
    const pt       = (Ast_prov / (b * d_eff)) * 100

    // ── Shear (IS 456 Cl. 40) ──────────────────────────────
    const tau_v = Vu > 0 ? (Vu * 1000) / (b * d_eff) : 0

    // τc from IS 456 Table 19 — polynomial fit (M25, varies with pt)
    // τc = 0.85*√(0.8*fck) * (√(1 + 5β) - 1) / 6β,  β = 0.8fck/(6.89*pt)
    const beta  = Math.max((0.8 * fck) / (6.89 * Math.max(pt, 0.15)), 1)
    const tau_c = Math.min(
      (0.85 * Math.sqrt(0.8 * fck) * (Math.sqrt(1 + 5 * beta) - 1)) / (6 * beta),
      fck <= 20 ? 2.8 : fck <= 25 ? 3.1 : fck <= 30 ? 3.5 : 3.7
    )
    const tau_max = fck <= 20 ? 2.8 : fck <= 25 ? 3.1 : fck <= 30 ? 3.5 : 3.7

    const shearPass  = tau_v <= tau_max
    const needsLinks = tau_v > tau_c

    // Stirrup spacing (IS 456 Cl. 40.4)
    const sv_dia  = 8
    const Asv     = 2 * Math.PI * sv_dia * sv_dia / 4
    let stirrupSpc
    if (needsLinks && Vu > 0) {
      const Vus  = Math.max((tau_v - tau_c) * b * d_eff, 1)  // N
      stirrupSpc = Math.floor(Math.min(
        (0.87 * fy * Asv * d_eff) / Vus,
        0.75 * d_eff,
        300
      ) / 5) * 5   // round to 5mm
    } else {
      stirrupSpc = Math.floor(Math.min(0.75 * d_eff, 300) / 5) * 5
    }
    stirrupSpc = Math.max(stirrupSpc, 75)

    // ── Deflection L/d check (IS 456 Cl. 23.2.1) ───────────
    // Basic L/d: 26 SS, 7 cant, 26 (FF taken as continuous ≈ 26)
    const ldBasic  = 26
    // Modification for tension steel (simplified, IS 456 Fig. 4)
    const ptProv   = (Ast_prov / (b * d_eff)) * 100
    const mf_t     = Math.min(2.0, 1.6 - 0.1 * ptProv + 0.05 * (fy / 415))
    const ldAllow  = ldBasic * Math.max(mf_t, 0.8)
    const ldActual = (span * 1000) / d_eff
    const deflPass = ldActual <= ldAllow

    return {
      code: 'IS 456:2000',
      Mulim:      Mulim.toFixed(2),
      util:       (Mu / Mulim * 100).toFixed(1),
      pass:       Mu <= Mulim,
      d_eff:      Math.round(d_eff),
      // Flexure
      Ast_req:    Ast_req.toFixed(0),
      Ast_prov:   Ast_prov.toFixed(0),
      Ast_min:    Ast_min.toFixed(0),
      Ast_max:    Ast_max.toFixed(0),
      barDia:     selDia,
      nBars:      selN,
      pt:         pt.toFixed(3),
      // Shear
      tau_v:      tau_v.toFixed(3),
      tau_c:      tau_c.toFixed(3),
      tau_max:    tau_max.toFixed(1),
      shearPass,
      needsLinks,
      stirrupDia: sv_dia,
      stirrupSpc: stirrupSpc.toString(),
      // Deflection
      ldActual:   ldActual.toFixed(1),
      ldAllow:    ldAllow.toFixed(1),
      deflPass,
    }

  } else {
    // ── Steel IS 800:2007 ───────────────────────────────────
    const Ze   = b * d * d / 6
    const Md   = fySteel * Ze / (1.1 * 1e6)
    const Aw   = b * d * 0.45
    const Vd   = fySteel * Aw / (Math.sqrt(3) * 1.1 * 1000)
    return {
      code:       'IS 800:2007',
      Mulim:      Md.toFixed(2),
      util:       (Mu / Md * 100).toFixed(1),
      pass:       Mu <= Md,
      shearPass:  Vu <= Vd,
      Vd:         Vd.toFixed(1),
      shearUtil:  Vu > 0 ? (Vu / Vd * 100).toFixed(1) : '0.0',
    }
  }
}