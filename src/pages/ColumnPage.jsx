import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { C, F } from "@styles/tokens";
import {
  Card,
  TwoCol,
  StatGrid,
  StatBox,
  TabBtn,
  Inp,
  SectionTitle,
  InfoBox,
  ResultRow,
  Divider,
  PassFail,
  UtilBar,
} from "@components/ui";
import { analyzeColumn } from "@engines/structuralEngine";
import { SavePanel, SaveToast } from "@components/SavePanel";
import { useSaveToProject } from "../hooks/useSaveToProject";

function ColumnSketch({ b, d, material, P, Mx, My, Le }) {
  const fill = material === 'concrete' ? 'url(#concrete)' : 'url(#steel)'
  const stroke = material === 'concrete' ? C.borderMid : C.inkMid
  
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 40 }}>
      {/* Elevation View */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: C.inkLight, fontFamily: F.mono, marginBottom: 8, letterSpacing: '1px', fontWeight: 800 }}>ELEVATION</p>
        <svg width={160} height={260} style={{ overflow: 'visible' }}>
          {/* Main Column Body */}
          <motion.rect 
            layout
            initial={{ height: 0 }}
            animate={{ height: 200 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            x={55} y={30} width={50} height={200} 
            fill={fill} stroke={stroke} strokeWidth={2.5} rx={material === 'concrete' ? 2 : 0} 
            filter="url(#shadow)"
          />
          
          {/* Rebar visualization for concrete */}
          <AnimatePresence>
            {material === 'concrete' && (
              <motion.g 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                transition={{ delay: 0.8 }}
              >
                {/* Vertical bars (simplified elevation) */}
                <motion.line 
                    x1={62} y1={30} x2={62} y2={230} stroke={C.inkMid} strokeWidth={2} opacity={0.6} strokeDasharray="3,3" 
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1, duration: 1 }}
                />
                <motion.line 
                    x1={98} y1={30} x2={98} y2={230} stroke={C.inkMid} strokeWidth={2} opacity={0.6} strokeDasharray="3,3" 
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.1, duration: 1 }}
                />
                {/* Ties/Stirrups */}
                {[50, 80, 110, 140, 170, 200].map((ty, i) => (
                  <motion.line 
                    key={ty} x1={55} y1={ty} x2={105} y2={ty} stroke={C.inkLight} strokeWidth={1.5} opacity={0.4} 
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.5 + i * 0.1, duration: 0.5 }}
                  />
                ))}
              </motion.g>
            )}
          </AnimatePresence>

          {/* Steel section details */}
          <AnimatePresence>
            {material === 'steel' && (
              <motion.g 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                transition={{ delay: 1 }}
              >
                <rect x={55} y={30} width={50} height={16} fill={stroke} opacity={0.8} />
                <rect x={55} y={214} width={50} height={16} fill={stroke} opacity={0.8} />
                <rect x={76} y={46} width={10} height={168} fill={stroke} opacity={0.4} />
              </motion.g>
            )}
          </AnimatePresence>

          {/* Load Vector */}
          <motion.g 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: [0, -4, 0] }} 
            transition={{ opacity: { delay: 0.5, duration: 0.5 }, y: { repeat: Infinity, duration: 2, delay: 1 } }}
          >
            <line x1={80} y1={0} x2={80} y2={28} stroke={C.red} strokeWidth={4} strokeLinecap="round" />
            <polygon points="80,30 72,16 88,16" fill={C.red} />
            <text x={92} y={12} fill={C.red} fontSize={12} fontWeight={800} fontFamily={F.mono}>{P} kN</text>
          </motion.g>
          
          {/* Moment Arrow (Elevation) */}
          <motion.g 
            initial={{ opacity: 0 }}
            animate={{ opacity: Mx > 0 ? 1 : 0 }}
            transition={{ delay: 1.5 }}
          >
            <motion.path 
                d="M 115 130 Q 140 115 125 100" stroke={C.orange} strokeWidth={3} fill="none" strokeLinecap="round" 
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.5, duration: 0.8 }}
            />
            <motion.polygon 
                points="125,98 116,108 128,110" fill={C.orange} 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}
            />
            <motion.text 
                x={120} y={150} fill={C.orange} fontSize={11} fontWeight={800} fontFamily={F.mono}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}
            >
                Mx={Mx}
            </motion.text>
          </motion.g>
          
          {/* Dimension Label */}
          <motion.line 
            x1={20} y1={30} x2={20} y2={230} stroke={C.inkFaint} strokeWidth={1.5} strokeDasharray="4,4" 
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 1 }}
          />
          <motion.text 
            x={14} y={130} fill={C.inkMid} fontSize={11} fontWeight={700} fontFamily={F.mono} transform="rotate(-90,14,130)"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          >
            Le = {Le} m
          </motion.text>
          
          <motion.text 
            x={80} y={252} textAnchor="middle" fill={C.inkMid} fontSize={12} fontWeight={800} fontFamily={F.mono}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          >
            {b}×{d} mm
          </motion.text>
        </svg>
      </div>

      {/* Plan View */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 10, color: C.inkLight, fontFamily: F.mono, marginBottom: 8, letterSpacing: '1px', fontWeight: 700 }}>PLAN VIEW</p>
        <svg width={120} height={130} style={{ overflow: 'visible' }}>
          <motion.rect 
            layout
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            x={10} y={10} width={100} height={100} 
            fill={fill} stroke={stroke} strokeWidth={2.5} rx={material === 'concrete' ? 4 : 0} 
            filter="url(#shadow)"
          />

          {/* Concrete Reinforcing Bars (Plan) */}
          <AnimatePresence>
            {material === 'concrete' && (
              <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ delay: 0.5 }}>
                {[[22,22],[98,22],[22,98],[98,98], [60,22], [60,98], [22,60], [98,60]].map(([cx,cy],i) =>
                  <motion.circle 
                    key={i} 
                    layout
                    cx={cx} cy={cy} r={4.5} 
                    fill={C.ink} 
                    filter="url(#glow)"
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8 + i * 0.05 }}
                  />
                )}
                {/* Internal tie */}
                <motion.rect 
                    x={22} y={22} width={76} height={76} fill="none" stroke={C.inkMid} strokeWidth={1} opacity={0.4} 
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.2, duration: 1 }}
                />
              </motion.g>
            )}
          </AnimatePresence>

          {/* Center Lines */}
          <motion.line 
            x1={0} y1={60} x2={120} y2={60} stroke={C.inkFaint} strokeWidth={1} strokeDasharray="5,5" 
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1, duration: 0.5 }}
          />
          <motion.line 
            x1={60} y1={0} x2={60} y2={120} stroke={C.inkFaint} strokeWidth={1} strokeDasharray="5,5" 
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.2, duration: 0.5 }}
          />
          
          {/* Moments (Plan) */}
          <motion.g 
            initial={{ opacity: 0 }}
            animate={{ opacity: Mx > 0 ? 1 : 0 }}
            transition={{ delay: 1.5 }}
          >
            <motion.path 
                d="M 115 60 Q 125 50 115 40" stroke={C.orange} strokeWidth={2.5} fill="none" 
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.5, duration: 0.6 }}
            />
            <motion.polygon 
                points="115,38 108,46 120,47" fill={C.orange} 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.1 }}
            />
            <motion.text 
                x={122} y={54} fill={C.orange} fontSize={9} fontWeight={800} fontFamily={F.mono}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.1 }}
            >
                Mx
            </motion.text>
          </motion.g>
          
          <motion.g 
            initial={{ opacity: 0 }}
            animate={{ opacity: My > 0 ? 1 : 0 }}
            transition={{ delay: 1.5 }}
          >
            <motion.path 
                d="M 60 5 Q 72 1 76 9" stroke={C.purple} strokeWidth={2.5} fill="none" 
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.7, duration: 0.6 }}
            />
            <motion.polygon 
                points="76,10 66,7 70,15" fill={C.purple} 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.3 }}
            />
            <motion.text 
                x={78} y={6} fill={C.purple} fontSize={9} fontWeight={800} fontFamily={F.mono}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.3 }}
            >
                My
            </motion.text>
          </motion.g>
          
          <motion.text 
            x={60} y={124} textAnchor="middle" fill={C.inkMid} fontSize={10} fontWeight={700} fontFamily={F.mono}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          >
            {b} mm
          </motion.text>
        </svg>
      </div>
    </div>
  )
}


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

  const moduleData = { P, Mx, My, b, d, Le, material, fck, fy, steelPct, result }
  const { projectName, setProjectName, existingNames, save, isSaving, toastMsg } = useSaveToProject('column', moduleData)

  return (
    <>
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
              <Inp label="Concrete fck (MPa)" value={fck} onChange={setFck} options={[{v:20,l:'M20'},{v:25,l:'M25'},{v:30,l:'M30'},{v:35,l:'M35'},{v:40,l:'M40'}]} />
              <Inp label="Steel fy (MPa)" value={fy} onChange={setFy} options={[{v:250,l:'Fe250'},{v:415,l:'Fe415'},{v:500,l:'Fe500'},{v:550,l:'Fe550'}]} />
              <Inp label="Steel Ratio (%)" value={steelPct} onChange={setSteelPct}
                options={[{v:0.8,l:'0.8%'},{v:1,l:'1.0%'},{v:1.5,l:'1.5%'},{v:2,l:'2.0%'},{v:2.5,l:'2.5%'},{v:3,l:'3.0%'},{v:4,l:'4.0%'},{v:5,l:'5.0%'},{v:6,l:'6.0%'}]} />
            </Card>
          )}
        </>}

        right={<>
          <SavePanel moduleLabel="Column Design" moduleIcon="║" accentColor={C.navyBright}
            projectName={projectName} setProjectName={setProjectName} existingNames={existingNames}
            onSave={save} isSaving={isSaving} hasData={true} />

          <Card>
            <SectionTitle>Column Schematic</SectionTitle>
            <ColumnSketch b={b} d={d} material={material} P={P} Mx={Mx} My={My} Le={Le} />
          </Card>
          <Card>
            <StatGrid cols={3}>
              <StatBox label="Axial Capacity" value={result.Pu_cap} unit="kN" color={C.blue} />
              <StatBox label="λ (x-axis)" value={result.lx} color={result.isSlender ? C.red : C.green} />
              <StatBox label="Column Type" value={result.isSlender ? 'SLENDER' : 'SHORT'} color={result.isSlender ? C.orange : C.green} />
            </StatGrid>
          </Card>
          <Card accentColor={result.pass ? C.green : C.red}>
            <PassFail pass={P <= parseFloat(result.Pu_cap)} code={`${result.code} Cl. 39.3 — Axial Capacity`} />
            <StatGrid cols={2}>
              <StatBox label="Applied P" value={P} unit="kN" color={C.ink} />
              <StatBox label="Capacity Pu" value={result.Pu_cap} unit="kN" color={C.green} />
            </StatGrid>
            <div style={{ height: 10 }} />
            <UtilBar pct={((P / parseFloat(result.Pu_cap)) * 100).toFixed(1)} label="Axial Load Utilization" />
          </Card>
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
          <Card accentColor={result.pass ? C.green : C.red}>
            <PassFail pass={result.pass} code={`${result.code} — Overall Design Check`} />
            {material === 'concrete' && (
              <InfoBox color={C.blue} lightColor={C.blueLight}>
                Steel provided: {result.steelPct}% of Ag = <strong>{result.Asc} mm²</strong><br />
                Limits: 0.8%–6.0% of Ag = {(b * d * 0.008).toFixed(0)}–{(b * d * 0.06).toFixed(0)} mm²
              </InfoBox>
            )}
          </Card>
        </>}
      />
      <SaveToast msg={toastMsg} />
    </>
  )
}