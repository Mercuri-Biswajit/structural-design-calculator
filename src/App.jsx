import { useState, useCallback } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { C, F, badge } from '@styles/tokens'
import { ROUTES, DEFAULT_PATH } from '@routes/index'
import Navbar from '@components/Navbar'

import BeamPage       from '@pages/BeamPage'
import ColumnPage     from '@pages/ColumnPage'
import SlabPage       from '@pages/SlabPage'
import FoundationPage from '@pages/FoundationPage'
import RoadPage       from '@pages/RoadPage'
import { BridgePage, BOQPage, ReportPage } from '@pages/OtherPages'

// ── PAGE HEADER ───────────────────────────────────────────────
function PageHeader() {
  const { pathname } = useLocation()
  const route = ROUTES.find(r => r.path === pathname)
  if (!route) return null

  const accent = route.color || C.green

  return (
    <div style={{
      maxWidth:  1400,
      margin:    '0 auto',
      padding:   '24px 24px 0',
      animation: 'fadeUp 0.3s ease both',
    }}>
      {/* Breadcrumb */}
      <div style={{
        display:    'flex',
        alignItems: 'center',
        gap:        6,
        marginBottom: 10,
        fontSize:   11,
        fontFamily: F.mono,
        color:      C.inkFaint,
        letterSpacing: '0.5px',
      }}>
        <span>STRUX</span>
        <span style={{ opacity: 0.4 }}>›</span>
        <span style={{ color: accent }}>{route.fullLabel}</span>
      </div>

      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        {/* Colored icon pip */}
        <div style={{
          width:          40,
          height:         40,
          borderRadius:   9,
          background:     accent + '14',
          border:         `1.5px solid ${accent}28`,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          fontSize:       17,
          color:          accent,
          flexShrink:     0,
        }}>
          {route.icon}
        </div>

        <div style={{ flex: 1 }}>
          <h1 style={{
            margin:        0,
            fontSize:      22,
            fontFamily:    F.sans,
            fontWeight:    800,
            color:         C.ink,
            letterSpacing: '-0.3px',
            lineHeight:    1.1,
          }}>
            {route.fullLabel}
          </h1>
          <p style={{
            margin:        '3px 0 0',
            fontSize:      12,
            color:         C.inkLight,
            fontFamily:    F.mono,
            letterSpacing: '0.1px',
          }}>
            {route.description}
          </p>
        </div>

        {/* Code badges */}
        {route.codes.length > 0 && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {route.codes.map(code => (
              <span key={code} style={badge(accent, accent + '14')}>
                {code}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Full-width rule — single green stroke, clean */}
      <div style={{
        height:     1.5,
        background: `linear-gradient(to right, ${accent} 0%, ${accent}50 20%, ${C.border} 60%, transparent 100%)`,
        marginBottom: 0,
      }} />
    </div>
  )
}

// ── APP ───────────────────────────────────────────────────────
export default function App() {
  const [allData, setAllData] = useState({})

  const onDataChange = useCallback((pageId, data) => {
    setAllData(prev => ({ ...prev, [pageId]: data }))
  }, [])

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: F.sans }}>
      <Navbar />

      <main style={{ maxWidth: 1400, margin: '0 auto' }}>
        <PageHeader />
        <div style={{ padding: '20px 24px 72px' }}>
          <Routes>
            <Route path="/"           element={<Navigate to={DEFAULT_PATH} replace />} />
            <Route path="/beam"       element={<BeamPage       onDataChange={d => onDataChange('beam',       d)} />} />
            <Route path="/column"     element={<ColumnPage     onDataChange={d => onDataChange('column',     d)} />} />
            <Route path="/slab"       element={<SlabPage       onDataChange={d => onDataChange('slab',       d)} />} />
            <Route path="/foundation" element={<FoundationPage onDataChange={d => onDataChange('foundation', d)} />} />
            <Route path="/road"       element={<RoadPage       onDataChange={d => onDataChange('road',       d)} />} />
            <Route path="/bridge"     element={<BridgePage     onDataChange={d => onDataChange('bridge',     d)} />} />
            <Route path="/boq"        element={<BOQPage        onDataChange={d => onDataChange('boq',        d)} />} />
            <Route path="/report"     element={<ReportPage     allData={allData} />} />
            <Route path="*"           element={<Navigate to={DEFAULT_PATH} replace />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}