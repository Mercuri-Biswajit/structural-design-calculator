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
import { analyzeSlab } from "@engines/structuralEngine";
import { SavePanel, SaveToast } from "@components/SavePanel";
import { useSaveToProject } from "../hooks/useSaveToProject";

function SlabPlan({ Lx, Ly, isTwoWay, r }) {
  const sc = Math.min(260 / Math.max(Lx, 1), 180 / Math.max(Ly, 1)); // Increased Scale Area
  const sw = Math.max(Lx * sc, 10),
    sh = Math.max(Ly * sc, 10);
  const ox = (320 - sw) / 2, // Larger container width
    oy = (220 - sh) / 2;     // Larger container height
  return (
    <motion.svg
      width={320}
      height={220}
      style={{ display: "block", margin: "0 auto", overflow: 'visible' }}
    >
      <motion.rect
        layout
        initial={{ pathLength: 0, fillOpacity: 0 }}
        animate={{ pathLength: 1, fillOpacity: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        x={ox}
        y={oy}
        width={sw}
        height={sh}
        fill="url(#concrete)"
        stroke={C.green}
        strokeWidth={3.5} // Thicker border
        rx={6}
        filter="url(#shadow)"
      />
      
      {/* Horizontal reinforcement lines */}
      <AnimatePresence>
        {Array.from({ length: 7 }, (_, i) => (
          <motion.line
            key={`h${i}`}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 1 + i * 0.1, duration: 0.6 }}
            x1={ox + 6}
            y1={oy + ((i + 1) * sh) / 8}
            x2={ox + sw - 6}
            y2={oy + ((i + 1) * sh) / 8}
            stroke={C.green}
            strokeWidth={2} // Thicker rebar
            opacity={0.4}
            strokeDasharray="5,5"
          />
        ))}
      </AnimatePresence>

      {/* Vertical reinforcement lines for two-way */}
      <AnimatePresence>
        {isTwoWay &&
          Array.from({ length: 7 }, (_, i) => (
            <motion.line
              key={`v${i}`}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 1.5 + i * 0.1, duration: 0.6 }}
              x1={ox + ((i + 1) * sw) / 8}
              y1={oy + 6}
              x2={ox + ((i + 1) * sw) / 8}
              y2={oy + sh - 6}
              stroke={C.green}
              strokeWidth={2} // Thicker rebar
              opacity={0.4}
              strokeDasharray="5,5"
            />
          ))}
      </AnimatePresence>

      <motion.g 
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <text
          x={ox + sw / 2} y={oy - 14}
          textAnchor="middle" fill={C.inkMid} fontSize={13} fontWeight={800} fontFamily={F.mono}
        >
          Lx = {Lx} m
        </text>
        <text
          x={ox - 22} y={oy + sh / 2}
          textAnchor="middle" fill={C.inkMid} fontSize={13} fontWeight={800} fontFamily={F.mono}
          transform={`rotate(-90, ${ox - 22}, ${oy + sh / 2})`}
        >
          Ly = {Ly} m
        </text>
      </motion.g>

      <motion.g 
        initial={{ y: 5, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ delay: 2.2 }}
        key={isTwoWay ? 'two' : 'one'}
      >
        <text
          x={ox + sw / 2} y={oy + sh / 2 + 6}
          textAnchor="middle" fill={C.green} fontSize={16} fontFamily={F.mono} fontWeight="900" // Larger type Text
          filter="url(#glow)"
        >
          {isTwoWay ? "TWO-WAY" : "ONE-WAY"}
        </text>
        <text
          x={ox + sw / 2} y={oy + sh / 2 + 25}
          textAnchor="middle" fill={C.inkMid} fontSize={12} fontWeight={700} fontFamily={F.mono}
        >
          Ratio = {r}
        </text>
      </motion.g>
    </motion.svg>
  );
}

function SlabSection({ thickness, wDL, wLL, dEff }) {
  return (
    <motion.svg
      width={320} // Matched with Plan width
      height={130}
      style={{ display: "block", margin: "0 auto", overflow: 'visible' }}
    >
      {/* Load Arrows */}
      {[60, 110, 160, 210, 260].map((ax, i) => (
        <motion.g 
          key={ax}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.5 + i * 0.1 }}
        >
          <motion.line 
            x1={ax} y1={5} x2={ax} y2={26} stroke={C.red} strokeWidth={3} strokeLinecap="round" 
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.5 + i*0.1, duration: 0.4 }}
          />
          <motion.polygon 
            points={`${ax},26 ${ax - 5.5},14 ${ax + 5.5},14`} fill={C.red} 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.9 + i*0.1 }}
          />
        </motion.g>
      ))}
      <motion.text 
        x={160} y={4} textAnchor="middle" fill={C.red} fontSize={12} fontWeight={800} fontFamily={F.mono}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}
      >
        w = {wDL + wLL} kN/m²
      </motion.text>

      {/* Slab Cross Section */}
      <motion.rect
        layout
        initial={{ pathLength: 0, fillOpacity: 0 }}
        animate={{ pathLength: 1, fillOpacity: 1 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        x={40} y={30} width={240} height={54}
        fill="url(#concrete)" stroke={C.blue} strokeWidth={3}
        rx={3}
        filter="url(#shadow)"
      />

      {/* Main Reinforcement (Dots) */}
      <AnimatePresence>
        {[60, 100, 140, 180, 220, 260].map((rx, i) => (
          <motion.circle 
            key={rx} 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            transition={{ delay: 1.0 + i * 0.05 }}
            cx={rx} cy={72} r={5} 
            fill={C.orange} 
            filter="url(#glow)"
          />
        ))}
      </AnimatePresence>

      <motion.g 
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <text x={160} y={105} textAnchor="middle" fill={C.inkMid} fontSize={12} fontWeight={800} fontFamily={F.mono}>
          Thickness = {thickness} mm
        </text>
        <text x={160} y={122} textAnchor="middle" fill={C.inkLight} fontSize={11} fontWeight={600} fontFamily={F.mono}>
          d_eff = {dEff} mm
        </text>
      </motion.g>
    </motion.svg>
  );
}

export default function SlabPage({ onDataChange }) {
  const [Lx, setLx] = useState(4);
  const [Ly, setLy] = useState(6);
  const [wDL, setWDL] = useState(5);
  const [wLL, setWLL] = useState(3);
  const [thickness, setThickness] = useState(150);
  const [fck, setFck] = useState(25);
  const [fy, setFy] = useState(415);

  const result = analyzeSlab({ Lx, Ly, wDL, wLL, thickness, fck, fy });

  useEffect(() => {
    onDataChange?.({ Lx, Ly, wDL, wLL, thickness, fck, fy, result });
  }, [Lx, Ly, wDL, wLL, thickness, fck, fy]);

  const moduleData = { Lx, Ly, wDL, wLL, thickness, fck, fy, result };
  const {
    projectName,
    setProjectName,
    existingNames,
    save,
    isSaving,
    toastMsg,
  } = useSaveToProject("slab", moduleData);

  return (
    <>
      <TwoCol
        left={
          <>
            <Card>
              <SectionTitle>Slab Geometry</SectionTitle>
              <Inp
                label="Short Span Lx (m)"
                value={Lx}
                onChange={setLx}
                min={0.5}
                step={0.5}
              />
              <Inp
                label="Long Span Ly (m)"
                value={Ly}
                onChange={setLy}
                min={0.5}
                step={0.5}
              />
              <Inp
                label="Overall Thickness (mm)"
                value={thickness}
                onChange={setThickness}
                min={80}
                step={10}
              />
            </Card>
            <Card>
              <SectionTitle>Loading</SectionTitle>
              <Inp
                label="Dead Load wDL (kN/m²)"
                value={wDL}
                onChange={setWDL}
                min={0}
                step={0.5}
              />
              <Inp
                label="Live Load wLL (kN/m²)"
                value={wLL}
                onChange={setWLL}
                min={0}
                step={0.5}
              />
              <div
                style={{
                  background: C.bgAlt,
                  borderRadius: 7,
                  padding: "10px 12px",
                  marginTop: 4,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{ fontSize: 12, color: C.inkMid, fontFamily: F.mono }}
                >
                  Total w
                </span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: C.green,
                    fontFamily: F.mono,
                  }}
                >
                  {wDL + wLL} kN/m²
                </span>
              </div>
            </Card>
            <Card>
              <SectionTitle>Material Grade</SectionTitle>
              <Inp
                label="Concrete fck (MPa)"
                value={fck}
                onChange={setFck}
                options={[
                  { v: 20, l: "M20" },
                  { v: 25, l: "M25" },
                  { v: 30, l: "M30" },
                  { v: 35, l: "M35" },
                  { v: 40, l: "M40" },
                ]}
              />
              <Inp
                label="Steel fy (MPa)"
                value={fy}
                onChange={setFy}
                options={[
                  { v: 250, l: "Fe250" },
                  { v: 415, l: "Fe415" },
                  { v: 500, l: "Fe500" },
                  { v: 550, l: "Fe550" },
                ]}
              />
              <div
                style={{
                  marginTop: 8,
                  background: C.bgAlt,
                  borderRadius: 7,
                  padding: "8px 12px",
                  fontFamily: F.mono,
                  fontSize: 11.5,
                  color: C.inkMid,
                  lineHeight: 1.8,
                }}
              >
                <div>d_eff = {result.d_eff} mm</div>
                <div>Cover = 20 mm (IS 456 Cl. 26.4)</div>
              </div>
            </Card>
          </>
        }
        right={
          <>
            <SavePanel
              moduleLabel="Slab Design"
              moduleIcon="▭"
              accentColor={C.green}
              projectName={projectName}
              setProjectName={setProjectName}
              existingNames={existingNames}
              onSave={save}
              isSaving={isSaving}
              hasData={true}
            />

            <Card>
              <SectionTitle>Slab Plan</SectionTitle>
              <SlabPlan
                Lx={Lx}
                Ly={Ly}
                isTwoWay={result.isTwoWay}
                r={result.r}
              />
            </Card>
            <Card>
              <SectionTitle>Cross Section</SectionTitle>
              <SlabSection
                thickness={thickness}
                wDL={wDL}
                wLL={wLL}
                dEff={result.d_eff}
              />
            </Card>
            <Card>
              <SectionTitle>Design Moments (IS 456 Table 26)</SectionTitle>
              <StatGrid cols={result.isTwoWay ? 4 : 2}>
                <StatBox
                  label="Mx"
                  value={result.Mx}
                  unit="kNm/m"
                  color={C.green}
                />
                {result.isTwoWay && (
                  <StatBox
                    label="My"
                    value={result.My}
                    unit="kNm/m"
                    color={C.orange}
                  />
                )}
                <StatBox
                  label="Mulim"
                  value={result.Mulim}
                  unit="kNm/m"
                  color={C.blue}
                />
                <StatBox label="Ly/Lx" value={result.r} color={C.inkMid} />
              </StatGrid>
              <div style={{ height: 10 }} />
              <UtilBar
                pct={result.util}
                label="Moment Utilization (Lx direction)"
              />
            </Card>
            <Card accentColor={result.pass ? C.green : C.red}>
              <PassFail
                pass={result.pass}
                code="IS 456:2000 — Cl. 24 (Slab Design)"
              />
            </Card>
            <Card accentColor={C.orange}>
              <SectionTitle>Reinforcement (per metre width)</SectionTitle>
              <ResultRow
                label="Ast_x required (Lx direction)"
                value={result.Ast_x}
                unit="mm²/m"
              />
              <ResultRow
                label="Ast minimum (IS 456 Cl. 26.5.2)"
                value={result.Ast_min}
                unit="mm²/m"
              />
              <Divider />
              <ResultRow
                label={`⌀${result.selDiaX} @ ${result.spcX} mm c/c (Lx)`}
                value={Math.round(
                  (((Math.PI * result.selDiaX * result.selDiaX) / 4) * 1000) /
                    result.spcX,
                )}
                unit="mm²/m"
                highlight
              />
              {result.isTwoWay && (
                <>
                  <Divider />
                  <ResultRow
                    label="Ast_y required (Ly direction)"
                    value={result.Ast_y}
                    unit="mm²/m"
                  />
                  <ResultRow
                    label={`⌀${result.selDiaY} @ ${result.spcY} mm c/c (Ly)`}
                    value={Math.round(
                      (((Math.PI * result.selDiaY * result.selDiaY) / 4) *
                        1000) /
                        result.spcY,
                    )}
                    unit="mm²/m"
                    highlight
                  />
                </>
              )}
            </Card>
            <Card accentColor={result.deflPass ? C.green : C.red}>
              <PassFail
                pass={result.deflPass}
                code="IS 456:2000 Cl. 23.2 — Deflection (L/d)"
              />
              <ResultRow label="L/d Actual" value={result.ldActual} />
              <ResultRow
                label="L/d Allowable"
                value={result.ldAllow}
                highlight
              />
              {!result.deflPass && (
                <div style={{ marginTop: 10 }}>
                  <InfoBox color={C.red} lightColor={C.redLight}>
                    ✗ L/d ratio exceeded. Increase slab thickness or reduce
                    span.
                  </InfoBox>
                </div>
              )}
            </Card>
          </>
        }
      />
      <SaveToast msg={toastMsg} />
    </>
  );
}
