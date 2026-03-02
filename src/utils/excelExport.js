import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

/* ── STYLE HELPERS ──────────────────────────────────────────── */
const STYLES = {
  header: { font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 12 }, fill: { fgColor: { rgb: '1A56DB' } }, alignment: { horizontal: 'center', vertical: 'center', wrapText: true }, border: borders() },
  subHeader: { font: { bold: true, sz: 11 }, fill: { fgColor: { rgb: 'E8F0FE' } }, alignment: { horizontal: 'left' }, border: borders() },
  title: { font: { bold: true, sz: 14, color: { rgb: '1C1C2E' } }, fill: { fgColor: { rgb: 'F5F3EE' } }, alignment: { horizontal: 'center' } },
  label: { font: { sz: 10, color: { rgb: '4A4A6A' } }, border: borders('thin') },
  value: { font: { bold: true, sz: 11 }, alignment: { horizontal: 'right' }, border: borders('thin') },
  pass: { font: { bold: true, color: { rgb: '059669' } }, fill: { fgColor: { rgb: 'ECFDF5' } }, alignment: { horizontal: 'center' }, border: borders('thin') },
  fail: { font: { bold: true, color: { rgb: 'DC2626' } }, fill: { fgColor: { rgb: 'FEF2F2' } }, alignment: { horizontal: 'center' }, border: borders('thin') },
  warning: { font: { sz: 10, color: { rgb: 'A16207' } }, fill: { fgColor: { rgb: 'FEFCE8' } } },
  sectionBg: { fill: { fgColor: { rgb: 'F0EDE6' } }, font: { bold: true, sz: 11 } },
}

function borders(style = 'medium') {
  const b = { style, color: { rgb: 'DDD8CE' } }
  return { top: b, bottom: b, left: b, right: b }
}

function cell(value, style = {}) {
  return { v: value, t: typeof value === 'number' ? 'n' : 's', s: style }
}

function numCell(value, style = {}) {
  return { v: typeof value === 'string' ? parseFloat(value) || 0 : value, t: 'n', s: style }
}

/* ── WORKSHEET BUILDER ──────────────────────────────────────── */
class SheetBuilder {
  constructor() {
    this.data = {}
    this.merges = []
    this.colWidths = []
    this.row = 1
  }

  setCell(col, row, val, style) {
    this.data[`${col}${row}`] = typeof val === 'number' ? numCell(val, style) : cell(val, style)
  }

  addMerge(s, e) { this.merges.push({ s, e }) }

  addTitle(text, cols = 6) {
    this.data[`A${this.row}`] = cell(text, STYLES.title)
    this.addMerge({ r: this.row - 1, c: 0 }, { r: this.row - 1, c: cols - 1 })
    this.row++
  }

  addSectionHeader(text, cols = 6) {
    this.row++
    this.data[`A${this.row}`] = cell(text, STYLES.header)
    this.addMerge({ r: this.row - 1, c: 0 }, { r: this.row - 1, c: cols - 1 })
    this.row++
  }

  addRow(label, value, unit = '', pass = null) {
    this.data[`A${this.row}`] = cell(label, STYLES.label)
    this.addMerge({ r: this.row - 1, c: 0 }, { r: this.row - 1, c: 2 })
    this.data[`D${this.row}`] = typeof value === 'number' ? numCell(value, STYLES.value) : cell(String(value), STYLES.value)
    this.data[`E${this.row}`] = cell(unit, STYLES.label)
    if (pass !== null) {
      this.data[`F${this.row}`] = cell(pass ? '✓ PASS' : '✗ FAIL', pass ? STYLES.pass : STYLES.fail)
    }
    this.row++
  }

  addBlankRow() { this.row++ }

  addUtilRow(label, pct) {
    const p = parseFloat(pct) || 0
    const color = p <= 70 ? '059669' : p <= 100 ? 'A16207' : 'DC2626'
    this.data[`A${this.row}`] = cell(label, STYLES.label)
    this.addMerge({ r: this.row - 1, c: 0 }, { r: this.row - 1, c: 3 })
    this.data[`E${this.row}`] = cell(`${pct}%`, { font: { bold: true, color: { rgb: color } }, alignment: { horizontal: 'center' } })
    this.row++
  }

  build(sheetName) {
    const ws = { ...this.data }
    if (this.merges.length) ws['!merges'] = this.merges
    ws['!cols'] = this.colWidths.length
      ? this.colWidths
      : [{ wch: 28 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 12 }]
    const maxRow = this.row
    ws['!ref'] = `A1:F${maxRow}`
    return ws
  }
}

/* ── MODULE SHEET GENERATORS ────────────────────────────────── */
function buildCoverSheet(projectInfo) {
  const sb = new SheetBuilder()
  sb.data['A1'] = cell('', {})
  sb.row = 2
  sb.addTitle('STRUX — Civil & Structural Engineering Design Report', 6)
  sb.addBlankRow()

  const fields = [
    ['Project Name', projectInfo.name || '—'],
    ['Client', projectInfo.client || '—'],
    ['Location', projectInfo.location || '—'],
    ['Engineer', projectInfo.engineer || '—'],
    ['Date', projectInfo.date || new Date().toLocaleDateString('en-IN')],
    ['Software', 'STRUX v2.0'],
    ['Codes', 'IS 456:2000 · IS 800:2007 · IRC:6 · IRC:37 · IS 2950'],
  ]
  sb.addSectionHeader('PROJECT INFORMATION')
  fields.forEach(([l, v]) => sb.addRow(l, v))

  sb.addBlankRow()
  sb.addSectionHeader('MODULES INCLUDED IN THIS REPORT')
  ;['Beam Design', 'Column Design', 'Slab Design', 'Foundation Design', 'Road Design', 'Bridge Loads', 'Estimation & BOQ'].forEach(m => sb.addRow(m, 'Included', ''))

  sb.addBlankRow()
  sb.data[`A${sb.row}`] = cell('DISCLAIMER: This report is for preliminary design and educational purposes only. All results must be verified by a licensed structural/civil engineer.', STYLES.warning)
  sb.addMerge({ r: sb.row - 1, c: 0 }, { r: sb.row - 1, c: 5 })

  return sb.build('Cover')
}

function buildBeamSheet(data) {
  const sb = new SheetBuilder()
  sb.addTitle('BEAM DESIGN — IS 456:2000 / IS 800:2007')
  sb.addSectionHeader('INPUT PARAMETERS')
  sb.addRow('Span', data.span, 'm')
  sb.addRow('Support Condition', data.support)
  sb.addRow('Material', data.material)
  sb.addRow('Width (b)', data.b, 'mm')
  sb.addRow('Depth (d)', data.d, 'mm')

  sb.addSectionHeader('APPLIED LOADS')
  data.loads.forEach((l, i) => {
    if (l.type === 'udl') sb.addRow(`Load ${i + 1} — UDL`, l.w, 'kN/m')
    if (l.type === 'point') sb.addRow(`Load ${i + 1} — Point @ ${l.pos}m`, l.p, 'kN')
  })

  sb.addSectionHeader('ANALYSIS RESULTS')
  sb.addRow('Reaction at A (Ra)', parseFloat(data.result?.Ra?.toFixed(2) || 0), 'kN')
  sb.addRow('Reaction at B (Rb)', parseFloat(data.result?.Rb?.toFixed(2) || 0), 'kN')
  sb.addRow('Max Shear Force', parseFloat(data.result?.maxV?.toFixed(2) || 0), 'kN')
  sb.addRow('Max Bending Moment', parseFloat(data.result?.maxM?.toFixed(2) || 0), 'kNm')

  sb.addSectionHeader('CODE COMPLIANCE CHECK')
  sb.addRow('Design Code', data.check?.code || '—')
  sb.addRow('Applied Mu', parseFloat(data.result?.maxM?.toFixed(2) || 0), 'kNm')
  sb.addRow('Section Capacity', parseFloat(data.check?.Mulim || 0), 'kNm')
  sb.addUtilRow('Moment Utilization', data.check?.util || '0')
  sb.addRow('Overall Result', data.check?.pass ? 'PASS' : 'FAIL', '', data.check?.pass)

  return sb.build('Beam Design')
}

function buildColumnSheet(data) {
  const sb = new SheetBuilder()
  sb.addTitle('COLUMN DESIGN — IS 456:2000 / IS 800:2007')
  sb.addSectionHeader('INPUT PARAMETERS')
  sb.addRow('Material', data.material)
  sb.addRow('Width (b)', data.b, 'mm')
  sb.addRow('Depth (d)', data.d, 'mm')
  sb.addRow('Effective Length (Le)', data.Le, 'm')
  sb.addRow('Axial Load (P)', data.P, 'kN')
  sb.addRow('Moment Mx', data.Mx, 'kNm')
  sb.addRow('Moment My', data.My, 'kNm')

  sb.addSectionHeader('ANALYSIS RESULTS')
  sb.addRow('Axial Capacity', parseFloat(data.result?.Pu_cap || 0), 'kN')
  sb.addRow('Slenderness Ratio (λ)', parseFloat(data.result?.lambda || 0), '')
  sb.addRow('Column Type', data.result?.isSlender ? 'SLENDER' : 'SHORT')
  sb.addRow('Design Code', data.result?.code || '—')

  sb.addSectionHeader('CODE COMPLIANCE CHECK')
  sb.addUtilRow('Axial Load Utilization', data.result?.util || '0')
  sb.addRow('Overall Result', data.result?.pass ? 'PASS' : 'FAIL', '', data.result?.pass)
  if (data.result?.isSlender) sb.addRow('Warning', 'Additional moment check required (IS 456 Cl. 39.7)')

  return sb.build('Column Design')
}

function buildSlabSheet(data) {
  const sb = new SheetBuilder()
  sb.addTitle('SLAB DESIGN — IS 456:2000 Clause 24')
  sb.addSectionHeader('INPUT PARAMETERS')
  sb.addRow('Short Span (Lx)', data.Lx, 'm')
  sb.addRow('Long Span (Ly)', data.Ly, 'm')
  sb.addRow('Dead Load (wDL)', data.wDL, 'kN/m²')
  sb.addRow('Live Load (wLL)', data.wLL, 'kN/m²')
  sb.addRow('Total Load (w)', data.wDL + data.wLL, 'kN/m²')
  sb.addRow('Thickness', data.thickness, 'mm')

  sb.addSectionHeader('ANALYSIS RESULTS')
  sb.addRow('Span Ratio (Ly/Lx)', parseFloat(data.result?.r || 0), '')
  sb.addRow('Slab Type', data.result?.isTwoWay ? 'Two-Way' : 'One-Way')
  sb.addRow('Moment Mx', parseFloat(data.result?.Mx || 0), 'kNm/m')
  sb.addRow('Moment My', parseFloat(data.result?.My || 0), 'kNm/m')
  sb.addRow('Limiting Moment (Mulim)', parseFloat(data.result?.Mulim || 0), 'kNm/m')

  sb.addSectionHeader('CODE COMPLIANCE CHECK')
  sb.addUtilRow('Moment Utilization (Mx)', data.result?.util || '0')
  sb.addRow('Overall Result', data.result?.pass ? 'PASS' : 'FAIL', '', data.result?.pass)

  return sb.build('Slab Design')
}

function buildFoundationSheet(data) {
  const sb = new SheetBuilder()
  sb.addTitle('FOUNDATION DESIGN — IS 456:2000 / IS 2950')
  sb.addSectionHeader('INPUT PARAMETERS')
  sb.addRow('Foundation Type', data.type)
  sb.addRow('Column Load (P)', data.P, 'kN')
  sb.addRow('Moment (Mx)', data.Mx, 'kNm')
  sb.addRow('Safe Bearing Capacity', data.sbc, 'kN/m²')
  sb.addRow('Column Size', `${data.colB}×${data.colD}`, 'mm')
  sb.addRow('Concrete Grade (fck)', data.fck, 'MPa')

  sb.addSectionHeader('FOOTING DIMENSIONS')
  sb.addRow('Required Area', parseFloat(data.result?.Areq || 0), 'm²')
  sb.addRow('Footing Size (B)', parseFloat(data.result?.B || 0), 'm')
  sb.addRow('Footing Size (L)', parseFloat(data.result?.L || 0), 'm')
  sb.addRow('Gross Pressure', parseFloat(data.result?.qgross || 0), 'kN/m²')
  sb.addRow('Net Pressure', parseFloat(data.result?.qnet || 0), 'kN/m²')

  sb.addSectionHeader('CODE COMPLIANCE CHECK')
  sb.addUtilRow('Bearing Pressure Utilization', data.result?.bearingUtil || '0')
  sb.addUtilRow('Moment Utilization', data.result?.momentUtil || '0')
  const overallPass = data.result?.passSBC && data.result?.passM
  sb.addRow('Overall Result', overallPass ? 'PASS' : 'FAIL', '', overallPass)

  return sb.build('Foundation Design')
}

function buildRoadSheet(data) {
  const sb = new SheetBuilder()
  sb.addTitle('ROAD DESIGN — IRC 37 / IRC 52 / IRC 73')

  sb.addSectionHeader('HORIZONTAL CURVE (IRC 73)')
  sb.addRow('Design Speed (V)', data.V, 'km/h')
  sb.addRow('Radius (R)', data.R, 'm')
  sb.addRow('Deflection Angle (Δ)', data.delta, '°')
  sb.addRow('Tangent Length (T)', parseFloat(data.hCurve?.T || 0), 'm')
  sb.addRow('Curve Length (L)', parseFloat(data.hCurve?.L || 0), 'm')
  sb.addRow('Superelevation (e)', parseFloat(data.hCurve?.e || 0), '%')
  sb.addRow('Stopping Sight Distance', parseFloat(data.hCurve?.SD || 0), 'm')
  sb.addRow('Min Radius Check', data.hCurve?.passRadius ? 'PASS' : 'FAIL', '', data.hCurve?.passRadius)

  sb.addSectionHeader('VERTICAL CURVE (IRC 52)')
  sb.addRow('Grade G1', data.g1, '%')
  sb.addRow('Grade G2', data.g2, '%')
  sb.addRow('Curve Length (L)', data.Lvc, 'm')
  sb.addRow('Algebraic Difference (A)', parseFloat(data.vCurve?.A || 0), '%')
  sb.addRow('K-Value', parseFloat(data.vCurve?.K || 0), 'm/%')
  sb.addRow('Min K Required', parseFloat(data.vCurve?.Kmin || 0), 'm/%')
  sb.addRow('Vertical Curve Check', data.vCurve?.pass ? 'PASS' : 'FAIL', '', data.vCurve?.pass)

  sb.addSectionHeader('PAVEMENT DESIGN (IRC 37)')
  sb.addRow('Traffic Category', data.traffic)
  sb.addRow('Subgrade CBR', data.CBR, '%')
  sb.addRow('Bituminous Concrete (BC)', data.pavement?.BCThk, 'mm')
  sb.addRow('Dense Bitumen Macadam', data.pavement?.DBMThk, 'mm')
  sb.addRow('Granular Base', data.pavement?.GBThk, 'mm')
  sb.addRow('Sub-Grade Base', data.pavement?.SGBThk, 'mm')
  sb.addRow('Total Pavement Thickness', data.pavement?.total, 'mm')

  return sb.build('Road Design')
}

function buildBOQSheet(data) {
  const sb = new SheetBuilder()
  sb.addTitle('ESTIMATION & BILL OF QUANTITIES')

  sb.addSectionHeader('CONCRETE ELEMENT ESTIMATE')
  sb.addRow('Length', data.length, 'm')
  sb.addRow('Width', data.width, 'm')
  sb.addRow('Height/Depth', data.height, 'm')
  sb.addRow('Volume', data.length * data.width * data.height, 'm³')
  sb.addRow('Concrete Grade', data.grade)
  sb.addRow('Steel %', data.steelPct, '%')

  sb.addSectionHeader('BILL OF QUANTITIES')
  // BOQ table header
  const hRow = sb.row
  ;['#', 'Description', 'Unit', 'Qty', 'Rate (₹)', 'Amount (₹)'].forEach((h, i) => {
    const cols = ['A', 'B', 'C', 'D', 'E', 'F']
    sb.data[`${cols[i]}${hRow}`] = cell(h, STYLES.subHeader)
  })
  sb.row++

  let total = 0
  ;(data.boqItems || []).forEach((item, idx) => {
    const amount = item.qty * item.rate
    total += amount
    const cols = ['A', 'B', 'C', 'D', 'E', 'F']
    const rowVals = [idx + 1, item.desc, item.unit, item.qty, item.rate, amount]
    rowVals.forEach((v, i) => {
      sb.data[`${cols[i]}${sb.row}`] = typeof v === 'number' ? numCell(v, STYLES.value) : cell(String(v), STYLES.label)
    })
    sb.row++
  })

  sb.row++
  sb.data[`A${sb.row}`] = cell('Grand Total', { font: { bold: true, sz: 12 }, fill: { fgColor: { rgb: 'ECFDF5' } } })
  sb.addMerge({ r: sb.row - 1, c: 0 }, { r: sb.row - 1, c: 4 })
  sb.data[`F${sb.row}`] = numCell(total, { font: { bold: true, sz: 13, color: { rgb: '059669' } }, alignment: { horizontal: 'right' } })
  sb.row++

  return sb.build('Estimation & BOQ')
}

/* ── MAIN EXPORT FUNCTION ───────────────────────────────────── */
export function exportToExcel(allModuleData) {
  const wb = XLSX.utils.book_new()

  // Cover sheet
  const coverWs = buildCoverSheet(allModuleData.project || {})
  XLSX.utils.book_append_sheet(wb, coverWs, 'Cover')

  // Module sheets
  if (allModuleData.beam) XLSX.utils.book_append_sheet(wb, buildBeamSheet(allModuleData.beam), 'Beam Design')
  if (allModuleData.column) XLSX.utils.book_append_sheet(wb, buildColumnSheet(allModuleData.column), 'Column Design')
  if (allModuleData.slab) XLSX.utils.book_append_sheet(wb, buildSlabSheet(allModuleData.slab), 'Slab Design')
  if (allModuleData.foundation) XLSX.utils.book_append_sheet(wb, buildFoundationSheet(allModuleData.foundation), 'Foundation')
  if (allModuleData.road) XLSX.utils.book_append_sheet(wb, buildRoadSheet(allModuleData.road), 'Road Design')
  if (allModuleData.boq) XLSX.utils.book_append_sheet(wb, buildBOQSheet(allModuleData.boq), 'BOQ')

  // Write and download
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array', cellStyles: true })
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const date = new Date().toISOString().slice(0, 10)
  saveAs(blob, `STRUX_Report_${date}.xlsx`)
}