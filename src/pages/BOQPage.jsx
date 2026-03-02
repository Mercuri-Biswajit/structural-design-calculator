import { useState, useEffect } from 'react'
import { C, F } from '@styles/tokens'
import { Card, TwoCol, StatGrid, StatBox, Inp, SectionTitle, ResultRow, Divider } from '@components/ui'
import { computeBOQ } from '@engines/boqEngine'
import { SavePanel, SaveToast } from '@components/SavePanel'
import { useSaveToProject } from '@hooks/useSaveToProject'

export default function BOQPage({ onDataChange }) {
  const [grade,   setGrade]   = useState('M25')
  const [length,  setLength]  = useState(10)
  const [width,   setWidth]   = useState(5)
  const [height,  setHeight]  = useState(3)
  const [steelKg, setSteelKg] = useState(150)
  const [formwork,setFormwork]= useState(true)
  const [state,   setState]   = useState('Maharashtra')

  const result = computeBOQ({ grade, length, width, height, steelKg, formwork, state })

  useEffect(()=>{ onDataChange?.({ grade, length, width, height, steelKg, formwork, state, result }) },
    [grade, length, width, height, steelKg, formwork, state])

  const moduleData = { grade, length, width, height, steelKg, formwork, state, result }
  const { projectName, setProjectName, existingNames, save, isSaving, toastMsg } = useSaveToProject('boq', moduleData)

  const rows = result?.items || []
  const total = result?.total || 0

  return (
    <>
      <TwoCol
        left={<>
          <Card>
            <SectionTitle>Structural Element</SectionTitle>
            <Inp label="Concrete Grade" value={grade} onChange={setGrade}
              options={[{v:'M20',l:'M20'},{v:'M25',l:'M25'},{v:'M30',l:'M30'},{v:'M35',l:'M35'},{v:'M40',l:'M40'}]}/>
            <Inp label="Length (m)" value={length} onChange={setLength} min={0.1} step={0.5}/>
            <Inp label="Width  (m)" value={width}  onChange={setWidth}  min={0.1} step={0.1}/>
            <Inp label="Height / Depth (m)" value={height} onChange={setHeight} min={0.1} step={0.1}/>
          </Card>
          <Card>
            <SectionTitle>Reinforcement & Formwork</SectionTitle>
            <Inp label="Steel reinforcement (kg/m³)" value={steelKg} onChange={setSteelKg} min={0}
              options={[{v:80,l:'80 kg/m³ — slab'},{v:120,l:'120 kg/m³ — beam'},{v:150,l:'150 kg/m³ — column'},{v:200,l:'200 kg/m³ — raft'}]}/>
            <div style={{display:'flex',alignItems:'center',gap:10,marginTop:10,padding:'10px 12px',background:C.bgAlt,borderRadius:8}}>
              <span style={{fontSize:13,fontFamily:F.sans,color:C.inkMid,flex:1}}>Include Formwork</span>
              <button onClick={()=>setFormwork(f=>!f)} style={{
                width:42,height:24,borderRadius:12,border:'none',cursor:'pointer',
                background: formwork ? C.green : C.border,
                position:'relative',transition:'background 0.2s',
              }}>
                <span style={{
                  position:'absolute',top:3,left: formwork?20:3,
                  width:18,height:18,borderRadius:'50%',background:'#fff',
                  transition:'left 0.2s',boxShadow:'0 1px 4px rgba(0,0,0,0.2)',
                }}/>
              </button>
            </div>
          </Card>
          <Card>
            <SectionTitle>Location (for rates)</SectionTitle>
            <Inp label="State" value={state} onChange={setState}
              options={['Maharashtra','Delhi','Karnataka','Tamil Nadu','Gujarat','Rajasthan','West Bengal','Uttar Pradesh','Telangana'].map(s=>({v:s,l:s}))}/>
          </Card>
        </>}

        right={<>
          <SavePanel moduleLabel="Estimation & BOQ" moduleIcon="₹" accentColor={C.orange}
            projectName={projectName} setProjectName={setProjectName} existingNames={existingNames}
            onSave={save} isSaving={isSaving} hasData={true}/>

          <Card>
            <StatGrid cols={3}>
              <StatBox label="Volume"     value={(length*width*height).toFixed(2)} unit="m³" color={C.blue}/>
              <StatBox label="Steel mass" value={((length*width*height)*steelKg).toFixed(0)} unit="kg" color={C.orange}/>
              <StatBox label="Total cost"  value={`₹${(total/1000).toFixed(1)}k`}   color={C.green}/>
            </StatGrid>
          </Card>

          {/* BOQ Table */}
          <Card>
            <SectionTitle>Bill of Quantities</SectionTitle>
            <div style={{border:`1px solid ${C.border}`,borderRadius:8,overflow:'hidden'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 60px 80px 70px 90px',background:C.bgAlt,borderBottom:`1px solid ${C.border}`,padding:'8px 12px',gap:6}}>
                {['Description','Unit','Qty','Rate (₹)','Amount (₹)'].map(h=>(
                  <div key={h} style={{fontSize:9.5,fontFamily:F.sans,fontWeight:700,color:C.inkLight,textTransform:'uppercase',letterSpacing:'0.7px'}}>{h}</div>
                ))}
              </div>
              {rows.map((row,i)=>(
                <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 60px 80px 70px 90px',padding:'9px 12px',gap:6,borderBottom:`1px solid ${C.border}`,background:i%2===0?'#fff':C.bgInput}}>
                  <div style={{fontSize:12.5,fontFamily:F.sans,color:C.ink}}>{row.description}</div>
                  <div style={{fontSize:11.5,fontFamily:F.mono,color:C.inkLight}}>{row.unit}</div>
                  <div style={{fontSize:12,fontFamily:F.mono,color:C.inkMid}}>{row.qty}</div>
                  <div style={{fontSize:12,fontFamily:F.mono,color:C.inkMid}}>{row.rate.toLocaleString('en-IN')}</div>
                  <div style={{fontSize:12.5,fontFamily:F.mono,fontWeight:600,color:C.ink,textAlign:'right'}}>{row.amount.toLocaleString('en-IN')}</div>
                </div>
              ))}
              <div style={{display:'grid',gridTemplateColumns:'1fr 60px 80px 70px 90px',padding:'11px 12px',gap:6,background:C.navyLight,borderTop:`2px solid ${C.navy}20`}}>
                <div style={{fontSize:13,fontFamily:F.sans,fontWeight:700,color:C.navy,gridColumn:'1/5'}}>Grand Total</div>
                <div style={{fontSize:14,fontFamily:F.mono,fontWeight:800,color:C.navy,textAlign:'right'}}>₹{total.toLocaleString('en-IN')}</div>
              </div>
            </div>
          </Card>

          {/* Cost breakdown */}
          <Card accentColor={C.orange}>
            <SectionTitle>Cost Breakdown</SectionTitle>
            {result?.breakdown?.map((item,i)=>(
              <div key={i}>
                <ResultRow label={item.label} value={`₹${item.amount.toLocaleString('en-IN')}`}/>
                <div style={{height:6,background:C.bgAlt,borderRadius:4,marginBottom:8}}>
                  <div style={{height:6,borderRadius:4,background:`linear-gradient(90deg,${C.orange},${C.orangeLight})`,width:`${item.pct}%`,transition:'width 0.5s'}}/>
                </div>
              </div>
            ))}
          </Card>
        </>}
      />
      <SaveToast msg={toastMsg}/>
    </>
  )
}