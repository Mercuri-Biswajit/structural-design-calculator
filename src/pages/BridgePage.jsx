import { useState, useEffect } from 'react'
import { C, F } from '@styles/tokens'
import { Card, TwoCol, StatGrid, StatBox, UtilBar, PassFail, Inp, SectionTitle, InfoBox, ResultRow, Divider } from '@components/ui'
import { analyzeBridge } from '@engines/roadEngine'
import { SavePanel, SaveToast } from '@components/SavePanel'
import { useSaveToProject } from '@hooks/useSaveToProject'

function BridgeElevation({ span, vcClass }) {
  const lx=20, rx=260, bW=rx-lx, bY=90
  const piers = span > 30 ? [lx+bW/3, lx+2*bW/3] : []
  return (
    <svg width={280} height={160} style={{display:'block',margin:'0 auto'}}>
      {/* Water */}
      <rect x={lx} y={bY+30} width={bW} height={35} fill="#e0f2fe" opacity={0.7}/>
      {[0,1,2,3,4].map(i=>(
        <path key={i} d={`M ${lx+10+i*50} ${bY+40} Q ${lx+25+i*50} ${bY+35} ${lx+40+i*50} ${bY+40}`}
          stroke="#7dd3fc" strokeWidth={1.5} fill="none"/>
      ))}
      {/* Deck */}
      <rect x={lx} y={bY-10} width={bW} height={14} fill={C.blueLight} stroke={C.blue} strokeWidth={2} rx={2}/>
      {/* Abutments */}
      <rect x={lx-12} y={bY-12} width={14} height={44} fill="#c7d5e8" stroke={C.blue} strokeWidth={1.5}/>
      <rect x={rx-2}  y={bY-12} width={14} height={44} fill="#c7d5e8" stroke={C.blue} strokeWidth={1.5}/>
      {/* Piers */}
      {piers.map(px=>(
        <rect key={px} x={px-6} y={bY+4} width={12} height={50} fill="#c7d5e8" stroke={C.blue} strokeWidth={1.5} rx={3}/>
      ))}
      {/* Class vehicle indicator */}
      <rect x={lx+bW/2-22} y={bY-24} width={44} height={12} fill={C.orange} rx={3} opacity={0.9}/>
      <text x={lx+bW/2} y={bY-15} textAnchor="middle" fill="#fff" fontSize={9} fontFamily={F.mono} fontWeight="700">
        IRC Class {vcClass}
      </text>
      {/* Span label */}
      <line x1={lx} y1={bY+52} x2={rx} y2={bY+52} stroke={C.inkFaint} strokeWidth={1}/>
      <text x={(lx+rx)/2} y={bY+64} textAnchor="middle" fill={C.inkMid} fontSize={10} fontFamily={F.mono}>
        Span = {span} m
      </text>
    </svg>
  )
}

export default function BridgePage({ onDataChange }) {
  const [span, setSpan]   = useState(20)
  const [vc,   setVc]     = useState('AA')
  const [lanes,setLanes]  = useState(2)
  const [wDL,  setWDL]    = useState(12)
  const [fck,  setFck]    = useState(30)
  const [fy,   setFy]     = useState(500)
  const [b,    setB]      = useState(800)
  const [d,    setD]      = useState(1200)

  const result = analyzeBridge({ span, vc, lanes, wDL, fck, fy, b, d })

  useEffect(()=>{ onDataChange?.({ span, vc, lanes, wDL, fck, fy, b, d, result }) },
    [span, vc, lanes, wDL, fck, fy, b, d])

  const moduleData = { span, vc, lanes, wDL, fck, fy, b, d, result }
  const { projectName, setProjectName, existingNames, save, isSaving, toastMsg } = useSaveToProject('bridge', moduleData)

  return (
    <>
      <TwoCol
        left={<>
          <Card>
            <SectionTitle>Bridge Geometry</SectionTitle>
            <Inp label="Effective Span (m)"  value={span}  onChange={setSpan}  min={2}/>
            <Inp label="Number of Lanes"      value={lanes} onChange={setLanes} options={[{v:1,l:'1 Lane'},{v:2,l:'2 Lanes'},{v:3,l:'3 Lanes'},{v:4,l:'4 Lanes'}]}/>
          </Card>
          <Card>
            <SectionTitle>IRC Vehicle Classification (IRC 6)</SectionTitle>
            <Inp label="Vehicle Class" value={vc} onChange={setVc}
              options={[
                {v:'AA',l:'Class AA — 70T tracked / 40T wheeled'},
                {v:'A',l:'Class A — 55T train'},
                {v:'B',l:'Class B — 45T train'},
                {v:'70R',l:'Class 70R — 70T tracked'},
              ]}/>
            <Inp label="Dead Load wDL (kN/m)" value={wDL} onChange={setWDL} min={5} step={0.5}/>
          </Card>
          <Card>
            <SectionTitle>Girder Section</SectionTitle>
            <Inp label="Width b (mm)"  value={b} onChange={setB} min={200} step={50}/>
            <Inp label="Depth d (mm)"  value={d} onChange={setD} min={400} step={50}/>
          </Card>
          <Card>
            <SectionTitle>Material Grade</SectionTitle>
            <Inp label="Concrete fck (MPa)" value={fck} onChange={setFck}
              options={[{v:25,l:'M25'},{v:30,l:'M30'},{v:35,l:'M35'},{v:40,l:'M40'}]}/>
            <Inp label="Steel fy (MPa)" value={fy} onChange={setFy}
              options={[{v:415,l:'Fe415'},{v:500,l:'Fe500'},{v:550,l:'Fe550'}]}/>
          </Card>
        </>}

        right={<>
          <SavePanel moduleLabel="Bridge Loads" moduleIcon="⌒" accentColor="#9333ea"
            projectName={projectName} setProjectName={setProjectName} existingNames={existingNames}
            onSave={save} isSaving={isSaving} hasData={true}/>

          <Card>
            <SectionTitle>Bridge Elevation</SectionTitle>
            <BridgeElevation span={span} vcClass={vc}/>
          </Card>
          <Card>
            <StatGrid cols={3}>
              <StatBox label="Impact Factor"  value={`${result.impactPct}%`} color={C.orange}/>
              <StatBox label="Total Mdl"       value={result.Mdl}           unit="kNm" color={C.blue}/>
              <StatBox label="Total Mtotal"    value={result.Mtotal}        unit="kNm" color={C.purple}/>
            </StatGrid>
          </Card>
          <Card accentColor={C.purple}>
            <SectionTitle>Load Effects (IRC 6)</SectionTitle>
            <ResultRow label="Dead Load Moment Mdl"   value={result.Mdl}      unit="kNm"/>
            <ResultRow label="Live Load Moment Mll"   value={result.Mll}      unit="kNm"/>
            <ResultRow label="Impact Factor If"        value={`${result.impactPct}%`}/>
            <ResultRow label="Impact Moment Mimp"     value={result.Mimp}     unit="kNm"/>
            <Divider/>
            <ResultRow label="Design Moment Mtotal"   value={result.Mtotal}   unit="kNm" highlight/>
            <ResultRow label="Design Shear Vtotal"    value={result.Vtotal}   unit="kN"  highlight/>
          </Card>
          <Card accentColor={result.passM?C.green:C.red}>
            <PassFail pass={result.passM} code="IS 456:2000 — Girder Flexure Design"/>
            <ResultRow label="Applied Mu"   value={result.Mtotal} unit="kNm"/>
            <ResultRow label="Capacity Mu,lim" value={result.Mulim} unit="kNm" highlight/>
            <div style={{height:8}}/>
            <UtilBar pct={result.utilM} label="Moment Utilization"/>
            <Divider/>
            <ResultRow label="Ast required" value={result.Ast_req} unit="mm²"/>
            <ResultRow label={`${result.nBars}⌀${result.barDia} bars`} value={result.Ast_prov} unit="mm²" highlight/>
          </Card>
          <Card accentColor={result.passV?C.green:C.red}>
            <PassFail pass={result.passV} code="IS 456:2000 — Girder Shear Design"/>
            <ResultRow label="Design shear Vd" value={result.Vtotal} unit="kN"/>
            <ResultRow label="τv"               value={result.tau_v} unit="N/mm²"/>
            <ResultRow label="τc"               value={result.tau_c} unit="N/mm²" highlight/>
            <div style={{height:8}}/>
            <UtilBar pct={result.utilV} label="Shear Utilization" color={C.orange}/>
            <Divider/>
            {result.needLinks
              ? <InfoBox color={C.orange} lightColor={C.orangeLight}>
                  Shear links required: ⌀{result.stirrupDia} @ <strong>{result.stirrupSpc} mm</strong>
                </InfoBox>
              : <InfoBox color={C.green} lightColor={C.greenLight}>
                  Nominal links only: ⌀{result.stirrupDia} @ <strong>{result.stirrupSpc} mm</strong>
                </InfoBox>
            }
          </Card>
        </>}
      />
      <SaveToast msg={toastMsg}/>
    </>
  )
}