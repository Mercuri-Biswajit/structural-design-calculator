import { useState, useCallback } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { C, F } from '@styles/tokens'
import { DEFAULT_PATH } from '@routes/index'
import Navbar        from '@components/Navbar'
import LoadingScreen from '@components/LoadingScreen'
import HeroHeader    from '@components/HeroHeader'

import BeamPage       from '@pages/BeamPage'
import ColumnPage     from '@pages/ColumnPage'
import SlabPage       from '@pages/SlabPage'
import FoundationPage from '@pages/FoundationPage'
import RoadPage       from '@pages/RoadPage'
import { BridgePage, BOQPage, ReportPage } from '@pages/OtherPages'
import DashboardPage  from '@pages/DashboardPage'

export default function App() {
  const [loaded,  setLoaded]  = useState(false)
  const [allData, setAllData] = useState({})

  const onDataChange = useCallback((pageId, data) => {
    setAllData(prev => ({ ...prev, [pageId]: data }))
  }, [])

  return (
    <>
      {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}

      <div style={{
        background: C.bg,
        minHeight:  '100vh',
        fontFamily: F.sans,
        opacity:    loaded ? 1 : 0,
        transition: 'opacity 0.4s ease 0.1s',
      }}>
        <Navbar />
        <HeroHeader />

        <main style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ padding: '24px 24px 72px' }}>
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
              <Route path="/dashboard"  element={<DashboardPage  allData={allData} />} />
              <Route path="*"           element={<Navigate to={DEFAULT_PATH} replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </>
  )
}