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
import { analyzeFoundation } from "@engines/structuralEngine";
import { SavePanel, SaveToast } from "@components/SavePanel";
import { useSaveToProject } from "../hooks/useSaveToProject";

function FoundationSketch({ B, L, D, type }) {
  const sc = Math.min(240 / Math.max(B, 1), 140 / Math.max(L, 1));
  const fw = Math.max(B * sc, 10),
    fh = Math.max(L * sc, 10);
  const ox = (320 - fw) / 2,
    oy = (180 - fh) / 2;
  const col = type === "isolated" ? 50 : fw;

  return (
    <motion.svg
      width={320}
      height={240}
      style={{ display: "block", margin: "0 auto", overflow: "visible" }}
    >
      {/* Soil / Excavation background */}
      <motion.rect
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        x={0}
        y={oy + fh}
        width={320}
        height={50}
        fill="url(#soil)"
      />

      {/* Soil hatch lines */}
      <AnimatePresence>
        {Array.from({ length: 8 }, (_, i) => (
          <motion.line
            key={i}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
            x1={ox + (i * fw) / 7}
            y1={oy + fh}
            x2={ox + (i * fw) / 7 - 20}
            y2={oy + fh + 25}
            stroke={C.inkMid}
            strokeWidth={1.5}
            opacity={0.3}
          />
        ))}
      </AnimatePresence>
      <motion.line
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        x1={ox - 30}
        y1={oy + fh}
        x2={ox + fw + 30}
        y2={oy + fh}
        stroke={C.inkMid}
        strokeWidth={2}
      />

      {/* Main Footing Body */}
      <motion.rect
        layout
        initial={{ pathLength: 0, fillOpacity: 0 }}
        animate={{ pathLength: 1, fillOpacity: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        x={ox}
        y={oy}
        width={fw}
        height={fh}
        fill="url(#concrete)"
        stroke={C.borderMid}
        strokeWidth={3.5}
        rx={4}
        filter="url(#shadow)"
      />

      {/* Column Stub */}
      <motion.rect
        layout
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        x={ox + (fw - col) / 2}
        y={oy - 40}
        width={col}
        height={46}
        fill="url(#concrete)"
        stroke={C.blue}
        strokeWidth={2.5}
        rx={2}
        filter="url(#shadow)"
      />

      {/* Rebar visualization (bottom mesh) */}
      <AnimatePresence>
        {[ox + 15, ox + fw / 2, ox + fw - 15].map((rx, i) => (
          <motion.circle
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.8 + i * 0.1 }}
            cx={rx}
            cy={oy + fh - 10}
            r={5.5}
            fill={C.ink}
            opacity={0.7}
            filter="url(#glow)"
          />
        ))}
      </AnimatePresence>

      {/* Load Arrow */}
      <motion.g
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: [0, -6, 0] }}
        transition={{
          opacity: { delay: 1.5 },
          y: { repeat: Infinity, duration: 2, delay: 2 },
        }}
      >
        <line
          x1={ox + fw / 2}
          y1={oy - 70}
          x2={ox + fw / 2}
          y2={oy - 42}
          stroke={C.red}
          strokeWidth={4}
          strokeLinecap="round"
        />
        <polygon
          points={`${ox + fw / 2},${oy - 40} ${ox + fw / 2 - 8},${oy - 54} ${ox + fw / 2 + 8},${oy - 54}`}
          fill={C.red}
        />
        <text
          x={ox + fw / 2 + 12}
          y={oy - 58}
          fill={C.red}
          fontSize={12}
          fontWeight={800}
          fontFamily={F.mono}
        >
          P_axial
        </text>
      </motion.g>

      {/* Labels */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <text
          x={ox + fw / 2}
          y={oy + fh + 40}
          textAnchor="middle"
          fill={C.inkMid}
          fontSize={12}
          fontWeight={800}
          fontFamily={F.mono}
        >
          Width B = {B}m
        </text>
        <text
          x={ox - 32}
          y={oy + fh / 2}
          textAnchor="middle"
          fill={C.inkMid}
          fontSize={12}
          fontWeight={800}
          fontFamily={F.mono}
          transform={`rotate(-90,${ox - 32},${oy + fh / 2})`}
        >
          Length L = {L}m
        </text>
        <text
          x={ox + fw + 28}
          y={oy + fh / 2 + 5}
          textAnchor="middle"
          fill={C.inkLight}
          fontSize={11}
          fontWeight={700}
          fontFamily={F.mono}
        >
          Depth D = {D}m
        </text>
      </motion.g>
    </motion.svg>
  );
}

export default function FoundationPage({ onDataChange }) {
  const [type, setType] = useState("isolated");
  const [P, setP] = useState(600);
  const [Mx, setMx] = useState(40);
  const [My, setMy] = useState(20);
  const [SBC, setSBC] = useState(150);
  const [D, setD] = useState(1.5);
  const [B, setB] = useState(2);
  const [L, setL] = useState(2);
  const [fck, setFck] = useState(25);
  const [fy, setFy] = useState(415);
  const [gamma, setGamma] = useState(18);

  const result = analyzeFoundation({
    type,
    P,
    Mx,
    My,
    SBC,
    D,
    B,
    L,
    fck,
    fy,
    gamma,
  });

  useEffect(() => {
    onDataChange?.({ type, P, Mx, My, SBC, D, B, L, fck, fy, gamma, result });
  }, [type, P, Mx, My, SBC, D, B, L, fck, fy, gamma]);

  const moduleData = { type, P, Mx, My, SBC, D, B, L, fck, fy, gamma, result };
  const {
    projectName,
    setProjectName,
    existingNames,
    save,
    isSaving,
    toastMsg,
  } = useSaveToProject("foundation", moduleData);

  return (
    <>
      <TwoCol
        left={
          <>
            <Card>
              <SectionTitle>Foundation Type</SectionTitle>
              <div style={{ display: "flex", gap: 8 }}>
                {["isolated", "combined", "strip", "raft"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    style={{
                      padding: "5px 11px",
                      borderRadius: 6,
                      border: `1.5px solid ${type === t ? C.blue : C.border}`,
                      background: type === t ? C.blueLight : "#fff",
                      color: type === t ? C.blue : C.inkLight,
                      fontSize: 11,
                      fontFamily: F.sans,
                      fontWeight: 600,
                      cursor: "pointer",
                      textTransform: "capitalize",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Card>
            <Card>
              <SectionTitle>Applied Loads</SectionTitle>
              <Inp
                label="Column Load P (kN)"
                value={P}
                onChange={setP}
                min={0}
              />
              <Inp
                label="Moment Mx (kNm)"
                value={Mx}
                onChange={setMx}
                min={0}
              />
              <Inp
                label="Moment My (kNm)"
                value={My}
                onChange={setMy}
                min={0}
              />
            </Card>
            <Card>
              <SectionTitle>Soil & Depth</SectionTitle>
              <Inp
                label="Safe Bearing Capacity (kN/m²)"
                value={SBC}
                onChange={setSBC}
                min={50}
              />
              <Inp
                label="Foundation Depth D (m)"
                value={D}
                onChange={setD}
                min={0.5}
                step={0.1}
              />
              <Inp
                label="Soil Unit Weight γ (kN/m³)"
                value={gamma}
                onChange={setGamma}
                min={14}
                step={0.5}
              />
            </Card>
            <Card>
              <SectionTitle>Footing Size</SectionTitle>
              <Inp
                label="Width B (m)"
                value={B}
                onChange={setB}
                min={0.5}
                step={0.1}
              />
              <Inp
                label="Length L (m)"
                value={L}
                onChange={setL}
                min={0.5}
                step={0.1}
              />
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
                ]}
              />
            </Card>
          </>
        }
        right={
          <>
            <SavePanel
              moduleLabel="Foundation Design"
              moduleIcon="⊓"
              accentColor="#0891b2"
              projectName={projectName}
              setProjectName={setProjectName}
              existingNames={existingNames}
              onSave={save}
              isSaving={isSaving}
              hasData={true}
            />

            <Card>
              <SectionTitle>Foundation Schematic</SectionTitle>
              <FoundationSketch B={result.B} L={result.L} D={D} type={type} />
            </Card>
            <Card>
              <StatGrid cols={3}>
                <StatBox
                  label="Net Pressure"
                  value={result.qnet}
                  unit="kN/m²"
                  color={C.blue}
                />
                <StatBox
                  label="Gross qmax"
                  value={result.qmax}
                  unit="kN/m²"
                  color={C.orange}
                />
                <StatBox
                  label="Depth d_eff"
                  value={result.d_eff}
                  unit="mm"
                  color={C.inkMid}
                />
              </StatGrid>
            </Card>
            <Card accentColor={result.passSBC ? C.green : C.red}>
              <PassFail
                pass={result.passSBC}
                code="IS 1904:1986 — Bearing Capacity Check"
              />
              <ResultRow
                label="Net soil pressure qnet"
                value={result.qnet}
                unit="kN/m²"
              />
              <ResultRow
                label="Safe Bearing Capacity"
                value={SBC}
                unit="kN/m²"
                highlight
              />
              <div style={{ height: 10 }} />
              <UtilBar
                pct={((result.qnet / SBC) * 100).toFixed(1)}
                label="Bearing Pressure Utilization"
              />
            </Card>
            <Card accentColor={result.passM ? C.green : C.red}>
              <PassFail
                pass={result.passM}
                code="IS 456:2000 Cl. 34 — Flexure Design"
              />
              <ResultRow
                label="Design Moment Mu"
                value={result.Mu}
                unit="kNm/m"
              />
              <ResultRow
                label="Capacity Mulim"
                value={result.Mulim}
                unit="kNm/m"
                highlight
              />
              <Divider />
              <ResultRow
                label="Ast required"
                value={result.Ast_req}
                unit="mm²/m"
              />
              <ResultRow
                label="Ast minimum"
                value={result.Ast_min}
                unit="mm²/m"
              />
              <ResultRow
                label={`⌀${result.barDia} @ ${result.spcOk} mm c/c`}
                value={result.Ast_prov}
                unit="mm²/m"
                highlight
              />
            </Card>
            <Card accentColor={result.punchPass ? C.green : C.red}>
              <PassFail
                pass={result.punchPass}
                code="IS 456:2000 Cl. 31.6 — Punching Shear"
              />
              <ResultRow
                label="Punching shear stress"
                value={result.tau_v_punch}
                unit="N/mm²"
              />
              <ResultRow
                label="Permissible (ks·τc)"
                value={result.tau_c_punch}
                unit="N/mm²"
                highlight
              />
            </Card>
            <Card accentColor={result.shearPass ? C.green : C.red}>
              <PassFail
                pass={result.shearPass}
                code="IS 456:2000 Cl. 31.7 — One-way Shear"
              />
              <ResultRow
                label="Shear stress τv"
                value={result.tau_v_shear}
                unit="N/mm²"
              />
              <ResultRow
                label="Permissible τc"
                value={result.tau_c_shear}
                unit="N/mm²"
                highlight
              />
            </Card>
          </>
        }
      />
      <SaveToast msg={toastMsg} />
    </>
  );
}
