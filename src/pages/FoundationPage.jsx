import { useState, useEffect } from 'react'
import { C, F } from '@styles/tokens'
import { Card, TwoCol, StatGrid, StatBox, UtilBar, PassFail, TabBtn, Inp, SectionTitle, InfoBox, ResultRow, Divider } from '@components/ui'
import { analyzeIsolatedFooting, analyzePileGroup } from '@engines/structuralEngine'

// ── FOOTING PLAN SVG ──────────────────────────────────────────
function FootingPlan({ B, L, colB, colD, proj, qnet, sbc }) {
  const scale = Math.min(200 / parseFloat(B), 160 / parseFloat(L))
  const fw = parseFloat(B) * scale, fh = parseFloat(L) * scale
  const cw = (colB / 1000) * scale, ch = (colD / 1000) * scale
  const ox = (260 - fw) / 2, oy = (180 - fh) / 2
  return (
    <svg width={260} height={200} style={{ display: 'block', margin: '0 auto' }}>
      <rect x={ox} y={oy} width={fw} height={fh} fill="#e6f9f5" stroke={C.teal} strokeWidth={2} rx={2} />
      <rect x={ox+(fw-cw)/2} y={oy+(fh-ch)/2} width={cw} height={ch} fill="#c8d8f0" stroke={C.blue} strokeWidth={2} />
      {/* Critical section for punching (d/2 from col face) */}
      <rect x={ox+(fw-cw)/2 - 8} y={oy+(fh-ch)/2 - 8} width={cw+16} height={ch+16}
        fill="none" stroke={C.red} strokeWidth={1} strokeDasharray="4,3" opacity={0.6} />
      <text x={ox+(fw-cw)/2+cw+12} y={oy+(fh-ch)/2 - 4} fill={C.red} fontSize={7} fontFamily={F.mono}>punch perim.</text>
      <line x1={ox} y1={oy+fh/2} x2={ox+(fw-cw)/2} y2={oy+fh/2} stroke={C.orange} strokeWidth={1.5} strokeDasharray="4,3" />
      <text x={ox+(fw-cw)/4} y={oy+fh/2-5} textAnchor="middle" fill={C.orange} fontSize={9} fontFamily={F.mono}>{proj} m</text>
      <line x1={ox} y1={oy+fh+14} x2={ox+fw} y2={oy+fh+14} stroke={C.inkFaint} strokeWidth={1} />
      <text x={ox+fw/2} y={oy+fh+26} textAnchor="middle" fill={C.inkMid} fontSize={10} fontFamily={F.mono}>B = {B} m</text>
      <text x={ox+fw/2} y={oy-8} textAnchor="middle" fill={C.inkLight} fontSize={8} fontFamily={F.mono}>q = {qnet} kN/m²</text>
    </svg>
  )
}

// ── FOOTING ELEVATION SVG ─────────────────────────────────────
function FootingElevation({ B, thick, colB }) {
  const scale = 180 / parseFloat(B)
  const fw = parseFloat(B) * scale
  const fh = Math.max(thick * scale * 1.5, 35)
  const cw = (colB / 1000) * scale
  const ox = (260 - fw) / 2, oy = 32
  return (
    <svg width={260} height={130} style={{ display: 'block', margin: '12px auto 0' }}>
      <rect x={ox+(fw-cw)/2} y={10} width={cw} height={oy} fill="#c8d8f0" stroke={C.blue} strokeWidth={1.5} />
      <rect x={ox} y={oy} width={fw} height={fh} fill="#dde4ef" stroke={C.teal} strokeWidth={2} rx={2} />
      {Array.from({ length: 5 }, (_, i) => (
        <circle key={i} cx={ox + (i+1)*fw/6} cy={oy + fh - 8} r={4} fill={C.orange} />
      ))}
      {/* d_eff marker */}
      <line x1={ox + fw + 4} y1={oy} x2={ox + fw + 4} y2={oy + fh - 8} stroke={C.green} strokeWidth={1} strokeDasharray="3,2" />
      <text x={ox + fw + 8} y={oy + fh / 2} fill={C.green} fontSize={7} fontFamily={F.mono}>d</text>
      <line x1={20} y1={oy+fh+2} x2={240} y2={oy+fh+2} stroke={C.inkMid} strokeWidth={2} />
      {Array.from({ length: 10 }, (_, i) => (
        <line key={i} x1={20+i*22} y1={oy+fh+2} x2={14+i*22} y2={oy+fh+10} stroke={C.inkMid} strokeWidth={1} />
      ))}
      <text x={130} y={oy+fh+22} textAnchor="middle" fill={C.inkMid} fontSize={9} fontFamily={F.mono}>ELEVATION</text>
    </svg>
  )
}

// ── PILE SKETCH SVG ───────────────────────────────────────────
function PileSketch({ nPiles, pileD, Q_allow }) {
  const n = Math.min(nPiles, 9)
  const cols = Math.ceil(Math.sqrt(n))
  return (
    <svg width={280} height={220} style={{ display: 'block', margin: '0 auto' }}>
      <rect x={30} y={30} width={220} height={28} fill="#dde4ef" stroke={C.teal} strokeWidth={2} rx={2} />
      {Array.from({ length: n }, (_, i) => {
        const col = i % cols
        const cx = cols <= 1 ? 140 : 80 + col * (120 / Math.max(cols - 1, 1))
        return (
          <g key={i}>
            <rect x={cx - 8} y={58} width={16} height={112} fill="#c8d8f0" stroke={C.teal} strokeWidth={1.5} />
            <ellipse cx={cx} cy={170} rx={8} ry={5} fill={C.teal} opacity={0.6} />
          </g>
        )
      })}
      <line x1={20} y1={175} x2={260} y2={175} stroke={C.inkMid} strokeWidth={2.5} />
      {Array.from({ length: 8 }, (_, i) => (
        <line key={i} x1={20+i*30} y1={175} x2={14+i*30} y2={183} stroke={C.inkMid} strokeWidth={1.5} />
      ))}
      <text x={140} y={197} textAnchor="middle" fill={C.inkMid} fontSize={9} fontFamily={F.mono}>Hard Stratum</text>
      <text x={140} y={212} textAnchor="middle" fill={C.teal} fontSize={10} fontFamily={F.mono}>
        {nPiles} pile(s) — ⌀{pileD} mm — {Q_allow} kN/pile
      </text>
    </svg>
  )
}

// ── PAGE ──────────────────────────────────────────────────────
export default function FoundationPage({ onDataChange }) {
  const [type, setType]   = useState('isolated')
  const [P, setP]         = useState(800)
  const [Mx, setMx]       = useState(40)
  const [sbc, setSbc]     = useState(150)
  const [colB, setColB]   = useState(400)
  const [colD, setColD]   = useState(400)
  const [fck, setFck]     = useState(25)
  const [fy, setFy]       = useState(415)
  const [Df, setDf]       = useState(1.5)
  const [thick, setThick] = useState(0.5)
  // Pile inputs
  const [pileD, setPileD] = useState(0.5)
  const [pileL, setPileL] = useState(12)
  const [fs, setFs]       = useState(50)
  const [fb, setFb]       = useState(5000)

  const footing = analyzeIsolatedFooting({ P, Mx, sbc, colB, colD, fck, fy, Df, thick })
  const pile    = analyzePileGroup({ P, pileD, pileL, fs, fb })

  useEffect(() => {
    onDataChange?.({ type, P, Mx, sbc, colB, colD, fck, result: footing })
  }, [type, P, Mx, sbc, colB, colD, fck, thick, pileD, pileL, fs, fb])

  return (
    <TwoCol
      left={<>
        <Card>
          <SectionTitle>Foundation Type</SectionTitle>
          <div style={{ display: 'flex', gap: 6 }}>
            {[['isolated','Isolated'],['raft','Raft'],['pile','Pile']].map(([v, l]) => (
              <TabBtn key={v} active={type === v} onClick={() => setType(v)} color={C.teal}>{l}</TabBtn>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle>Column Loading</SectionTitle>
          <Inp label="Axial Load P (kN)" value={P} onChange={setP} min={0} />
          <Inp label="Moment Mx (kNm)" value={Mx} onChange={setMx} min={0} />
          <Inp label="Column Width (mm)" value={colB} onChange={setColB} min={100} />
          <Inp label="Column Depth (mm)" value={colD} onChange={setColD} min={100} />
        </Card>

        {type === 'isolated' && <>
          <Card>
            <SectionTitle>Soil & Site</SectionTitle>
            <Inp label="Safe Bearing Capacity (kN/m²)" value={sbc} onChange={setSbc} min={50} />
            <Inp label="Foundation Depth Df (m)" value={Df} onChange={setDf} min={0.5} step={0.25} />
            <Inp label="Footing Thickness (m)" value={thick} onChange={setThick} min={0.3} step={0.05} />
          </Card>
          <Card>
            <SectionTitle>Material</SectionTitle>
            <Inp label="Concrete fck (MPa)" value={fck} onChange={setFck}
              options={[{v:20,l:'M20'},{v:25,l:'M25'},{v:30,l:'M30'},{v:35,l:'M35'}]} />
            <Inp label="Steel fy (MPa)" value={fy} onChange={setFy}
              options={[{v:250,l:'Fe250'},{v:415,l:'Fe415'},{v:500,l:'Fe500'}]} />
          </Card>
        </>}

        {type === 'pile' && <>
          <Card>
            <SectionTitle>Pile Parameters</SectionTitle>
            <Inp label="Pile Diameter (m)" value={pileD} onChange={setPileD} min={0.2} max={1.5} step={0.05} />
            <Inp label="Pile Length (m)" value={pileL} onChange={setPileL} min={3} max={60} />
          </Card>
          <Card>
            <SectionTitle>Soil Resistance (IS 2911)</SectionTitle>
            <Inp label="Unit Skin Friction fs (kN/m²)" value={fs} onChange={setFs} min={5} step={5} />
            <Inp label="End Bearing fb (kN/m²)" value={fb} onChange={setFb} min={500} step={500} />
          </Card>
        </>}
      </>}

      right={<>
        {type === 'isolated' && <>
          <Card>
            <SectionTitle>Footing Plan & Elevation</SectionTitle>
            <FootingPlan B={footing.B} L={footing.L} colB={colB} colD={colD}
              proj={footing.proj} qnet={footing.qnet} sbc={sbc} />
            <FootingElevation B={footing.B} thick={thick} colB={colB} />
          </Card>

          <Card>
            <StatGrid cols={3}>
              <StatBox label="Size B×L" value={`${footing.B}×${footing.L}`} unit="m" color={C.teal} />
              <StatBox label="d effective" value={footing.d_eff} unit="mm" color={C.blue} />
              <StatBox label="Net q" value={footing.qnet} unit="kN/m²" color={C.orange} />
            </StatGrid>
          </Card>

          {/* Bearing check */}
          <Card accentColor={footing.passSBC ? C.green : C.red}>
            <PassFail pass={footing.passSBC} code="IS 456:2000 Cl. 34 — Bearing Pressure" />
            <ResultRow label="q_max (eccentric)" value={footing.q_max} unit="kN/m²" />
            <ResultRow label="q_min" value={footing.q_min} unit="kN/m²" />
            <ResultRow label="SBC limit" value={sbc} unit="kN/m²" highlight />
            <div style={{ height: 10 }} />
            <UtilBar pct={footing.bearingUtil} label="Bearing Utilization" color={C.teal} />
          </Card>

          {/* Flexure check */}
          <Card accentColor={footing.passM ? C.green : C.red}>
            <PassFail pass={footing.passM} code="IS 456:2000 Cl. 34.4 — Flexure" />
            <ResultRow label="Mu (critical section)" value={footing.Mu_found} unit="kNm/m" />
            <ResultRow label="Mulim" value={footing.Mulim} unit="kNm/m" highlight />
            <Divider />
            <ResultRow label="Ast required" value={footing.Ast_m} unit="mm²/m" />
            <ResultRow label={`⌀${footing.barDia} @ ${footing.spcOk} mm c/c`} value="provided" highlight />
            <div style={{ height: 10 }} />
            <UtilBar pct={footing.momentUtil} label="Moment Utilization" />
          </Card>

          {/* Punching shear */}
          <Card accentColor={footing.punchPass ? C.green : C.red}>
            <PassFail pass={footing.punchPass} code="IS 456:2000 Cl. 31.6 — Punching Shear" />
            <ResultRow label="τv (punching)" value={footing.tau_vp} unit="N/mm²" />
            <ResultRow label="τcp (allowable)" value={footing.tau_cp} unit="N/mm²" highlight />
          </Card>
        </>}

        {type === 'raft' && <>
          <Card>
            <SectionTitle>Raft Foundation (IS 2950)</SectionTitle>
            <svg width="100%" height={130} viewBox="0 0 560 130">
              <rect x={20} y={60} width={520} height={25} fill="#dde4ef" stroke={C.teal} strokeWidth={2} />
              {[80,180,280,380,480].map(cx => (
                <rect key={cx} x={cx-25} y={20} width={50} height={40} fill="#c8d8f0" stroke={C.blue} strokeWidth={1.5} />
              ))}
              <text x={280} y={105} textAnchor="middle" fill={C.teal} fontSize={11} fontFamily={F.mono}>RAFT SLAB</text>
              <line x1={10} y1={90} x2={550} y2={90} stroke={C.inkMid} strokeWidth={1} />
            </svg>
          </Card>
          <Card>
            <InfoBox color={C.teal} lightColor={C.tealLight}>
              <strong>When to use Raft Foundation (IS 2950):</strong><br /><br />
              • SBC is low ({'<'} 100 kN/m²) or soil is expansive<br />
              • Differential settlement is a concern<br />
              • Column loads are heavy and closely spaced<br /><br />
              <strong>Design Methods:</strong><br />
              • Conventional rigid method (stiff rafts)<br />
              • Flexible plate theory (flexible rafts)<br /><br />
              <strong>Min Thickness:</strong> L/20 or 300 mm (whichever is greater)<br />
              <strong>Reinforcement:</strong> Two-way top & bottom
            </InfoBox>
          </Card>
        </>}

        {type === 'pile' && <>
          <Card>
            <SectionTitle>Pile Group Layout</SectionTitle>
            <PileSketch nPiles={pile.nPiles} pileD={pile.pileD} Q_allow={pile.Q_allow} />
          </Card>

          <Card>
            <StatGrid cols={3}>
              <StatBox label="Piles Required" value={pile.nPiles} color={C.teal} />
              <StatBox label="Allowable/Pile" value={pile.Q_allow} unit="kN" color={C.blue} />
              <StatBox label="Group Eff." value={`${pile.Eg}%`} color={pile.groupPass ? C.green : C.red} />
            </StatGrid>
          </Card>

          <Card accentColor={pile.groupPass ? C.green : C.red}>
            <PassFail pass={pile.groupPass} code="IS 2911 — Pile Group Capacity" />
            <ResultRow label="Skin Friction Capacity" value={pile.Q_skin} unit="kN" />
            <ResultRow label="End Bearing Capacity" value={pile.Q_end} unit="kN" />
            <ResultRow label="Allowable per Pile (FOS 2.5)" value={pile.Q_allow} unit="kN" highlight />
            <Divider />
            <ResultRow label="Min Pile Spacing" value={pile.spacing} unit="mm" />
            <ResultRow label="Group Efficiency" value={`${pile.Eg}%`} highlight />
            <ResultRow label="Group Load Capacity" value={pile.Q_group} unit="kN" />
          </Card>
        </>}
      </>}
    />
  )
}