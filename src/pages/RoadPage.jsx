import { useState, useEffect } from 'react'
import { C, F } from '@styles/tokens'
import { Card, TwoCol, StatGrid, StatBox, PassFail, TabBtn, Inp, SectionTitle, InfoBox, ResultRow, Divider } from '@components/ui'
import { calcHorizontalCurve, calcVerticalCurve, calcPavement } from '@engines/roadEngine'

function HorizontalCurveSVG({ R, V, delta, T, L, e, SD }) {
  return (
    <svg width="100%" height={190} viewBox="0 0 520 190">
      <line x1={50} y1={160} x2={220} y2={55} stroke={C.inkFaint} strokeWidth={1.5} strokeDasharray="6,4" />
      <line x1={300} y1={55} x2={470} y2={160} stroke={C.inkFaint} strokeWidth={1.5} strokeDasharray="6,4" />
      <path d="M 220 55 Q 260 12 300 55" fill="none" stroke={C.purple} strokeWidth={3} />
      <circle cx={220} cy={55} r={5} fill={C.purple} />
      <circle cx={300} cy={55} r={5} fill={C.purple} />
      <text x={208} y={50} fill={C.purple} fontSize={9} fontFamily={F.mono}>PC</text>
      <text x={305} y={50} fill={C.purple} fontSize={9} fontFamily={F.mono}>PT</text>
      <circle cx={260} cy={55} r={4} fill={C.inkMid} />
      <text x={265} y={52} fill={C.inkMid} fontSize={9} fontFamily={F.mono}>PI (Δ={delta}°)</text>
      <text x={128} y={112} fill={C.inkMid} fontSize={10} fontFamily={F.mono} transform="rotate(-27,128,112)">T = {T} m</text>
      <text x={370} y={112} fill={C.inkMid} fontSize={10} fontFamily={F.mono} transform="rotate(27,370,112)">T = {T} m</text>
      <text x={260} y={30} textAnchor="middle" fill={C.purple} fontSize={10} fontFamily={F.mono}>L = {L} m</text>
      <rect x={20} y={168} width={480} height={18} fill={C.bgAlt} rx={4} />
      <text x={260} y={181} textAnchor="middle" fill={C.inkMid} fontSize={9} fontFamily={F.mono}>
        R = {R} m  |  V = {V} km/h  |  e = {e}%  |  SSD = {SD} m
      </text>
    </svg>
  )
}

function VerticalCurveSVG({ g1, g2, Lvc, A, K, isSummit }) {
  const midY = isSummit ? 28 : 130
  return (
    <svg width="100%" height={170} viewBox="0 0 520 170">
      <line x1={40} y1={120} x2={200} y2={90} stroke={C.inkFaint} strokeWidth={1.5} strokeDasharray="6,4" />
      <line x1={320} y1={90} x2={480} y2={isSummit ? 128 : 58} stroke={C.inkFaint} strokeWidth={1.5} strokeDasharray="6,4" />
      <path d={`M 200 90 Q 260 ${midY} 320 90`} fill="none" stroke={C.purple} strokeWidth={3} />
      <circle cx={200} cy={90} r={5} fill={C.purple} />
      <circle cx={320} cy={90} r={5} fill={C.purple} />
      <text x={100} y={88} fill={C.inkMid} fontSize={11} fontFamily={F.mono}>G1={g1>0?'+':''}{g1}%</text>
      <text x={375} y={isSummit?128:60} fill={C.inkMid} fontSize={11} fontFamily={F.mono}>G2={g2>0?'+':''}{g2}%</text>
      <line x1={200} y1={150} x2={320} y2={150} stroke={C.inkFaint} strokeWidth={1} />
      <text x={260} y={165} textAnchor="middle" fill={C.inkMid} fontSize={10} fontFamily={F.mono}>L = {Lvc} m</text>
      <text x={260} y={isSummit ? 16 : 148} textAnchor="middle" fill={C.purple} fontSize={10} fontFamily={F.mono}>
        {isSummit ? '▲ SUMMIT CURVE' : '▽ SAG CURVE'}  |  A = {A}%  |  K = {K}
      </text>
    </svg>
  )
}

function PavementSVG({ layers }) {
  let y = 12
  return (
    <svg width="100%" height={220} viewBox="0 0 400 220">
      {layers.map(({ thk, label, fill, text, scaledH }) => {
        const el = (
          <g key={label}>
            <rect x={20} y={y} width={300} height={scaledH} fill={fill} stroke="#fff" strokeWidth={1} />
            <text x={170} y={y + scaledH / 2 + 4} textAnchor="middle" fill={text} fontSize={9} fontFamily={F.mono}>{label}</text>
            <text x={330} y={y + scaledH / 2 + 4} fill={C.inkMid} fontSize={9} fontFamily={F.mono}>{thk} mm</text>
          </g>
        )
        y += scaledH
        return el
      })}
      <rect x={20} y={y} width={300} height={18} fill="#c8b89a" />
      <text x={170} y={y + 12} textAnchor="middle" fill={C.inkMid} fontSize={9} fontFamily={F.mono}>Subgrade</text>
    </svg>
  )
}

export default function RoadPage({ onDataChange }) {
  const [tab, setTab]         = useState('horizontal')
  const [R, setR]             = useState(300)
  const [V, setV]             = useState(80)
  const [delta, setDelta]     = useState(30)
  const [g1, setG1]           = useState(3)
  const [g2, setG2]           = useState(-2)
  const [Lvc, setLvc]         = useState(200)
  const [traffic, setTraffic] = useState('medium')
  const [CBR, setCBR]         = useState(5)

  const hCurve  = calcHorizontalCurve({ R, V, delta })
  const vCurve  = calcVerticalCurve({ g1, g2, Lvc, V })
  const pavement = calcPavement({ traffic, CBR })

  useEffect(() => {
    onDataChange?.({ R, V, delta, g1, g2, Lvc, traffic, CBR, hCurve, vCurve, pavement })
  }, [R, V, delta, g1, g2, Lvc, traffic, CBR])

  const paveLayers = [
    { thk: pavement.BCThk,  label: 'Bituminous Concrete (BC)',    fill: '#1a1a1a', text: '#fff', scaledH: Math.max(pavement.BCThk  * 0.5, 20) },
    { thk: pavement.DBMThk, label: 'Dense Bitumen Macadam (DBM)', fill: '#444',    text: '#fff', scaledH: Math.max(pavement.DBMThk * 0.5, 26) },
    { thk: pavement.GBThk,  label: 'Granular Base / WMM',        fill: '#b8926a', text: '#fff', scaledH: Math.max(pavement.GBThk  * 0.3, 30) },
    { thk: pavement.SGBThk, label: 'Sub-Grade Base',              fill: '#d4c4a0', text: C.ink,  scaledH: Math.max(pavement.SGBThk * 0.25, 26) },
  ]

  return (
    <TwoCol
      left={<>
        <Card>
          <SectionTitle>Analysis Type</SectionTitle>
          <div style={{ display: 'flex', gap: 6 }}>
            {[['horizontal','Horizontal'],['vertical','Vertical'],['pavement','Pavement']].map(([v, l]) => (
              <TabBtn key={v} active={tab === v} onClick={() => setTab(v)} color={C.purple}>{l}</TabBtn>
            ))}
          </div>
        </Card>

        {tab === 'horizontal' && (
          <Card>
            <SectionTitle>Horizontal Curve (IRC 73)</SectionTitle>
            <Inp label="Design Speed V (km/h)" value={V} onChange={setV}
              options={[{v:40,l:'40 km/h'},{v:50,l:'50 km/h'},{v:60,l:'60 km/h'},{v:65,l:'65 km/h'},{v:80,l:'80 km/h'},{v:100,l:'100 km/h'},{v:120,l:'120 km/h'}]} />
            <Inp label="Radius of Curve R (m)" value={R} onChange={setR} min={30} step={10} />
            <Inp label="Deflection Angle Δ (degrees)" value={delta} onChange={setDelta} min={1} max={180} />
          </Card>
        )}

        {tab === 'vertical' && (
          <Card>
            <SectionTitle>Vertical Curve (IRC 52)</SectionTitle>
            <Inp label="Design Speed V (km/h)" value={V} onChange={setV}
              options={[{v:40,l:'40 km/h'},{v:50,l:'50 km/h'},{v:60,l:'60 km/h'},{v:65,l:'65 km/h'},{v:80,l:'80 km/h'},{v:100,l:'100 km/h'},{v:120,l:'120 km/h'}]} />
            <Inp label="Incoming Grade G1 (%)" value={g1} onChange={setG1} min={-8} max={8} step={0.5} />
            <Inp label="Outgoing Grade G2 (%)" value={g2} onChange={setG2} min={-8} max={8} step={0.5} />
            <Inp label="Vertical Curve Length Lvc (m)" value={Lvc} onChange={setLvc} min={20} step={10} />
            <div style={{ background: C.bgAlt, borderRadius: 7, padding: '8px 12px', fontFamily: F.mono, fontSize: 11.5, color: C.inkMid }}>
              Detected: <strong style={{ color: vCurve.isSummit ? C.red : C.blue }}>{vCurve.curveType}</strong>
            </div>
          </Card>
        )}

        {tab === 'pavement' && (
          <Card>
            <SectionTitle>Pavement Design (IRC 37:2018)</SectionTitle>
            <Inp label="Traffic Category" value={traffic} onChange={setTraffic} options={[
              {v:'light',  l:'Light — < 5 MSA'},
              {v:'medium', l:'Medium — 5 to 30 MSA'},
              {v:'heavy',  l:'Heavy — 30 to 100 MSA'},
              {v:'vheavy', l:'Very Heavy — > 100 MSA'},
            ]} />
            <Inp label="Subgrade CBR (%)" value={CBR} onChange={setCBR} min={2} max={20} />
            <div style={{ background: C.bgAlt, borderRadius: 7, padding: '10px 12px', marginTop: 4, fontFamily: F.mono, fontSize: 11.5, color: C.inkMid, lineHeight: 1.9 }}>
              <div>Design MSA: <strong>{pavement.MSA}</strong></div>
              <div>IRC 37 Granular: <strong>{pavement.totalGranular} mm</strong></div>
              <div>Total Pavement: <strong style={{ color: C.purple }}>{pavement.total} mm</strong></div>
            </div>
          </Card>
        )}
      </>}

      right={<>
        {tab === 'horizontal' && <>
          <Card>
            <SectionTitle>Horizontal Curve Geometry</SectionTitle>
            <HorizontalCurveSVG R={R} V={V} delta={delta} T={hCurve.T} L={hCurve.L} e={hCurve.e} SD={hCurve.SD} />
          </Card>
          <Card>
            <StatGrid cols={3}>
              <StatBox label="Tangent T" value={hCurve.T} unit="m" color={C.purple} />
              <StatBox label="Curve Length L" value={hCurve.L} unit="m" color={C.blue} />
              <StatBox label="Superelevation e" value={hCurve.e} unit="%" color={C.green} />
            </StatGrid>
          </Card>
          <Card>
            <ResultRow label="Stopping Sight Distance (SSD)" value={hCurve.SD} unit="m" />
            <ResultRow label="Minimum Radius Required" value={hCurve.minR} unit="m" />
            <ResultRow label="Provided Radius" value={R} unit="m" highlight />
            <ResultRow label="Extra Widening on Curve" value={hCurve.widen} unit="m" />
          </Card>
          <Card accentColor={hCurve.passRadius ? C.green : C.red}>
            <PassFail pass={hCurve.passRadius} code="IRC 73 — Horizontal Curve Check" />
            <InfoBox color={hCurve.passRadius ? C.green : C.red} lightColor={hCurve.passRadius ? C.greenLight : C.redLight}>
              {hCurve.passRadius
                ? `✓ R = ${R} m ≥ Rmin = ${hCurve.minR} m — Adequate.`
                : `✗ R = ${R} m < Rmin = ${hCurve.minR} m — Increase radius or reduce speed.`}
            </InfoBox>
          </Card>
        </>}

        {tab === 'vertical' && <>
          <Card>
            <SectionTitle>Vertical Curve Profile</SectionTitle>
            <VerticalCurveSVG g1={g1} g2={g2} Lvc={Lvc} A={vCurve.A} K={vCurve.K} isSummit={vCurve.isSummit} />
          </Card>
          <Card>
            <StatGrid cols={3}>
              <StatBox label="K-value" value={vCurve.K} unit="m/%" color={C.purple} />
              <StatBox label="Alg. Diff. A" value={vCurve.A} unit="%" color={C.blue} />
              <StatBox label="Kmin (IRC 52)" value={vCurve.Kmin} unit="m/%" color={C.inkMid} />
            </StatGrid>
          </Card>
          <Card>
            <ResultRow label="Curve Type" value={vCurve.curveType} highlight />
            <ResultRow label="Provided K-value" value={vCurve.K} unit="m/%" />
            <ResultRow label="Minimum K required" value={vCurve.Kmin} unit="m/%" />
            <ResultRow label="Minimum Lvc required" value={vCurve.Lmin} unit="m" />
            <ResultRow label="Provided Lvc" value={Lvc} unit="m" highlight />
          </Card>
          <Card accentColor={vCurve.pass ? C.green : C.red}>
            <PassFail pass={vCurve.pass} code={`IRC 52 — ${vCurve.curveType} Check`} />
            <InfoBox color={vCurve.pass ? C.green : C.red} lightColor={vCurve.pass ? C.greenLight : C.redLight}>
              {vCurve.pass
                ? `✓ K = ${vCurve.K} ≥ Kmin = ${vCurve.Kmin} — Sight distance adequate.`
                : `✗ K = ${vCurve.K} < Kmin = ${vCurve.Kmin} — Increase Lvc to ≥ ${vCurve.Lmin} m.`}
            </InfoBox>
          </Card>
        </>}

        {tab === 'pavement' && <>
          <Card>
            <SectionTitle>Pavement Layers — IRC 37:2018</SectionTitle>
            <PavementSVG layers={paveLayers} />
          </Card>
          <Card>
            <StatGrid cols={4}>
              <StatBox label="BC" value={pavement.BCThk} unit="mm" color={C.ink} />
              <StatBox label="DBM" value={pavement.DBMThk} unit="mm" color={C.inkMid} />
              <StatBox label="Base" value={pavement.GBThk} unit="mm" color={C.orange} />
              <StatBox label="Total" value={pavement.total} unit="mm" color={C.purple} />
            </StatGrid>
          </Card>
          <Card>
            <ResultRow label="Design MSA" value={pavement.MSA} unit="million" />
            <ResultRow label="IRC 37 Table — Total Granular" value={pavement.totalGranular} unit="mm" />
            <Divider />
            <ResultRow label="Bituminous Concrete (BC)" value={pavement.BCThk} unit="mm" />
            <ResultRow label="Dense Bitumen Macadam (DBM)" value={pavement.DBMThk} unit="mm" />
            <ResultRow label="Granular Base / WMM" value={pavement.GBThk} unit="mm" />
            <ResultRow label="Sub-Grade Base" value={pavement.SGBThk} unit="mm" />
            <Divider />
            <ResultRow label="Total Pavement Thickness" value={pavement.total} unit="mm" highlight />
          </Card>
        </>}
      </>}
    />
  )
}