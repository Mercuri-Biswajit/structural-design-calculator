import { useLocation, useNavigate } from 'react-router-dom'
import { C, F } from '@styles/tokens'
import { ROUTES } from '@routes/index'

const CATEGORIES = [
  { label: 'Structural Design', icon: '🏗', ids: ['beam','column','slab','foundation'], accentColor: C.navy },
  { label: 'Roads & Bridges',   icon: '🛣', ids: ['road','bridge'],                    accentColor: '#7c3aed' },
  { label: 'Cost & Reports',    icon: '📊', ids: ['boq','report'],                     accentColor: C.orange },
]

const MODULE_DESCS = {
  beam:       'SFD & BMD analysis',
  column:     'Biaxial bending check',
  slab:       'One & two-way slabs',
  foundation: 'Isolated, raft & pile',
  road:       'Curves & pavement',
  bridge:     'IRC live load analysis',
  boq:        'Material & cost estimate',
  report:     'Excel export & report',
}

export default function HeroHeader() {
  const { pathname } = useLocation()
  const navigate     = useNavigate()
  const route        = ROUTES.find(r => r.path === pathname)

  if (!route || route.id === 'dashboard') return null

  const activeCategory = CATEGORIES.find(cat => cat.ids.includes(route.id)) || CATEGORIES[0]
  const accent = activeCategory.accentColor

  return (
    <div style={{ background:'#ffffff', borderBottom:`1px solid ${C.border}` }}>
      <div style={{ maxWidth:1400, margin:'0 auto' }}>

        {/* ── PAGE TITLE STRIP ─────────────────────────────── */}
        <div style={{
          padding:         '20px 24px 0',
          borderBottom:    `1px solid ${C.border}`,
          background:      '#fff',
        }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            {/* Left: breadcrumb + title */}
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8, fontSize:11, fontFamily:F.mono, color:C.inkLight, letterSpacing:'0.5px' }}>
                <span style={{ color:C.navy, fontWeight:700 }}>STRUX</span>
                <span style={{ opacity:0.4 }}>›</span>
                <span style={{ color:accent, fontWeight:600 }}>{activeCategory.label}</span>
                <span style={{ opacity:0.4 }}>›</span>
                <span>{route.fullLabel}</span>
              </div>

              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{
                  width:40, height:40, borderRadius:10,
                  background: `${accent}14`,
                  border:     `1.5px solid ${accent}28`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:18, color:accent, flexShrink:0,
                }}>
                  {route.icon}
                </div>
                <div>
                  <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:C.navy, letterSpacing:'-0.3px', fontFamily:F.sans, lineHeight:1.1 }}>
                    {route.fullLabel}
                  </h1>
                  <p style={{ margin:'3px 0 0', fontSize:11.5, color:C.inkLight, fontFamily:F.mono }}>
                    {route.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Code badges */}
            {route.codes.length > 0 && (
              <div style={{ display:'flex', gap:5, flexWrap:'wrap', justifyContent:'flex-end' }}>
                {route.codes.map(code => (
                  <span key={code} style={{
                    padding:'3px 10px', borderRadius:5,
                    background: `${accent}10`,
                    border:     `1px solid ${accent}28`,
                    color:      accent,
                    fontSize:10.5, fontFamily:F.mono, fontWeight:700, letterSpacing:'0.5px',
                  }}>{code}</span>
                ))}
              </div>
            )}
          </div>

          {/* ── MODULE TABS ─────────────────────────────────── */}
          <div style={{ display:'flex', gap:0 }}>
            {CATEGORIES.map((cat, ci) => {
              const catRoutes = ROUTES.filter(r => cat.ids.includes(r.id))
              const isCatActive = cat.ids.includes(route.id)

              return (
                <div key={ci} style={{
                  display:'flex', flexDirection:'column',
                  borderRight: ci < CATEGORIES.length - 1 ? `1px solid ${C.border}` : 'none',
                  paddingRight: ci < CATEGORIES.length - 1 ? 0 : 0,
                }}>
                  {/* Category label */}
                  <div style={{
                    padding:'5px 14px 4px',
                    fontSize:9, fontFamily:F.sans, fontWeight:700,
                    color: isCatActive ? cat.accentColor : C.inkFaint,
                    letterSpacing:'1.5px', textTransform:'uppercase',
                    display:'flex', alignItems:'center', gap:4,
                    transition:'color 0.2s',
                  }}>
                    {cat.icon} {cat.label}
                  </div>

                  {/* Route tabs */}
                  <div style={{ display:'flex' }}>
                    {catRoutes.map(r => {
                      const isActive = pathname === r.path
                      return (
                        <button
                          key={r.id}
                          onClick={() => navigate(r.path)}
                          style={{
                            padding:    '8px 16px 12px',
                            background: 'transparent',
                            border:     'none',
                            borderTop:  isActive ? `2.5px solid ${cat.accentColor}` : '2.5px solid transparent',
                            cursor:     'pointer',
                            textAlign:  'left',
                            transition: 'all 0.15s ease',
                            position:   'relative',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:1 }}>
                            <span style={{ fontSize:13 }}>{r.icon}</span>
                            <span style={{
                              fontSize:13, fontWeight: isActive ? 700 : 500,
                              color: isActive ? cat.accentColor : C.inkMid,
                              fontFamily:F.sans, transition:'color 0.15s',
                            }}>
                              {r.label}
                            </span>
                          </div>
                          <div style={{
                            fontSize:9.5,
                            color: isActive ? `${cat.accentColor}90` : C.inkFaint,
                            fontFamily:F.mono, transition:'color 0.15s',
                          }}>
                            {MODULE_DESCS[r.id]}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}