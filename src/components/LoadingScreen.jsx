import { useEffect, useState } from 'react'

const STAGES = [
  { label: 'Initializing engines…',   pct: 18 },
  { label: 'Loading IS 456 tables…',   pct: 36 },
  { label: 'Calibrating IRC codes…',   pct: 58 },
  { label: 'Building design suite…',   pct: 80 },
  { label: 'Ready.',                   pct: 100 },
]

export default function LoadingScreen({ onComplete }) {
  const [stage,    setStage]    = useState(0)
  const [progress, setProgress] = useState(0)
  const [fadeOut,  setFadeOut]  = useState(false)

  useEffect(() => {
    let idx = 0
    const advance = () => {
      if (idx >= STAGES.length - 1) {
        setTimeout(() => { setFadeOut(true); setTimeout(onComplete, 500) }, 350)
        return
      }
      idx++
      setStage(idx)
      setProgress(STAGES[idx].pct)
      setTimeout(advance, 370)
    }
    const t = setTimeout(() => { setProgress(STAGES[0].pct); setTimeout(advance, 370) }, 150)
    return () => clearTimeout(t)
  }, [onComplete])

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:9999,
      background:'#f5f7fa',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      transition:'opacity 0.5s ease',
      opacity: fadeOut ? 0 : 1,
      pointerEvents: fadeOut ? 'none' : 'all',
    }}>
      {/* Subtle grid */}
      <div style={{
        position:'absolute', inset:0,
        backgroundImage:'linear-gradient(rgba(15,45,92,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(15,45,92,0.03) 1px, transparent 1px)',
        backgroundSize:'48px 48px', pointerEvents:'none',
      }} />

      {/* Soft glow blobs */}
      <div style={{ position:'absolute', top:'15%', left:'10%', width:400, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(232,99,10,0.06) 0%, transparent 70%)', filter:'blur(60px)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'20%', right:'10%', width:350, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(15,45,92,0.06) 0%, transparent 70%)', filter:'blur(60px)', pointerEvents:'none' }} />

      <div style={{ position:'relative', textAlign:'center', zIndex:1 }}>
        {/* Logo mark */}
        <div style={{ display:'flex', justifyContent:'center', marginBottom:28 }}>
          <div style={{
            width:72, height:72, borderRadius:18,
            background:'#0f2d5c',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 8px 32px rgba(15,45,92,0.25)',
            animation:'loadPulse 2s ease infinite',
          }}>
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
              <rect x="6" y="27" width="26" height="5" rx="2" fill="#e8630a"/>
              <rect x="6" y="16" width="26" height="4" rx="2" fill="rgba(255,255,255,0.5)"/>
              <rect x="6" y="6" width="9" height="22" rx="2" fill="rgba(255,255,255,0.18)"/>
              <rect x="23" y="10" width="9" height="22" rx="2" fill="rgba(255,255,255,0.18)"/>
              <circle cx="19" cy="18" r="3" fill="#16a34a"/>
            </svg>
          </div>
        </div>

        {/* Brand name */}
        <div style={{ fontSize:36, fontWeight:800, fontFamily:"'Plus Jakarta Sans', sans-serif", color:'#0f2d5c', letterSpacing:'5px', marginBottom:4, animation:'fadeUp 0.4s ease both' }}>
          STRUX
        </div>
        <div style={{ fontSize:11, color:'#94a3b8', fontFamily:"'DM Mono', monospace", letterSpacing:'3px', marginBottom:44, animation:'fadeUp 0.4s 0.08s ease both', opacity:0, animationFillMode:'both' }}>
          STRUCTURAL ENGINEERING SUITE
        </div>

        {/* Progress bar */}
        <div style={{ width:300, margin:'0 auto' }}>
          <div style={{ height:3, background:'#e2e8f0', borderRadius:99, overflow:'hidden', marginBottom:14 }}>
            <div style={{
              height:'100%', width:`${progress}%`,
              background:'linear-gradient(90deg, #0f2d5c, #e8630a)',
              borderRadius:99,
              transition:'width 0.38s cubic-bezier(0.22,1,0.36,1)',
              boxShadow:'0 0 8px rgba(232,99,10,0.4)',
            }} />
          </div>

          <div style={{ display:'flex', justifyContent:'space-between' }}>
            <span style={{ fontSize:11, color:'#94a3b8', fontFamily:"'DM Mono', monospace", letterSpacing:'0.3px' }}>
              {STAGES[stage].label}
            </span>
            <span style={{ fontSize:11, color:'#e8630a', fontFamily:"'DM Mono', monospace", fontWeight:700 }}>
              {progress}%
            </span>
          </div>
        </div>

        {/* Stage dots */}
        <div style={{ display:'flex', gap:6, justifyContent:'center', marginTop:28 }}>
          {STAGES.map((_, i) => (
            <div key={i} style={{
              width: i === stage ? 22 : 6, height:6,
              borderRadius:99,
              background: i < stage ? '#16a34a' : i === stage ? '#e8630a' : '#e2e8f0',
              transition:'all 0.3s ease',
            }} />
          ))}
        </div>
      </div>

      {/* Bottom code tags */}
      <div style={{ position:'absolute', bottom:28, display:'flex', gap:8, flexWrap:'wrap', justifyContent:'center' }}>
        {['IS 456:2000','IS 800:2007','IS 2911','IRC:6','IRC:37','IS 2950'].map(code => (
          <span key={code} style={{
            padding:'3px 10px', borderRadius:20,
            border:'1px solid #e2e8f0', background:'#fff',
            color:'#94a3b8', fontSize:10,
            fontFamily:"'DM Mono', monospace", letterSpacing:'0.5px',
          }}>{code}</span>
        ))}
      </div>

      <style>{`
        @keyframes loadPulse { 0%,100%{transform:scale(1);box-shadow:0 8px 32px rgba(15,45,92,0.25)} 50%{transform:scale(1.04);box-shadow:0 12px 40px rgba(15,45,92,0.35)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )
}