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
} from "@components/ui";
import { calcBridgeLoads, IRC_VEHICLE_LOADS } from "@engines/roadEngine";

// ═══════════════════════════════════════════════
//  BRIDGE PAGE
// ═══════════════════════════════════════════════

function BridgeElevationSVG({ span, vehicleClass }) {
  return (
    <motion.svg width="100%" height={120} viewBox="0 0 580 120" style={{ overflow: 'visible' }}>
      {/* Water beneath */}
      <motion.rect
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        x={30} y={85} width={520} height={20}
        fill="url(#soil)"
        opacity={0.1}
      />
      
      {/* Animated waves/water */}
      <motion.path
        d="M 30 85 Q 55 80, 80 85 T 130 85 T 180 85 T 230 85 T 280 85 T 330 85 T 380 85 T 430 85 T 480 85 T 530 85 T 550 85"
        fill="none"
        stroke={C.blue}
        strokeWidth={1}
        opacity={0.3}
        animate={{ x: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
      />

      {/* Bridge Deck */}
      <motion.rect
        layout
        x={30} y={46} width={520} height={14}
        fill="url(#concrete)"
        stroke={C.blue}
        strokeWidth={2}
        filter="url(#shadow)"
      />

      {/* Piers/Columns */}
      <AnimatePresence>
        {[110, 210, 310, 410, 500].map((gx, i) => (
          <motion.rect
            key={gx}
            initial={{ height: 0 }}
            animate={{ height: 32 }}
            x={gx - 10} y={60} width={20} height={32}
            fill="url(#concrete)"
            stroke={C.blue}
            strokeWidth={1}
            opacity={0.8}
            filter="url(#shadow)"
          />
        ))}
      </AnimatePresence>

      {/* Abutments */}
      <rect x={14} y={56} width={24} height={40} fill="url(#soil)" stroke={C.blue} strokeWidth={2} rx={2} />
      <rect x={542} y={56} width={24} height={40} fill="url(#soil)" stroke={C.blue} strokeWidth={2} rx={2} />

      {/* River Bed Line */}
      <line x1={0} y1={96} x2={580} y2={96} stroke={C.inkMid} strokeWidth={1.5} opacity={0.4} />

      {/* Moving Vehicle */}
      <motion.g 
        animate={{ x: [50, 460, 50] }} 
        transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
      >
        <rect x={0} y={32} width={70} height={14} fill="url(#steel)" stroke={C.orange} strokeWidth={1.5} rx={3} filter="url(#shadow)" />
        <motion.circle animate={{ scale: [0.95, 1.05, 0.95] }} cx={15} cy={46} r={5} fill={C.orange} filter="url(#glow)" />
        <motion.circle animate={{ scale: [0.95, 1.05, 0.95] }} cx={55} cy={46} r={5} fill={C.orange} filter="url(#glow)" />
        <text x={35} y={28} textAnchor="middle" fill={C.orange} fontSize={9} fontWeight={800} fontFamily={F.mono}>
          {vehicleClass}
        </text>
      </motion.g>

      <motion.g layout>
        <line x1={30} y1={108} x2={550} y2={108} stroke={C.inkFaint} strokeWidth={1} />
        <text x={290} y={116} textAnchor="middle" fill={C.inkMid} fontSize={10} fontWeight={700} fontFamily={F.mono}>
          Total Structure Length = {span} m
        </text>
      </motion.g>
    </motion.svg>
  );
}

function AxleLoadDiagramSVG({ axles }) {
  const W = 520,
    ox = 30;
  const spacing = W / (axles.length + 1);
  const maxA = Math.max(...axles);
  return (
    <motion.svg width="100%" height={110} viewBox="0 0 580 110" style={{ overflow: 'visible' }}>
      <line
        x1={ox}
        y1={80}
        x2={ox + W}
        y2={80}
        stroke={C.blue}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <AnimatePresence>
        {axles.map((a, i) => {
          const x = ox + (i + 1) * spacing;
          const h = (a / maxA) * 55;
          return (
            <motion.g 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <motion.line
                initial={{ height: 0 }}
                animate={{ height: h }}
                x1={x}
                y1={80 - h}
                x2={x}
                y2={80}
                stroke={C.orange}
                strokeWidth={2.5}
                strokeLinecap="round"
              />
              <polygon
                points={`${x},80 ${x - 5},70 ${x + 5},70`}
                fill={C.orange}
              />
              <motion.circle
                whileHover={{ scale: 1.2 }}
                cx={x}
                cy={80}
                r={7}
                fill="url(#steel)"
                stroke={C.blue}
                strokeWidth={1.5}
                filter="url(#shadow)"
              />
              <text
                x={x}
                y={80 - h - 8}
                textAnchor="middle"
                fill={C.orange}
                fontSize={9}
                fontWeight={800}
                fontFamily={F.mono}
                filter="url(#glow)"
              >
                {a}
              </text>
            </motion.g>
          );
        })}
      </AnimatePresence>
      <text
        x={ox + W / 2}
        y={102}
        textAnchor="middle"
        fill={C.inkLight}
        fontSize={10}
        fontWeight={700}
        fontFamily={F.mono}
        textTransform="uppercase"
        letterSpacing="1px"
      >
        Axle Spacing Schematic (IRC)
      </text>
    </motion.svg>
  );
}

export function BridgePage({ onDataChange }) {
  const [span, setSpan] = useState(20);
  const [width, setWidth] = useState(7.5);
  const [vc, setVc] = useState("A");

  const result = calcBridgeLoads({ span, width, vehicleClass: vc });
  const load = IRC_VEHICLE_LOADS[vc];

  useEffect(() => {
    onDataChange?.({ span, width, vc, result });
  }, [span, width, vc]);

  return (
    <TwoCol
      left={
        <>
          <Card>
            <SectionTitle>Bridge Parameters</SectionTitle>
            <Inp
              label="Span L (m)"
              value={span}
              onChange={setSpan}
              min={5}
              max={200}
            />
            <Inp
              label="Carriageway Width (m)"
              value={width}
              onChange={setWidth}
              min={4}
              step={0.5}
            />
          </Card>

          <Card>
            <SectionTitle>IRC Vehicle Class (IRC:6)</SectionTitle>
            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
              {["A", "B", "AA"].map((v) => (
                <TabBtn
                  key={v}
                  active={vc === v}
                  onClick={() => setVc(v)}
                  color={vc === v ? C.purple : undefined}
                >
                  Class {v}
                </TabBtn>
              ))}
            </div>
            <div
              style={{
                background: C.bgAlt,
                borderRadius: 7,
                padding: "10px 12px",
                fontSize: 12,
                fontFamily: F.mono,
                color: C.inkMid,
                lineHeight: 2,
              }}
            >
              {vc === "A" && (
                <>
                  <div>Standard highway — National & State highways</div>
                </>
              )}
              {vc === "B" && (
                <>
                  <div>Reduced loading — Temporary / minor bridges</div>
                </>
              )}
              {vc === "AA" && (
                <>
                  <div>Heavy tracked / wheeled vehicle — Special only</div>
                </>
              )}
              <div>
                Total axle load:{" "}
                <strong>{load.axles.reduce((a, b) => a + b, 0)} kN</strong>
              </div>
              {load.udl > 0 && (
                <div>
                  UDL: <strong>{load.udl} kN/m</strong>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <SectionTitle>Axle Load Train</SectionTitle>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {load.axles.map((a, i) => (
                <span
                  key={i}
                  style={{
                    background: C.purpleLight,
                    border: `1px solid ${C.purple}30`,
                    borderRadius: 5,
                    padding: "3px 8px",
                    fontSize: 12,
                    fontFamily: F.mono,
                    color: C.purple,
                    fontWeight: 600,
                  }}
                >
                  {a} kN
                </span>
              ))}
            </div>
          </Card>
        </>
      }
      right={
        <>
          <Card>
            <SectionTitle>Bridge Elevation — IRC:6</SectionTitle>
            <BridgeElevationSVG span={span} vehicleClass={vc} />
          </Card>

          <Card>
            <SectionTitle>Axle Load Diagram</SectionTitle>
            <AxleLoadDiagramSVG axles={load.axles} />
          </Card>

          <Card>
            <StatGrid cols={2}>
              <StatBox
                label="LL Moment (no impact)"
                value={result.Mmax}
                unit="kNm"
                color={C.orange}
              />
              <StatBox
                label="Impact Factor"
                value={`${result.impactPct}%`}
                color={C.red}
              />
            </StatGrid>
            <div style={{ height: 8 }} />
            <StatGrid cols={2}>
              <StatBox
                label="LL Moment (with impact)"
                value={result.Mmax_imp}
                unit="kNm"
                color={C.purple}
              />
              <StatBox
                label="Dead Load Moment"
                value={result.MDL}
                unit="kNm"
                color={C.blue}
              />
            </StatGrid>
          </Card>

          <Card accentColor={C.purple}>
            <SectionTitle>Design Moment Summary</SectionTitle>
            <ResultRow
              label="Live Load Moment (unfactored)"
              value={result.Mmax}
              unit="kNm"
            />
            <ResultRow
              label={`Impact Factor (IRC:6 Cl. 208 — ${result.impactPct}%)`}
              value={`× ${(1 + parseFloat(result.impactPct) / 100).toFixed(3)}`}
            />
            <ResultRow
              label="Live Load with Impact"
              value={result.Mmax_imp}
              unit="kNm"
            />
            <ResultRow label="Dead Load Moment" value={result.MDL} unit="kNm" />
            <Divider />
            <ResultRow
              label="Total Design Moment"
              value={result.Mtotal}
              unit="kNm"
              highlight
            />
          </Card>

          <Card>
            <InfoBox color={C.purple} lightColor={C.purpleLight}>
              <strong>IRC:6 Notes applied in this calculation:</strong>
              <br />
              • Live load moment by influence line (simply-supported)
              <br />
              • Impact factor: 4.5/(6+L) for Class A/B; 0.10–0.25 for Class AA
              <br />
              • Dead load = 24 kN/m³ × slab thickness × width
              <br />
              <br />
              <strong>Still required for full design:</strong>
              <br />
              • Lane load combination factors (IRC:6 Table 1)
              <br />
              • Wind load per IRC:6 Cl. 209
              <br />• Footpath load: 5 kN/m² if applicable
            </InfoBox>
          </Card>
        </>
      }
    />
  );
}

// ═══════════════════════════════════════════════
//  BOQ PAGE
// ═══════════════════════════════════════════════
export function BOQPage({ onDataChange }) {
  const [tab, setTab] = useState("estimator");
  const [length, setLength] = useState(10);
  const [width, setWidth] = useState(6);
  const [height, setHeight] = useState(3);
  const [grade, setGrade] = useState("M25");
  const [steelPct, setSteelPct] = useState(2);
  const [boqItems, setBoqItems] = useState([
    { id: 1, desc: "PCC M20 in foundation", unit: "m³", qty: 10, rate: 6500 },
    { id: 2, desc: "RCC M25 in columns", unit: "m³", qty: 8, rate: 9000 },
    { id: 3, desc: "Brick masonry", unit: "m³", qty: 30, rate: 5500 },
    { id: 4, desc: "Plastering 12mm thick", unit: "m²", qty: 200, rate: 180 },
  ]);
  // Editable unit rates
  const [rates, setRates] = useState({
    M20: 6000,
    M25: 7200,
    M30: 8500,
    M35: 9800,
    steel: 80, // ₹/kg
    formwork: 350, // ₹/m²
  });

  const vol = length * width * height;
  const concCost = vol * 0.98 * (rates[grade] || 7200);
  const steelWt = (vol * 7850 * steelPct) / 100;
  const steelCost = steelWt * rates.steel;
  const formCost = 2 * (length * height + width * height) * rates.formwork;
  const boqTotal = boqItems.reduce((s, i) => s + i.qty * i.rate, 0);

  const addItem = () =>
    setBoqItems((prev) => [
      ...prev,
      { id: Date.now(), desc: "New Item", unit: "m³", qty: 1, rate: 1000 },
    ]);
  const updItem = (id, k, v) =>
    setBoqItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, [k]: k === "qty" || k === "rate" ? parseFloat(v) || 0 : v }
          : i,
      ),
    );
  const remItem = (id) =>
    setBoqItems((prev) => prev.filter((i) => i.id !== id));
  const updRate = (k, v) =>
    setRates((r) => ({ ...r, [k]: parseFloat(v) || 0 }));

  useEffect(() => {
    onDataChange?.({ length, width, height, grade, steelPct, boqItems });
  }, [length, width, height, grade, steelPct, boqItems]);

  const cellStyle = {
    padding: "8px 10px",
    fontSize: 12,
    borderBottom: `1px solid ${C.border}`,
    fontFamily: F.mono,
  };
  const headStyle = {
    padding: "8px 10px",
    fontSize: 11,
    color: C.inkLight,
    fontFamily: F.mono,
    fontWeight: 700,
    borderBottom: `2px solid ${C.border}`,
    textAlign: "left",
  };
  const inlineInput = {
    background: "transparent",
    border: "none",
    outline: "none",
    fontSize: 12,
    fontFamily: F.mono,
    color: C.ink,
    width: "100%",
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[
          ["estimator", "Concrete Estimator"],
          ["boq", "Bill of Quantities"],
          ["rates", "Rate Analysis"],
        ].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setTab(v)}
            style={{
              padding: "7px 18px",
              borderRadius: 7,
              border: `1.5px solid ${tab === v ? C.green : C.border}`,
              background: tab === v ? C.greenLight : C.bgAlt,
              color: tab === v ? C.green : C.inkMid,
              cursor: "pointer",
              fontSize: 12.5,
              fontFamily: F.sans,
              fontWeight: 600,
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === "estimator" && (
        <TwoCol
          left={
            <>
              <Card>
                <SectionTitle>Element Dimensions</SectionTitle>
                <Inp
                  label="Length (m)"
                  value={length}
                  onChange={setLength}
                  min={0.1}
                  step={0.5}
                />
                <Inp
                  label="Width (m)"
                  value={width}
                  onChange={setWidth}
                  min={0.1}
                  step={0.5}
                />
                <Inp
                  label="Height / Depth (m)"
                  value={height}
                  onChange={setHeight}
                  min={0.1}
                  step={0.1}
                />
                <Inp
                  label="Concrete Grade"
                  value={grade}
                  onChange={setGrade}
                  options={["M20", "M25", "M30", "M35"]}
                />
                <Inp
                  label="Steel % (by volume)"
                  value={steelPct}
                  onChange={setSteelPct}
                  min={0.5}
                  max={6}
                  step={0.1}
                />
              </Card>
              <Card>
                <SectionTitle>Editable Unit Rates</SectionTitle>
                {[
                  ["M20 Rate (₹/m³)", "M20"],
                  ["M25 Rate (₹/m³)", "M25"],
                  ["M30 Rate (₹/m³)", "M30"],
                  ["M35 Rate (₹/m³)", "M35"],
                  ["Steel Rate (₹/kg)", "steel"],
                  ["Formwork Rate (₹/m²)", "formwork"],
                ].map(([label, key]) => (
                  <Inp
                    key={key}
                    label={label}
                    value={rates[key]}
                    onChange={(v) => updRate(key, v)}
                    min={0}
                    step={100}
                    small
                  />
                ))}
              </Card>
            </>
          }
          right={
            <>
              <Card>
                <StatGrid cols={3}>
                  <StatBox
                    label="Total Volume"
                    value={vol.toFixed(2)}
                    unit="m³"
                    color={C.green}
                  />
                  <StatBox
                    label="Concrete Vol."
                    value={(vol * 0.98).toFixed(2)}
                    unit="m³"
                    color={C.blue}
                  />
                  <StatBox
                    label="Steel Weight"
                    value={(steelWt / 1000).toFixed(2)}
                    unit="MT"
                    color={C.orange}
                  />
                </StatGrid>
              </Card>
              <Card>
                <SectionTitle>Cost Breakdown</SectionTitle>
                {[
                  [`Concrete (${grade})`, concCost],
                  ["Reinforcement Steel", steelCost],
                  ["Formwork", formCost],
                ].map(([l, v]) => (
                  <div
                    key={l}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "11px 0",
                      borderBottom: `1px solid ${C.border}`,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        color: C.inkMid,
                        fontFamily: F.sans,
                      }}
                    >
                      {l}
                    </span>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: C.ink,
                        fontFamily: F.mono,
                      }}
                    >
                      ₹ {Math.round(v).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingTop: 14,
                  }}
                >
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      fontFamily: F.sans,
                    }}
                  >
                    Total Estimated Cost
                  </span>
                  <span
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: C.green,
                      fontFamily: F.mono,
                    }}
                  >
                    ₹{" "}
                    {Math.round(concCost + steelCost + formCost).toLocaleString(
                      "en-IN",
                    )}
                  </span>
                </div>
              </Card>
            </>
          }
        />
      )}

      {tab === "boq" && (
        <Card>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <SectionTitle style={{ margin: 0 }}>
              Bill of Quantities
            </SectionTitle>
            <button
              onClick={addItem}
              style={{
                padding: "5px 14px",
                borderRadius: 7,
                border: `1.5px solid ${C.green}`,
                background: C.greenLight,
                color: C.green,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 700,
                fontFamily: F.sans,
              }}
            >
              + Add Item
            </button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {[
                    "#",
                    "Description",
                    "Unit",
                    "Qty",
                    "Rate (₹)",
                    "Amount (₹)",
                    "",
                  ].map((h, i) => (
                    <th
                      key={h}
                      style={{
                        ...headStyle,
                        textAlign: i >= 3 && i <= 5 ? "right" : "left",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {boqItems.map((item, idx) => (
                  <tr
                    key={item.id}
                    style={{ background: idx % 2 === 0 ? C.bgAlt : C.bgCard }}
                  >
                    <td style={{ ...cellStyle, color: C.inkLight, width: 32 }}>
                      {idx + 1}
                    </td>
                    <td style={cellStyle}>
                      <input
                        style={inlineInput}
                        value={item.desc}
                        onChange={(e) =>
                          updItem(item.id, "desc", e.target.value)
                        }
                      />
                    </td>
                    <td style={{ ...cellStyle, width: 70 }}>
                      <select
                        style={{ ...inlineInput, width: 60 }}
                        value={item.unit}
                        onChange={(e) =>
                          updItem(item.id, "unit", e.target.value)
                        }
                      >
                        {["m³", "m²", "m", "kg", "MT", "nos", "LS"].map((u) => (
                          <option key={u}>{u}</option>
                        ))}
                      </select>
                    </td>
                    {["qty", "rate"].map((k) => (
                      <td
                        key={k}
                        style={{ ...cellStyle, textAlign: "right", width: 90 }}
                      >
                        <input
                          style={{ ...inlineInput, textAlign: "right" }}
                          type="number"
                          value={item[k]}
                          onChange={(e) => updItem(item.id, k, e.target.value)}
                        />
                      </td>
                    ))}
                    <td
                      style={{
                        ...cellStyle,
                        textAlign: "right",
                        fontWeight: 700,
                        color: C.ink,
                      }}
                    >
                      ₹ {(item.qty * item.rate).toLocaleString("en-IN")}
                    </td>
                    <td style={{ ...cellStyle, width: 32 }}>
                      <button
                        onClick={() => remItem(item.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: C.red,
                          cursor: "pointer",
                          fontSize: 14,
                        }}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: `2px solid ${C.border}` }}>
                  <td
                    colSpan={5}
                    style={{
                      padding: "12px 10px",
                      fontWeight: 700,
                      fontSize: 14,
                      fontFamily: F.sans,
                    }}
                  >
                    Grand Total
                  </td>
                  <td
                    style={{
                      padding: "12px 10px",
                      textAlign: "right",
                      fontWeight: 800,
                      fontSize: 20,
                      color: C.green,
                      fontFamily: F.mono,
                    }}
                  >
                    ₹ {boqTotal.toLocaleString("en-IN")}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}

      {tab === "rates" && (
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          {[
            {
              title: "PCC M20 — per m³",
              items: [
                ["Cement (6.5 bags × ₹380)", 2470],
                ["Sand (0.45 m³ × ₹1200)", 540],
                ["Aggregate (0.9 m³ × ₹900)", 810],
                ["Labour (mason + helper)", 700],
                ["Mixer hire", 200],
                ["Water & misc.", 100],
              ],
            },
            {
              title: "Brick Masonry — per m³",
              items: [
                ["Bricks (500 nos × ₹8)", 4000],
                ["Cement mortar (0.25 m³)", 800],
                ["Skilled mason (0.6 day)", 600],
                ["Helper (1.2 day)", 720],
                ["Scaffolding & misc.", 250],
              ],
            },
            {
              title: "Steel Rebar — per MT",
              items: [
                ["TMT steel IS 1786", 58000],
                ["Binding wire (10 kg)", 600],
                ["Cutting & bending labour", 2000],
                ["Placing & tying labour", 3000],
                ["Transport", 1000],
              ],
            },
            {
              title: "RCC M25 — per m³",
              items: [
                ["Cement (7.5 bags × ₹380)", 2850],
                ["Sand (0.43 m³)", 516],
                ["Coarse aggregate (0.86 m³)", 774],
                ["Steel (2%)", 1200],
                ["Labour & placing", 1000],
                ["Formwork (pro-rata)", 500],
              ],
            },
          ].map(({ title, items }) => {
            const total = items.reduce((s, [, v]) => s + v, 0);
            return (
              <Card key={title}>
                <SectionTitle>{title}</SectionTitle>
                {items.map(([l, v]) => (
                  <div
                    key={l}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "6px 0",
                      borderBottom: `1px solid ${C.border}`,
                      fontSize: 12,
                    }}
                  >
                    <span style={{ color: C.inkMid, fontFamily: F.sans }}>
                      {l}
                    </span>
                    <span style={{ fontFamily: F.mono, fontWeight: 600 }}>
                      ₹{v.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingTop: 10,
                    fontWeight: 700,
                  }}
                >
                  <span style={{ fontSize: 13 }}>Total</span>
                  <span
                    style={{ fontSize: 15, color: C.green, fontFamily: F.mono }}
                  >
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
//  REPORT PAGE
// ═══════════════════════════════════════════════
export function ReportPage({ allData }) {
  const [project, setProject] = useState({
    name: "",
    client: "",
    location: "",
    engineer: "",
    date: new Date().toLocaleDateString("en-IN"),
  });
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const upd = (k, v) => setProject((p) => ({ ...p, [k]: v }));

  const handleExport = async () => {
    setExporting(true);
    try {
      const { exportToExcel } = await import("@utils/excelExport");
      exportToExcel({ project, ...allData });
      setExported(true);
      setTimeout(() => setExported(false), 5000);
    } catch (e) {
      console.error("Export failed:", e);
      alert("Export failed. Ensure xlsx and file-saver are installed.");
    }
    setExporting(false);
  };

  const fieldInput = (label, key, placeholder = "") => (
    <div key={key} style={{ marginBottom: 12 }}>
      <label
        style={{
          display: "block",
          fontSize: 10,
          color: C.inkLight,
          marginBottom: 4,
          fontFamily: F.sans,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </label>
      <input
        style={{
          background: C.bgAlt,
          border: `1.5px solid ${C.border}`,
          borderRadius: 7,
          color: C.ink,
          padding: "8px 12px",
          fontFamily: F.mono,
          fontSize: 13,
          width: "100%",
          outline: "none",
          boxSizing: "border-box",
        }}
        type="text"
        value={project[key]}
        placeholder={placeholder}
        onChange={(e) => upd(key, e.target.value)}
      />
    </div>
  );

  const modules = [
    { id: "beam", label: "Beam Design", code: "IS 456:2000 / IS 800:2007" },
    { id: "column", label: "Column Design", code: "IS 456:2000 / IS 800:2007" },
    { id: "slab", label: "Slab Design", code: "IS 456:2000 Cl. 24" },
    {
      id: "foundation",
      label: "Foundation Design",
      code: "IS 456:2000 / IS 2950 / IS 2911",
    },
    { id: "road", label: "Road Design", code: "IRC 37 / IRC 52 / IRC 73" },
    { id: "bridge", label: "Bridge Loads", code: "IRC:6" },
    { id: "boq", label: "Estimation & BOQ", code: "—" },
  ];

  return (
    <div style={{ maxWidth: 780, margin: "0 auto" }}>
      <div
        style={{
          background: `linear-gradient(135deg, ${C.navy}, #1e293b)`,
          borderRadius: 16,
          padding: "40px 24px",
          textAlign: "center",
          marginBottom: 24,
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1, background: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div
          style={{
            fontFamily: F.sans,
            fontSize: 28,
            fontWeight: 900,
            color: "#f8fafc",
            letterSpacing: "6px",
            textTransform: 'uppercase',
            position: 'relative'
          }}
        >
          Structure Design Report
        </div>
        <div
          style={{
            fontSize: 14,
            color: "#94a3b8",
            marginTop: 8,
            fontFamily: F.mono,
            fontWeight: 500,
            letterSpacing: '1.5px',
            position: 'relative'
          }}
        >
          Engineering Excellence & Structural Integrity
        </div>
        <div
          style={{
            height: '1px',
            width: '60px',
            background: 'rgba(255,255,255,0.2)',
            margin: '16px auto',
            position: 'relative'
          }}
        />
        <div
          style={{
            fontSize: 11,
            color: "#64748b",
            fontFamily: F.mono,
            letterSpacing: '1px',
            position: 'relative'
          }}
        >
          IS 456 · IS 800 · IS 2911 · IRC:6 · IRC:37 · IS 2950
        </div>
      </div>

      <Card>
        <SectionTitle>Project Information</SectionTitle>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0 20px",
          }}
        >
          {fieldInput("Project Name", "name", "e.g. Residential Tower Block A")}
          {fieldInput("Client", "client", "Client or organisation name")}
          {fieldInput("Location", "location", "City, State")}
          {fieldInput(
            "Engineer of Record",
            "engineer",
            "Name & Registration No.",
          )}
          {fieldInput("Report Date", "date")}
        </div>
      </Card>

      <Card>
        <SectionTitle>Modules Included</SectionTitle>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${C.border}` }}>
              {["Module", "Code Reference", "Status"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "8px 12px",
                    textAlign: "left",
                    fontSize: 11,
                    color: C.inkLight,
                    fontFamily: F.mono,
                    letterSpacing: "1px",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modules.map((m, i) => (
              <tr
                key={m.id}
                style={{
                  background: i % 2 === 0 ? C.bgAlt : C.bgCard,
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                <td
                  style={{
                    padding: "10px 12px",
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  {m.label}
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    fontSize: 12,
                    color: C.inkLight,
                    fontFamily: F.mono,
                  }}
                >
                  {m.code}
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <span
                    style={{
                      background: C.greenLight,
                      color: C.green,
                      fontFamily: F.mono,
                      fontSize: 11,
                      padding: "2px 10px",
                      borderRadius: 20,
                      fontWeight: 700,
                    }}
                  >
                    ✓ Included
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card>
        <SectionTitle>Export to Excel</SectionTitle>
        <p
          style={{
            fontSize: 13,
            color: C.inkMid,
            marginBottom: 20,
            lineHeight: 1.8,
            fontFamily: F.sans,
          }}
        >
          Generates a formatted <strong>.xlsx workbook</strong> with one sheet
          per module — inputs, results, code checks, and utilization ratios.
        </p>
        <button
          onClick={handleExport}
          disabled={exporting}
          style={{
            width: "100%",
            padding: "16px 0",
            borderRadius: 10,
            border: "none",
            background: exported ? C.green : exporting ? C.inkLight : C.blue,
            color: "#fff",
            fontSize: 16,
            fontWeight: 700,
            fontFamily: F.sans,
            cursor: exporting ? "wait" : "pointer",
            transition: "background 0.3s",
          }}
        >
          {exporting
            ? "⏳  Generating..."
            : exported
              ? "✓  Downloaded!"
              : "⬇  Export Full Report (.xlsx)"}
        </button>
        {exported && (
          <div
            style={{
              marginTop: 10,
              padding: 10,
              background: C.greenLight,
              borderRadius: 7,
              fontSize: 12,
              color: C.green,
            }}
          >
            ✓ Saved as URBAN-MATRIX_Report_{new Date().toISOString().slice(0, 10)}.xlsx
          </div>
        )}
      </Card>

      <div
        style={{
          background: C.yellowLight,
          border: `1px solid ${C.yellow}40`,
          borderRadius: 10,
          padding: "14px 18px",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 12,
            color: C.inkMid,
            fontFamily: F.sans,
            lineHeight: 1.8,
          }}
        >
          <strong>Disclaimer:</strong> STRUX provides preliminary calculations
          for educational and planning purposes only. All results must be
          independently verified by a licensed structural or civil engineer.
          Full design per applicable IS/IRC standards is mandatory for
          construction.
        </p>
      </div>
    </div>
  );
}
