import { useState, useEffect } from "react";
import { C, F } from "@styles/tokens";
import {
  Card,
  TwoCol,
  StatGrid,
  StatBox,
  UtilBar,
  PassFail,
  Inp,
  SectionTitle,
  InfoBox,
  ResultRow,
  Divider,
} from "@components/ui";
import { analyzeSlab } from "@engines/structuralEngine";
import { SavePanel, SaveToast } from "@components/SavePanel";
import { useSaveToProject } from "../hooks/useSaveToProject";

function SlabPlan({ Lx, Ly, isTwoWay, r }) {
  const sc = Math.min(220 / Math.max(Lx, 1), 150 / Math.max(Ly, 1));
  const sw = Lx * sc,
    sh = Ly * sc;
  const ox = (280 - sw) / 2,
    oy = (170 - sh) / 2;
  return (
    <svg
      width={280}
      height={190}
      style={{ display: "block", margin: "0 auto" }}
    >
      <rect
        x={ox}
        y={oy}
        width={sw}
        height={sh}
        fill="#e8f5ef"
        stroke={C.green}
        strokeWidth={2}
      />
      {Array.from({ length: 6 }, (_, i) => (
        <line
          key={`h${i}`}
          x1={ox + 2}
          y1={oy + ((i + 1) * sh) / 7}
          x2={ox + sw - 2}
          y2={oy + ((i + 1) * sh) / 7}
          stroke={C.orange}
          strokeWidth={0.8}
          opacity={0.6}
          strokeDasharray="3,2"
        />
      ))}
      {isTwoWay &&
        Array.from({ length: 6 }, (_, i) => (
          <line
            key={`v${i}`}
            x1={ox + ((i + 1) * sw) / 7}
            y1={oy + 2}
            x2={ox + ((i + 1) * sw) / 7}
            y2={oy + sh - 2}
            stroke={C.green}
            strokeWidth={0.8}
            opacity={0.6}
            strokeDasharray="3,2"
          />
        ))}
      <text
        x={ox + sw / 2}
        y={oy - 8}
        textAnchor="middle"
        fill={C.inkMid}
        fontSize={11}
        fontFamily={F.mono}
      >
        Lx = {Lx} m
      </text>
      <text
        x={ox - 14}
        y={oy + sh / 2}
        textAnchor="middle"
        fill={C.inkMid}
        fontSize={11}
        fontFamily={F.mono}
        transform={`rotate(-90, ${ox - 14}, ${oy + sh / 2})`}
      >
        Ly = {Ly} m
      </text>
      <text
        x={ox + sw / 2}
        y={oy + sh / 2 + 5}
        textAnchor="middle"
        fill={C.green}
        fontSize={12}
        fontFamily={F.mono}
        fontWeight="700"
      >
        {isTwoWay ? "TWO-WAY" : "ONE-WAY"}
      </text>
      <text
        x={ox + sw / 2}
        y={oy + sh / 2 + 20}
        textAnchor="middle"
        fill={C.inkLight}
        fontSize={9}
        fontFamily={F.mono}
      >
        Ly/Lx = {r}
      </text>
    </svg>
  );
}

function SlabSection({ thickness, wDL, wLL, dEff }) {
  return (
    <svg
      width={280}
      height={110}
      style={{ display: "block", margin: "0 auto" }}
    >
      {[50, 90, 130, 170, 210].map((ax) => (
        <g key={ax}>
          <line
            x1={ax}
            y1={5}
            x2={ax}
            y2={25}
            stroke={C.red}
            strokeWidth={1.5}
          />
          <polygon points={`${ax},25 ${ax - 4},15 ${ax + 4},15`} fill={C.red} />
        </g>
      ))}
      <text
        x={140}
        y={4}
        textAnchor="middle"
        fill={C.red}
        fontSize={9}
        fontFamily={F.mono}
      >
        w = {wDL + wLL} kN/m²
      </text>
      <rect
        x={20}
        y={28}
        width={240}
        height={45}
        fill="#dde4ef"
        stroke={C.blue}
        strokeWidth={2}
      />
      {[40, 80, 120, 160, 200, 240].map((rx) => (
        <circle key={rx} cx={rx} cy={63} r={4} fill={C.orange} />
      ))}
      <text
        x={140}
        y={87}
        textAnchor="middle"
        fill={C.inkMid}
        fontSize={9}
        fontFamily={F.mono}
      >
        Thickness = {thickness} mm
      </text>
      <text
        x={140}
        y={99}
        textAnchor="middle"
        fill={C.inkLight}
        fontSize={8}
        fontFamily={F.mono}
      >
        d_eff = {dEff} mm
      </text>
    </svg>
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
