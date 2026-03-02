import { useState, useEffect } from "react";
import { C, F, badge } from "@styles/tokens";
import {
  Card,
  TwoCol,
  StatGrid,
  StatBox,
  UtilBar,
  PassFail,
  TabBtn,
  Inp,
  SectionTitle,
  InfoBox,
  ResultRow,
  Divider,
} from "@components/ui";
import { DiagramCanvas } from "@components/charts/DiagramCanvas";
import { analyzeBeam, checkBeamSection } from "@engines/beamEngine";
import { SavePanel, SaveToast } from "@components/SavePanel";
import { useSaveToProject } from "../hooks/useSaveToProject";

function BeamSchematic({ span, loads, support }) {
  const W = 560,
    H = 90,
    lx = 40,
    rx = W - 20,
    pw = rx - lx,
    bY = 48;
  const toX = (v) => lx + (v / Math.max(span, 0.01)) * pw;
  return (
    <svg
      width="100%"
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ fontFamily: F.mono }}
    >
      <rect
        x={lx}
        y={bY - 5}
        width={pw}
        height={10}
        fill="#dde6f5"
        stroke={C.blue}
        strokeWidth={2}
        rx={2}
      />
      {support === "simply" && (
        <>
          <polygon
            points={`${lx},${bY + 5} ${lx - 12},${bY + 22} ${lx + 12},${bY + 22}`}
            fill={C.blueLight}
            stroke={C.blue}
            strokeWidth={1.5}
          />
          <line
            x1={lx - 15}
            y1={bY + 24}
            x2={lx + 15}
            y2={bY + 24}
            stroke={C.blue}
            strokeWidth={2}
          />
          <polygon
            points={`${rx},${bY + 5} ${rx - 12},${bY + 22} ${rx + 12},${bY + 22}`}
            fill={C.blueLight}
            stroke={C.blue}
            strokeWidth={1.5}
          />
          <line
            x1={rx - 15}
            y1={bY + 24}
            x2={rx + 15}
            y2={bY + 24}
            stroke={C.blue}
            strokeWidth={2}
          />
        </>
      )}
      {support === "cantilever" && (
        <rect
          x={lx - 18}
          y={bY - 16}
          width={18}
          height={32}
          fill={C.blueLight}
          stroke={C.blue}
          strokeWidth={1.5}
        />
      )}
      {support === "fixed" && (
        <>
          <rect
            x={lx - 12}
            y={bY - 14}
            width={12}
            height={28}
            fill={C.blueLight}
            stroke={C.blue}
            strokeWidth={1.5}
          />
          <rect
            x={rx}
            y={bY - 14}
            width={12}
            height={28}
            fill={C.blueLight}
            stroke={C.blue}
            strokeWidth={1.5}
          />
        </>
      )}
      {loads.map((l, i) => {
        if (l.type === "udl") {
          const x1 = toX(l.start),
            x2 = toX(l.end);
          const cnt = Math.max(3, Math.floor((x2 - x1) / 28));
          return (
            <g key={i}>
              <line
                x1={x1}
                y1={14}
                x2={x2}
                y2={14}
                stroke={C.orange}
                strokeWidth={1.8}
              />
              {Array.from({ length: cnt + 1 }, (_, j) => {
                const ax = x1 + (j / cnt) * (x2 - x1);
                return (
                  <g key={j}>
                    <line
                      x1={ax}
                      y1={14}
                      x2={ax}
                      y2={34}
                      stroke={C.orange}
                      strokeWidth={1.3}
                    />
                    <polygon
                      points={`${ax},34 ${ax - 3},25 ${ax + 3},25`}
                      fill={C.orange}
                    />
                  </g>
                );
              })}
              <text
                x={(x1 + x2) / 2}
                y={10}
                textAnchor="middle"
                fill={C.orange}
                fontSize={9}
              >
                {l.w} kN/m
              </text>
            </g>
          );
        }
        const ax = toX(l.pos);
        return (
          <g key={i}>
            <line
              x1={ax}
              y1={6}
              x2={ax}
              y2={34}
              stroke={C.blue}
              strokeWidth={1.8}
            />
            <polygon
              points={`${ax},34 ${ax - 4},24 ${ax + 4},24`}
              fill={C.blue}
            />
            <text x={ax} y={5} textAnchor="middle" fill={C.blue} fontSize={9}>
              {l.p}kN
            </text>
          </g>
        );
      })}
      <line
        x1={lx}
        y1={H - 6}
        x2={rx}
        y2={H - 6}
        stroke={C.inkLight}
        strokeWidth={1}
      />
      <text
        x={(lx + rx) / 2}
        y={H - 1}
        textAnchor="middle"
        fill={C.inkMid}
        fontSize={9}
      >
        L = {span} m
      </text>
    </svg>
  );
}

function SectionPreview({ b, d, material }) {
  const scale = Math.min(60 / b, 80 / d, 0.3);
  const sw = Math.min(b * scale, 60),
    sh = Math.min(d * scale, 80);
  const ox = (70 - sw) / 2,
    oy = (85 - sh) / 2;
  const fill = material === "concrete" ? "#dde4ef" : "#e8ddd0";
  const stroke = material === "concrete" ? C.blue : C.orange;
  return (
    <svg width={70} height={85} style={{ display: "block", margin: "0 auto" }}>
      <rect
        x={ox}
        y={oy}
        width={sw}
        height={sh}
        fill={fill}
        stroke={stroke}
        strokeWidth={1.5}
      />
      {material === "concrete" &&
        [
          [ox + 5, oy + 5],
          [ox + sw - 5, oy + 5],
          [ox + 5, oy + sh - 5],
          [ox + sw - 5, oy + sh - 5],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={3} fill={stroke} />
        ))}
      {material === "steel" && (
        <>
          <rect
            x={ox}
            y={oy}
            width={sw}
            height={sh * 0.12}
            fill={stroke}
            opacity={0.7}
          />
          <rect
            x={ox}
            y={oy + sh - sh * 0.12}
            width={sw}
            height={sh * 0.12}
            fill={stroke}
            opacity={0.7}
          />
          <rect
            x={ox + sw / 2 - sw * 0.08}
            y={oy + sh * 0.12}
            width={sw * 0.16}
            height={sh * 0.76}
            fill={stroke}
            opacity={0.4}
          />
        </>
      )}
      <text
        x={35}
        y={82}
        textAnchor="middle"
        fill={C.inkMid}
        fontSize={8}
        fontFamily={F.mono}
      >
        {b}×{d}
      </text>
    </svg>
  );
}

function LoadCard({ load, onUpdate, onRemove }) {
  const smallInput = {
    background: C.bgAlt,
    border: `1px solid ${C.border}`,
    borderRadius: 6,
    color: C.ink,
    padding: "5px 8px",
    fontFamily: F.mono,
    fontSize: 12,
    width: "100%",
    outline: "none",
  };
  return (
    <div
      style={{
        background: C.bgAlt,
        borderRadius: 8,
        padding: 10,
        marginBottom: 8,
        border: `1px solid ${C.border}`,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <span
          style={badge(
            load.type === "udl" ? C.orange : C.blue,
            load.type === "udl" ? C.orangeLight : C.blueLight,
          )}
        >
          {load.type === "udl" ? "UDL" : "POINT LOAD"}
        </span>
        <button
          onClick={onRemove}
          style={{
            background: "none",
            border: "none",
            color: C.red,
            cursor: "pointer",
            fontSize: 16,
            lineHeight: 1,
            padding: "0 4px",
          }}
        >
          ×
        </button>
      </div>
      {load.type === "udl" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 6,
          }}
        >
          {[
            ["w (kN/m)", "w"],
            ["from (m)", "start"],
            ["to (m)", "end"],
          ].map(([lbl, key]) => (
            <div key={key}>
              <label
                style={{
                  display: "block",
                  fontSize: 10,
                  color: C.inkLight,
                  marginBottom: 2,
                  fontFamily: F.mono,
                }}
              >
                {lbl}
              </label>
              <input
                style={smallInput}
                type="number"
                value={load[key]}
                onChange={(e) => onUpdate(key, parseFloat(e.target.value) || 0)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}
        >
          {[
            ["P (kN)", "p"],
            ["at (m)", "pos"],
          ].map(([lbl, key]) => (
            <div key={key}>
              <label
                style={{
                  display: "block",
                  fontSize: 10,
                  color: C.inkLight,
                  marginBottom: 2,
                  fontFamily: F.mono,
                }}
              >
                {lbl}
              </label>
              <input
                style={smallInput}
                type="number"
                value={load[key]}
                onChange={(e) => onUpdate(key, parseFloat(e.target.value) || 0)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BeamPage({ onDataChange }) {
  const [span, setSpan] = useState(6);
  const [support, setSupport] = useState("simply");
  const [material, setMaterial] = useState("concrete");
  const [b, setB] = useState(300);
  const [d, setD] = useState(500);
  const [fck, setFck] = useState(25);
  const [fy, setFy] = useState(415);
  const [loads, setLoads] = useState([
    { id: 1, type: "udl", w: 20, start: 0, end: 6 },
  ]);
  const [result, setResult] = useState(null);
  const [check, setCheck] = useState(null);

  useEffect(() => {
    if (!loads.length || span <= 0) return;
    const res = analyzeBeam(span, loads, support);
    const chk = checkBeamSection(
      material,
      b,
      d,
      res.maxM,
      res.maxV,
      span,
      fck,
      fy,
    );
    setResult(res);
    setCheck(chk);
    onDataChange?.({
      span,
      support,
      material,
      b,
      d,
      fck,
      fy,
      loads,
      result: res,
      check: chk,
    });
  }, [span, support, material, b, d, fck, fy, loads]);

  const addLoad = (type) =>
    setLoads((prev) => [
      ...prev,
      type === "udl"
        ? { id: Date.now(), type: "udl", w: 10, start: 0, end: span }
        : { id: Date.now(), type: "point", p: 50, pos: span / 2 },
    ]);
  const updateLoad = (id, key, val) =>
    setLoads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [key]: val } : l)),
    );
  const removeLoad = (id) =>
    setLoads((prev) => prev.filter((l) => l.id !== id));

  // Save hook
  const moduleData =
    result && check
      ? { span, support, material, b, d, fck, fy, loads, result, check }
      : null;
  const {
    projectName,
    setProjectName,
    existingNames,
    save,
    isSaving,
    toastMsg,
  } = useSaveToProject("beam", moduleData);

  return (
    <>
      <TwoCol
        left={
          <>
            <Card>
              <SectionTitle>Geometry</SectionTitle>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <Inp
                  label="Span (m)"
                  value={span}
                  onChange={setSpan}
                  min={1}
                  max={100}
                />
                <Inp
                  label="Support Type"
                  value={support}
                  onChange={setSupport}
                  options={[
                    { v: "simply", l: "Simply Supported" },
                    { v: "cantilever", l: "Cantilever" },
                    { v: "fixed", l: "Fixed-Fixed" },
                  ]}
                />
              </div>
            </Card>

            <Card>
              <SectionTitle>Cross Section</SectionTitle>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <TabBtn
                  active={material === "concrete"}
                  onClick={() => setMaterial("concrete")}
                >
                  Concrete
                </TabBtn>
                <TabBtn
                  active={material === "steel"}
                  onClick={() => setMaterial("steel")}
                  color={C.orange}
                >
                  Steel
                </TabBtn>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr auto",
                  gap: 10,
                  alignItems: "end",
                }}
              >
                <Inp label="Width b (mm)" value={b} onChange={setB} min={50} />
                <Inp label="Depth d (mm)" value={d} onChange={setD} min={50} />
                <SectionPreview b={b} d={d} material={material} />
              </div>
            </Card>

            {material === "concrete" && (
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
              </Card>
            )}

            <Card>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 14,
                }}
              >
                <SectionTitle style={{ margin: 0 }}>Loads</SectionTitle>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => addLoad("udl")}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 6,
                      border: `1.5px solid ${C.orange}`,
                      background: C.orangeLight,
                      color: C.orange,
                      cursor: "pointer",
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    + UDL
                  </button>
                  <button
                    onClick={() => addLoad("point")}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 6,
                      border: `1.5px solid ${C.blue}`,
                      background: C.blueLight,
                      color: C.blue,
                      cursor: "pointer",
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    + Point
                  </button>
                </div>
              </div>
              {loads.map((l) => (
                <LoadCard
                  key={l.id}
                  load={l}
                  onUpdate={(key, val) => updateLoad(l.id, key, val)}
                  onRemove={() => removeLoad(l.id)}
                />
              ))}
              {loads.length === 0 && (
                <p
                  style={{
                    color: C.inkLight,
                    fontSize: 12,
                    textAlign: "center",
                    fontFamily: F.mono,
                    padding: "12px 0",
                  }}
                >
                  No loads. Click + UDL or + Point to add.
                </p>
              )}
            </Card>
          </>
        }
        right={
          <>
            {/* ── SAVE PANEL — top of right column ── */}
            <SavePanel
              moduleLabel="Beam Design"
              moduleIcon="━"
              accentColor={C.navy}
              projectName={projectName}
              setProjectName={setProjectName}
              existingNames={existingNames}
              onSave={save}
              isSaving={isSaving}
              hasData={!!moduleData}
            />

            <Card>
              <SectionTitle>Structural Schematic</SectionTitle>
              <BeamSchematic span={span} loads={loads} support={support} />
            </Card>

            {result && (
              <Card>
                <StatGrid cols={4}>
                  <StatBox
                    label="Ra"
                    value={result.Ra.toFixed(2)}
                    unit="kN"
                    color={C.blue}
                  />
                  <StatBox
                    label="Rb"
                    value={result.Rb.toFixed(2)}
                    unit="kN"
                    color={C.blue}
                  />
                  <StatBox
                    label="Max Shear"
                    value={result.maxV.toFixed(2)}
                    unit="kN"
                    color={C.orange}
                  />
                  <StatBox
                    label="Max Moment"
                    value={result.maxM.toFixed(2)}
                    unit="kNm"
                    color={C.green}
                  />
                </StatGrid>
              </Card>
            )}

            {result && (
              <Card>
                <SectionTitle>Shear Force Diagram (SFD)</SectionTitle>
                <DiagramCanvas
                  x={result.x}
                  values={result.sfd}
                  span={span}
                  color={C.orange}
                  label="SFD"
                  unit="kN"
                />
                <div style={{ height: 18 }} />
                <SectionTitle>Bending Moment Diagram (BMD)</SectionTitle>
                <DiagramCanvas
                  x={result.x}
                  values={result.bmd}
                  span={span}
                  color={C.blue}
                  label="BMD"
                  unit="kNm"
                />
              </Card>
            )}

            {check && result && material === "concrete" && (
              <>
                <Card accentColor={check.pass ? C.green : C.red}>
                  <PassFail
                    pass={check.pass}
                    code={`${check.code} Cl. G-1 — Flexure`}
                  />
                  <StatGrid cols={3}>
                    <StatBox
                      label="Applied Mu"
                      value={result.maxM.toFixed(2)}
                      unit="kNm"
                      color={C.ink}
                    />
                    <StatBox
                      label="Capacity Mulim"
                      value={check.Mulim}
                      unit="kNm"
                      color={C.green}
                    />
                    <StatBox
                      label="d effective"
                      value={check.d_eff}
                      unit="mm"
                      color={C.inkMid}
                    />
                  </StatGrid>
                  <div style={{ height: 10 }} />
                  <UtilBar pct={check.util} label="Moment Utilization" />
                </Card>

                <Card accentColor={C.orange}>
                  <SectionTitle>
                    Flexural Reinforcement (IS 456 Cl. 26.5)
                  </SectionTitle>
                  <ResultRow
                    label="Ast required"
                    value={check.Ast_req}
                    unit="mm²"
                  />
                  <ResultRow
                    label="Ast minimum (IS 456 Cl. 26.5.1.1)"
                    value={check.Ast_min}
                    unit="mm²"
                  />
                  <ResultRow
                    label="Ast maximum (0.04·b·d)"
                    value={check.Ast_max}
                    unit="mm²"
                  />
                  <Divider />
                  <ResultRow
                    label={`Provide: ${check.nBars} bars ⌀${check.barDia} mm`}
                    value={check.Ast_prov}
                    unit="mm² (provided)"
                    highlight
                  />
                  <ResultRow label="Steel ratio pt" value={`${check.pt}%`} />
                </Card>

                <Card accentColor={check.shearPass ? C.green : C.red}>
                  <PassFail
                    pass={check.shearPass}
                    code="IS 456:2000 Cl. 40 — Shear Design"
                  />
                  <ResultRow
                    label="Nominal shear stress τv"
                    value={check.tau_v}
                    unit="N/mm²"
                  />
                  <ResultRow
                    label="Design shear strength τc"
                    value={check.tau_c}
                    unit="N/mm²"
                  />
                  <ResultRow
                    label="Max permissible τmax"
                    value={check.tau_max}
                    unit="N/mm²"
                    highlight
                  />
                  <Divider />
                  {check.needsLinks ? (
                    <InfoBox color={C.orange} lightColor={C.orangeLight}>
                      Shear reinforcement required: ⌀{check.stirrupDia} 2-legged
                      @ <strong>{check.stirrupSpc} mm</strong> c/c (IS 456 Cl.
                      40.4)
                    </InfoBox>
                  ) : (
                    <InfoBox color={C.green} lightColor={C.greenLight}>
                      Nominal links only: ⌀{check.stirrupDia} 2-legged @{" "}
                      <strong>{check.stirrupSpc} mm</strong> c/c
                    </InfoBox>
                  )}
                </Card>

                <Card accentColor={check.deflPass ? C.green : C.red}>
                  <PassFail
                    pass={check.deflPass}
                    code="IS 456:2000 Cl. 23.2 — Deflection (L/d check)"
                  />
                  <ResultRow label="Actual L/d" value={check.ldActual} />
                  <ResultRow
                    label="Allowable L/d"
                    value={check.ldAllow}
                    highlight
                  />
                  {!check.deflPass && (
                    <div style={{ marginTop: 10 }}>
                      <InfoBox color={C.red} lightColor={C.redLight}>
                        ✗ L/d exceeded — increase beam depth or reduce span.
                      </InfoBox>
                    </div>
                  )}
                </Card>
              </>
            )}

            {check && result && material === "steel" && (
              <Card accentColor={check.pass ? C.green : C.red}>
                <PassFail pass={check.pass} code={check.code} />
                <StatGrid cols={3}>
                  <StatBox
                    label="Applied Mu"
                    value={result.maxM.toFixed(2)}
                    unit="kNm"
                    color={C.ink}
                  />
                  <StatBox
                    label="Capacity Md"
                    value={check.Mulim}
                    unit="kNm"
                    color={C.green}
                  />
                  <StatBox
                    label="Shear Vd"
                    value={check.Vd}
                    unit="kN"
                    color={C.orange}
                  />
                </StatGrid>
                <div style={{ height: 10 }} />
                <UtilBar pct={check.util} label="Moment Utilization" />
                <UtilBar
                  pct={check.shearUtil}
                  label="Shear Utilization"
                  color={C.orange}
                />
              </Card>
            )}
          </>
        }
      />

      {/* Toast */}
      <SaveToast msg={toastMsg} />
    </>
  );
}
