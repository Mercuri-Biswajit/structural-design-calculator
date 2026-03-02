import { useState, useEffect } from 'react'
import { C, F } from '@styles/tokens'
import { Card, TwoCol, StatGrid, StatBox, UtilBar, PassFail, TabBtn, Inp, SectionTitle, InfoBox, ResultRow, Divider } from '@components/ui'
import { analyzeColumn } from '@engines/structuralEngine'

// ── COLUMN SKETCH SVG ─────────────────────────────────────────
function ColumnSketch({ b, d, material, P, Mx, My, Le }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 40 }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 10, color: C.inkLight, fontFamily: F.mono, marginBottom: 6, letterSpacing: '1px', textTransform: 'uppercase' }}>Elevation</p>
        <svg width={140} height={230}>
          <rect x={50} y={30} width={50} height={170} fill={material === 'concrete' ? '#dde4ef' : '#e8ddd0'} stroke={C.blue} strokeWidth={2} rx={2} />
          {material === 'concrete' && [[57,38],[93,38],[57,192],[93,192]].map(([cx,cy],i) =>
            <circle key={i} cx={cx} cy={cy} r={5} fill={C.orange} />
          )}
          {material === 'steel' && <>
            <rect x={50} y={30} width={50} height={12} fill={C.orange} opacity={0.7} />
            <rect x={50} y={188} width={50} height={12} fill={C.orange} opacity={0.7} />
            <rect x={71} y={42} width={8} height={146} fill={C.orange} opacity={0.4} />
          </>}
          <line x1={75} y1={5} x2={75} y2={28} stroke={C.red} strokeWidth={2.5} />
          <polygon points="75,30 69,18 81,18" fill={C.red} />
          <text x={82} y={20} fill={C.red} fontSize={9} fontFamily={F.mono}>{P} kN</text>
          <path d="M 110 115 Q 128 105 120 95" stroke={C.orange} strokeWidth={2} fill="none" />
          <polygon points="120,93 113,101 122,103" fill={C.orange} />
          <text x={115} y={132} fill={C.orange} fontSize={8} fontFamily={F.mono}>Mx={Mx}</text>
          <line x1={20} y1={30} x2={20} y2={200} stroke={C.inkFaint} strokeWidth={1} strokeDasharray="3,3" />
          <text x={14} y={118} fill={C.inkLight} fontSize={8} fontFamily={F.mono} transform="rotate(-90,14,118)">Le = {Le} m</text>
          <text x={75} y={222} textAnchor="middle" fill={C.inkMid} fontSize={9} fontFamily={F.mono}>{b}×{d} mm</text>
        </svg>
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 10, color: C.inkLight, fontFamily: F.mono, marginBottom: 6, letterSpacing: '1px', textTransform: 'uppercase' }}>Plan View</p>
        <svg width={120} height={120}>
          <rect x={10} y={10} width={100} height={100} fill={material === 'concrete' ? '#dde4ef' : '#e8ddd0'} stroke={C.blue} strokeWidth={2} rx={2} />
          {material === 'concrete' && [[18,18],[102,18],[18,102],[102,102]].map(([cx,cy],i) =>
            <circle key={i} cx={cx} cy={cy} r={6} fill={C.orange} />
          )}
          <line x1={10} y1={60} x2={110} y2={60} stroke={C.inkFaint} strokeWidth={0.8} strokeDasharray="3,3" />
          <line x1={60} y1={10} x2={60} y2={110} stroke={C.inkFaint} strokeWidth={0.8} strokeDasharray="3,3" />
          {/* Mx arrow */}
          <path d="M 110 60 Q 120 50 110 40" stroke={C.orange} strokeWidth={2} fill="none" />
          <polygon points="110,38 103,46 115,47" fill={C.orange} />
          <text x={118} y={52} fill={C.orange} fontSize={8} fontFamily={F.mono}>Mx</text>
          {/* My arrow */}
          <path d="M 60 10 Q 72 6 76 14" stroke={C.purple} strokeWidth={2} fill="none" />
          <polygon points="76,15 66,12 70,20" fill={C.purple} />
          <text x={76} y={10} fill={C.purple} fontSize={8} fontFamily={F.mono}>My={My}</text>
          <text x={60} y={118} textAnchor="middle" fill={C.inkMid} fontSize={8} fontFamily={F.mono}>{b} mm</text>
        </svg>
      </div>
    </div>
  )
}

// ── PAGE ──────────────────────────────────────────────────────
export default function ColumnPage({ onDataChange }) {
  const [P, setP]               = useState(800)
  const [Mx, setMx]             = useState(60)
  const [My, setMy]             = useState(30)
  const [b, setB]               = useState(400)
  const [d, setD]               = useState(400)
  const [Le, setLe]             = useState(3.5)
  const [material, setMaterial] = useState('concrete')
  const [fck, setFck]           = useState(25)
  const [fy, setFy]             = useState(415)
  const [steelPct, setSteelPct] = useState(2)

  const result = analyzeColumn({ P, Mx, My, b, d, Le, material, fck, fy, steelPct })

  useEffect(() => {
    onDataChange?.({ P, Mx, My, b, d, Le, material, fck, fy, steelPct, result })
  }, [P, Mx, My, b, d, Le, material, fck, fy, steelPct])

  return (
    <TwoCol
      left={<>
        <Card>
          <SectionTitle>Material</SectionTitle>
          <div style={{ display: 'flex', gap: 8 }}>
            <TabBtn active={material === 'concrete'} onClick={() => setMaterial('concrete')}>Concrete</TabBtn>
            <TabBtn active={material === 'steel'} onClick={() => setMaterial('steel')} color={C.orange}>Steel</TabBtn>
          </div>
        </Card>

        <Card>
          <SectionTitle>Applied Loads</SectionTitle>
          <Inp label="Axial Load P (kN)" value={P} onChange={setP} min={0} />
          <Inp label="Moment Mx (kNm) — about x-axis" value={Mx} onChange={setMx} min={0} />
          <Inp label="Moment My (kNm) — about y-axis" value={My} onChange={setMy} min={0} />
        </Card>

        <Card>
          <SectionTitle>Section Dimensions</SectionTitle>
          <Inp label="Width b (mm)" value={b} onChange={setB} min={100} />
          <Inp label="Depth d (mm)" value={d} onChange={setD} min={100} />
          <Inp label="Effective Length Le (m)" value={Le} onChange={setLe} min={0.5} step={0.1} />
        </Card>

        {material === 'concrete' && (
          <Card>
            <SectionTitle>Material Grade</SectionTitle>
            <Inp label="Concrete fck (MPa)" value={fck} onChange={setFck}
              options={[{v:20,l:'M20'},{v:25,l:'M25'},{v:30,l:'M30'},{v:35,l:'M35'},{v:40,l:'M40'}]} />
            <Inp label="Steel fy (MPa)" value={fy} onChange={setFy}
              options={[{v:250,l:'Fe250'},{v:415,l:'Fe415'},{v:500,l:'Fe500'},{v:550,l:'Fe550'}]} />
            <Inp label="Steel Ratio (%)" value={steelPct} onChange={setSteelPct}
              options={[{v:0.8,l:'0.8% (minimum)'},{v:1,l:'1.0%'},{v:1.5,l:'1.5%'},{v:2,l:'2.0%'},{v:2.5,l:'2.5%'},{v:3,l:'3.0%'},{v:4,l:'4.0%'},{v:5,l:'5.0%'},{v:6,l:'6.0% (maximum)'}]} />
          </Card>
        )}
      </>}

      right={<>
        <Card>
          <SectionTitle>Column Schematic</SectionTitle>
          <ColumnSketch b={b} d={d} material={material} P={P} Mx={Mx} My={My} Le={Le} />
        </Card>

        {/* Key stats */}
        <Card>
          <StatGrid cols={3}>
            <StatBox label="Axial Capacity" value={result.Pu_cap} unit="kN" color={C.blue} />
            <StatBox label="λ (x-axis)" value={result.lx} color={result.isSlender ? C.red : C.green} />
            <StatBox label="Column Type" value={result.isSlender ? 'SLENDER' : 'SHORT'} color={result.isSlender ? C.orange : C.green} />
          </StatGrid>
        </Card>

        {/* Axial check */}
        <Card accentColor={result.pass ? C.green : C.red}>
          <PassFail pass={P <= parseFloat(result.Pu_cap)} code={`${result.code} Cl. 39.3 — Axial Capacity`} />
          <StatGrid cols={2}>
            <StatBox label="Applied P" value={P} unit="kN" color={C.ink} />
            <StatBox label="Capacity Pu" value={result.Pu_cap} unit="kN" color={C.green} />
          </StatGrid>
          <div style={{ height: 10 }} />
          <UtilBar pct={((P / parseFloat(result.Pu_cap)) * 100).toFixed(1)} label="Axial Load Utilization" />
        </Card>

        {/* Biaxial bending check — concrete only */}
        {material === 'concrete' && (
          <Card accentColor={result.biaxialPass ? C.green : C.red}>
            <PassFail pass={result.biaxialPass} code={`${result.code} Cl. 39.6 — Biaxial Bending`} />
            <ResultRow label="Design Mx (incl. emin)" value={result.Mx_design} unit="kNm" />
            <ResultRow label="Design My (incl. emin)" value={result.My_design} unit="kNm" />
            <Divider />
            <ResultRow label="Uniaxial Capacity Mux1" value={result.Mux1} unit="kNm" />
            <ResultRow label="Uniaxial Capacity Muy1" value={result.Muy1} unit="kNm" />
            <Divider />
            <ResultRow label="Exponent αn" value={result.alphaN} />
            <ResultRow label="Interaction Value (≤ 1.0)" value={result.biaxial_lhs} highlight />
            <div style={{ height: 10 }} />
            <UtilBar pct={(parseFloat(result.biaxial_lhs) * 100).toFixed(1)} label="Biaxial Interaction" />
          </Card>
        )}

        {/* Eccentricity */}
        {material === 'concrete' && (
          <Card>
            <SectionTitle>Min Eccentricity Check (IS 456 Cl. 25.4)</SectionTitle>
            <ResultRow label="emin,x" value={`${result.emin_x} mm`} />
            <ResultRow label="emin,y" value={`${result.emin_y} mm`} />
            <ResultRow label="Slenderness λx" value={result.lx} />
            <ResultRow label="Slenderness λy" value={result.ly} />
            {result.isSlender && (
              <div style={{ marginTop: 10 }}>
                <InfoBox color={C.yellow} lightColor={C.yellowLight}>
                  ⚠ Slender column (λ = {result.lambda}). Additional moments per IS 456 Cl. 39.7 must be included.
                </InfoBox>
              </div>
            )}
          </Card>
        )}

        {/* Overall pass/fail */}
        <Card accentColor={result.pass ? C.green : C.red}>
          <PassFail pass={result.pass} code={`${result.code} — Overall Design Check`} />
          {material === 'concrete' && (
            <InfoBox color={C.blue} lightColor={C.blueLight}>
              Steel provided: {result.steelPct}% of Ag = <strong>{result.Asc} mm²</strong><br />
              Limits: 0.8% (min) to 6.0% (max) of Ag = {(b * d * 0.008).toFixed(0)}–{(b * d * 0.06).toFixed(0)} mm²
            </InfoBox>
          )}
        </Card>
      </>}
    />
  )
}