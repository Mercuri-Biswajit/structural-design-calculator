import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { C, F } from '@styles/tokens'

export function DiagramCanvas({ x, values, span, color, label, unit }) {
  const H = 150
  const pad = { l: 60, r: 24, t: 22, b: 28 }

  // Because SVG coordinates scale automatically with viewBox, we use a fixed internal width
  const intW = 700 
  const pw = intW - pad.l - pad.r
  const ph = H - pad.t - pad.b

  const maxV = Math.max(...values.map(Math.abs), 0.01)
  const tx = v => pad.l + (v / span) * pw
  const ty = v => pad.t + ph / 2 - (v / maxV) * (ph / 2 - 5)

  // Compute SVG Path data
  const { pathD, areaD, maxIdx, minVal, minIdx } = useMemo(() => {
    if (!x.length) return { pathD: '', areaD: '', maxIdx: 0, minVal: 0, minIdx: 0 }

    let pathStr = `M ${tx(x[0])} ${ty(values[0])}`
    for (let i = 1; i < x.length; i++) {
      pathStr += ` L ${tx(x[i])} ${ty(values[i])}`
    }

    let aStr = `M ${tx(x[0])} ${ty(0)} L ${tx(x[0])} ${ty(values[0])}`
    for (let i = 1; i < x.length; i++) {
        aStr += ` L ${tx(x[i])} ${ty(values[i])}`
    }
    aStr += ` L ${tx(x[x.length - 1])} ${ty(0)} Z`

    const maxI = values.indexOf(Math.max(...values))
    const minV = Math.min(...values)
    const minI = values.indexOf(minV)

    return { pathD: pathStr, areaD: aStr, maxIdx: maxI, minVal: minV, minIdx: minI }
  }, [x, values, span, tx, ty])

  const lx = Math.min(tx(x[maxIdx]) + 7, intW - pad.r - 65)

  return (
    <div style={{ width: '100%', height: H, background: '#f4f7fb', borderRadius: 6, border: `1px solid ${C.border}`, overflow: 'hidden', position: 'relative' }}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${intW} ${H}`}
        preserveAspectRatio="none"
        style={{ display: 'block' }}
      >
        <defs>
          <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="50%" stopColor={color} stopOpacity="0.1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map(i => {
          const gy = pad.t + (i / 4) * ph
          return <line key={`h${i}`} x1={pad.l} y1={gy} x2={intW - pad.r} y2={gy} stroke="#e0e8f0" strokeWidth="1" />
        })}
        {[1, 2, 3].map(i => {
          const gx = pad.l + (i / 4) * pw
          return <line key={`v${i}`} x1={gx} y1={pad.t} x2={gx} y2={pad.t + ph} stroke="#e0e8f0" strokeWidth="1" />
        })}

        {/* Zero line */}
        <line x1={pad.l} y1={ty(0)} x2={intW - pad.r} y2={ty(0)} stroke="#b8c8d8" strokeWidth="1" strokeDasharray="4,4" />

        {/* Filled Area */}
        <motion.path
          d={areaD}
          fill={`url(#grad-${label})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />

        {/* Animated Curve */}
        <motion.path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />

        {/* Max Dot (Animated Fade) */}
        <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.4 }}
        >
            <circle cx={tx(x[maxIdx])} cy={ty(values[maxIdx])} r="4.5" fill={color} />
            <circle cx={tx(x[maxIdx])} cy={ty(values[maxIdx])} r="2.5" fill="#fff" />
        </motion.g>

      </svg>

      {/* HTML Overlays (to keep text crisp across scalable SVG) */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', fontFamily: F.mono }}>
        
        {/* Max Label */}
        <motion.div
           initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.1 }}
           style={{ position: 'absolute', left: `${(lx / intW) * 100}%`, top: ty(values[maxIdx]) - 18, color: color, fontSize: 11, fontWeight: 700 }}
        >
          {values[maxIdx].toFixed(1)} {unit}
        </motion.div>

        {/* Min (negative) Label */}
        {minVal < -0.5 && (
            <motion.div
               initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.1 }}
               style={{ position: 'absolute', left: `${((tx(x[minIdx]) + 7) / intW) * 100}%`, top: ty(values[minIdx]) + 8, color: C.red, fontSize: 11, fontWeight: 700 }}
            >
              {values[minIdx].toFixed(1)} {unit}
            </motion.div>
        )}

        {/* Y-axis labels */}
        <div style={{ position: 'absolute', left: 4, width: pad.l - 12, textAlign: 'right', top: pad.t + 1, fontSize: 11, color: C.inkLight, fontWeight: 600 }}>+{maxV.toFixed(1)}</div>
        <div style={{ position: 'absolute', left: 4, width: pad.l - 12, textAlign: 'right', top: ty(0) - 6, fontSize: 11, color: C.inkLight, fontWeight: 600 }}>0</div>
        <div style={{ position: 'absolute', left: 4, width: pad.l - 12, textAlign: 'right', top: pad.t + ph - 11, fontSize: 11, color: C.inkLight, fontWeight: 600 }}>-{maxV.toFixed(1)}</div>

        {/* X-axis labels */}
        {[0, span / 4, span / 2, (3 * span) / 4, span].map((v, i) => (
            <div key={i} style={{ position: 'absolute', left: `${(tx(v) / intW) * 100}%`, top: pad.t + ph + 8, transform: 'translateX(-50%)', fontSize: 11, color: C.inkLight, textAlign: 'center', fontWeight: 600 }}>
                {v.toFixed(1)}m
            </div>
        ))}

        {/* Diagram Label */}
        <div style={{ position: 'absolute', left: pad.l, top: 4, fontSize: 10, fontWeight: 800, fontFamily: F.sans, color: C.inkMid }}>
            {label.toUpperCase()}
        </div>
      </div>
    </div>
  )
}