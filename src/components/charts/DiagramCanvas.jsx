import { useRef, useEffect } from 'react'
import { C, F } from '@styles/tokens'

export function DiagramCanvas({ x, values, span, color, label, unit }) {
  const ref = useRef(null)

  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const W   = cv.offsetWidth || 700
    const H   = 150

    cv.width  = W * dpr
    cv.height = H * dpr
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, W, H)

    const pad  = { l: 50, r: 14, t: 22, b: 28 }
    const pw   = W - pad.l - pad.r
    const ph   = H - pad.t - pad.b
    const maxV = Math.max(...values.map(Math.abs), 0.01)
    const tx   = v => pad.l + (v / span) * pw
    const ty   = v => pad.t + ph / 2 - (v / maxV) * (ph / 2 - 5)

    // ── Soft background ──
    ctx.fillStyle = '#f7f8f6'
    ctx.beginPath()
    ctx.roundRect(pad.l - 4, pad.t - 4, pw + 8, ph + 8, 4)
    ctx.fill()

    // ── Grid lines ──
    ctx.strokeStyle = '#e4e8e2'
    ctx.lineWidth   = 1
    for (let i = 0; i <= 4; i++) {
      const gy = pad.t + (i / 4) * ph
      ctx.beginPath(); ctx.moveTo(pad.l, gy); ctx.lineTo(W - pad.r, gy); ctx.stroke()
    }
    for (let i = 1; i <= 3; i++) {
      const gx = pad.l + (i / 4) * pw
      ctx.beginPath(); ctx.moveTo(gx, pad.t); ctx.lineTo(gx, pad.t + ph); ctx.stroke()
    }

    // ── Zero line ──
    ctx.strokeStyle = '#b8c4b9'
    ctx.lineWidth   = 1
    ctx.setLineDash([4, 4])
    ctx.beginPath(); ctx.moveTo(pad.l, ty(0)); ctx.lineTo(W - pad.r, ty(0)); ctx.stroke()
    ctx.setLineDash([])

    // ── Filled area ──
    ctx.beginPath()
    ctx.moveTo(tx(x[0]), ty(0))
    x.forEach((xi, i) => ctx.lineTo(tx(xi), ty(values[i])))
    ctx.lineTo(tx(x[x.length - 1]), ty(0))
    ctx.closePath()
    const grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + ph)
    grad.addColorStop(0, color + '30')
    grad.addColorStop(0.5, color + '12')
    grad.addColorStop(1, color + '04')
    ctx.fillStyle = grad
    ctx.fill()

    // ── Curve line ──
    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.lineWidth   = 2
    ctx.lineJoin    = 'round'
    x.forEach((xi, i) => i === 0 ? ctx.moveTo(tx(xi), ty(values[i])) : ctx.lineTo(tx(xi), ty(values[i])))
    ctx.stroke()

    // ── Max dot ──
    const maxIdx = values.indexOf(Math.max(...values))
    ctx.fillStyle = color
    ctx.beginPath(); ctx.arc(tx(x[maxIdx]), ty(values[maxIdx]), 4, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.beginPath(); ctx.arc(tx(x[maxIdx]), ty(values[maxIdx]), 2, 0, Math.PI * 2); ctx.fill()

    // Max label
    ctx.font      = `500 10px DM Mono, monospace`
    ctx.fillStyle = color
    ctx.textAlign = 'left'
    const lx = Math.min(tx(x[maxIdx]) + 7, W - pad.r - 65)
    ctx.fillText(`${values[maxIdx].toFixed(1)} ${unit}`, lx, ty(values[maxIdx]) - 5)

    // Min (negative)
    const minVal = Math.min(...values)
    if (minVal < -0.5) {
      const minIdx = values.indexOf(minVal)
      ctx.fillStyle = C.red
      ctx.fillText(`${values[minIdx].toFixed(1)} ${unit}`, tx(x[minIdx]) + 7, ty(values[minIdx]) + 14)
    }

    // ── Y-axis labels ──
    ctx.fillStyle = C.inkLight
    ctx.font      = `10px DM Mono, monospace`
    ctx.textAlign = 'right'
    ctx.fillText(`+${maxV.toFixed(1)}`, pad.l - 5, pad.t + 9)
    ctx.fillText('0', pad.l - 5, ty(0) + 4)
    ctx.fillText(`-${maxV.toFixed(1)}`, pad.l - 5, pad.t + ph - 2)

    // ── X-axis labels ──
    ctx.textAlign = 'center'
    ;[0, span / 4, span / 2, (3 * span) / 4, span].forEach(v => {
      ctx.fillText(`${v.toFixed(1)}m`, tx(v), pad.t + ph + 17)
    })

    // ── Diagram label ──
    ctx.fillStyle  = C.inkLight
    ctx.font       = `700 9.5px Plus Jakarta Sans, sans-serif`
    ctx.textAlign  = 'left'
    ctx.fillText(label.toUpperCase(), pad.l, 14)
  }, [x, values, span, color, label, unit])

  return (
    <canvas
      ref={ref}
      style={{
        width:        '100%',
        height:       150,
        display:      'block',
        borderRadius: 6,
        border:       `1px solid ${C.border}`,
      }}
    />
  )
}