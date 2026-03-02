/**
 * SavePanel  — sits at the top of the right results column on every page.
 * SaveToast  — fixed toast notification.
 */
import { useState, useRef, useEffect } from 'react'
import { C, F } from '@styles/tokens'

// ── SAVE TOAST ────────────────────────────────────────────────
export function SaveToast({ msg }) {
  if (!msg) return null
  const isError   = msg.type === 'error'
  const bgColor   = isError ? C.redLight   : '#f0fdf4'
  const border    = isError ? C.red        : C.green
  const iconColor = isError ? C.red        : C.green
  const icon      = isError ? '✕'         : '✓'

  return (
    <div style={{
      position:     'fixed',
      bottom:       28,
      right:        28,
      zIndex:       9000,
      display:      'flex',
      alignItems:   'center',
      gap:          10,
      padding:      '12px 18px',
      background:   bgColor,
      border:       `1.5px solid ${border}40`,
      borderLeft:   `4px solid ${border}`,
      borderRadius: 10,
      boxShadow:    '0 4px 24px rgba(15,45,92,0.13)',
      fontFamily:   F.sans,
      animation:    'toastIn 0.3s cubic-bezier(0.22,1,0.36,1) both',
      maxWidth:     320,
    }}>
      <div style={{
        width:          22,
        height:         22,
        borderRadius:   '50%',
        background:     border,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        color:          '#fff',
        fontSize:       11,
        fontWeight:     700,
        flexShrink:     0,
      }}>
        {icon}
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color: C.ink, lineHeight: 1.4 }}>
        {msg.text}
      </span>
      <style>{`
        @keyframes toastIn {
          from { opacity:0; transform:translateY(12px) scale(0.96); }
          to   { opacity:1; transform:translateY(0)    scale(1);    }
        }
      `}</style>
    </div>
  )
}

// ── SAVE PANEL ────────────────────────────────────────────────
export function SavePanel({
  moduleLabel,       // e.g. "Beam Design"
  moduleIcon,        // e.g. "━"
  accentColor,       // e.g. C.navy
  projectName,
  setProjectName,
  existingNames,
  onSave,
  isSaving,
  hasData,           // boolean — whether results exist yet
}) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)
  const dropRef   = useRef(null)
  const accent    = accentColor || C.navy

  // Filter suggestions
  const suggestions = existingNames.filter(n =>
    n.toLowerCase().includes(projectName.toLowerCase()) && n !== projectName
  )

  // Close dropdown on outside click
  useEffect(() => {
    const handler = e => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div style={{
      background:   '#fff',
      border:       `1px solid ${C.border}`,
      borderTop:    `3px solid ${accent}`,
      borderRadius: 10,
      padding:      '14px 16px',
      marginBottom: 14,
      boxShadow:    C.shadow,
    }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
        <div style={{
          width:          30,
          height:         30,
          borderRadius:   8,
          background:     `${accent}14`,
          border:         `1px solid ${accent}28`,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          fontSize:       13,
          color:          accent,
          fontFamily:     F.mono,
          flexShrink:     0,
        }}>
          {moduleIcon}
        </div>
        <div>
          <div style={{ fontSize:12, fontWeight:700, color:C.navy, fontFamily:F.sans, lineHeight:1 }}>
            Save to Project
          </div>
          <div style={{ fontSize:10, color:C.inkLight, fontFamily:F.mono, marginTop:2 }}>
            {moduleLabel} · inputs + results + checks
          </div>
        </div>

        {/* Status pill */}
        <div style={{ marginLeft:'auto' }}>
          <span style={{
            padding:      '2px 8px',
            borderRadius: 20,
            background:   hasData ? C.greenLight : C.bgAlt,
            color:        hasData ? C.green : C.inkFaint,
            fontSize:     9.5,
            fontFamily:   F.mono,
            fontWeight:   700,
            letterSpacing:'0.5px',
            border:       `1px solid ${hasData ? C.green + '30' : C.border}`,
          }}>
            {hasData ? '● READY' : '○ NO DATA'}
          </span>
        </div>
      </div>

      {/* Project name input + dropdown */}
      <div ref={dropRef} style={{ position:'relative', marginBottom:10 }}>
        <label style={{
          display:       'block',
          fontSize:      9.5,
          fontFamily:    F.sans,
          fontWeight:    700,
          color:         C.inkLight,
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          marginBottom:  5,
        }}>
          Project Name
        </label>
        <div style={{ position:'relative' }}>
          <input
            type="text"
            value={projectName}
            onChange={e => { setProjectName(e.target.value); setShowDropdown(true) }}
            onFocus={() => { setInputFocused(true); setShowDropdown(true) }}
            onBlur={() => setInputFocused(false)}
            placeholder="e.g. G+3 Residential Block A"
            style={{
              width:        '100%',
              padding:      '8px 34px 8px 11px',
              borderRadius: 7,
              border:       `1.5px solid ${inputFocused ? accent : C.border}`,
              background:   C.bgInput,
              fontFamily:   F.mono,
              fontSize:     12.5,
              color:        C.ink,
              outline:      'none',
              boxShadow:    inputFocused ? `0 0 0 3px ${accent}18` : 'none',
              transition:   'border-color 0.15s, box-shadow 0.15s',
              boxSizing:    'border-box',
            }}
          />
          {/* Folder icon */}
          <span style={{
            position:  'absolute',
            right:     10,
            top:       '50%',
            transform: 'translateY(-50%)',
            fontSize:  14,
            opacity:   0.35,
            pointerEvents: 'none',
          }}>📁</span>
        </div>

        {/* Dropdown suggestions */}
        {showDropdown && suggestions.length > 0 && (
          <div style={{
            position:     'absolute',
            top:          'calc(100% + 4px)',
            left:         0,
            right:        0,
            background:   '#fff',
            border:       `1.5px solid ${C.border}`,
            borderRadius: 8,
            boxShadow:    C.shadowMd,
            zIndex:       100,
            overflow:     'hidden',
            animation:    'fadeUp 0.15s ease both',
          }}>
            <div style={{ padding:'6px 10px 4px', fontSize:9, fontFamily:F.sans, fontWeight:700, color:C.inkFaint, textTransform:'uppercase', letterSpacing:'1px' }}>
              Existing Projects
            </div>
            {suggestions.slice(0, 6).map(name => (
              <button
                key={name}
                onMouseDown={() => { setProjectName(name); setShowDropdown(false) }}
                style={{
                  display:    'flex',
                  alignItems: 'center',
                  gap:        8,
                  width:      '100%',
                  padding:    '8px 12px',
                  background: 'none',
                  border:     'none',
                  cursor:     'pointer',
                  textAlign:  'left',
                  fontSize:   12.5,
                  fontFamily: F.sans,
                  color:      C.ink,
                  borderTop:  `1px solid ${C.border}`,
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = C.bgAlt}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <span style={{ fontSize:12, opacity:0.5 }}>📁</span>
                <span style={{ flex:1 }}>{name}</span>
                <span style={{ fontSize:9.5, color:C.inkFaint, fontFamily:F.mono }}>add module</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Existing projects info */}
      {existingNames.length > 0 && (
        <div style={{
          display:      'flex',
          gap:          5,
          flexWrap:     'wrap',
          marginBottom: 10,
        }}>
          {existingNames.slice(0, 4).map(name => (
            <button
              key={name}
              onClick={() => setProjectName(name)}
              style={{
                padding:      '2px 8px',
                borderRadius: 4,
                border:       `1px solid ${C.border}`,
                background:   projectName === name ? C.navyLight : C.bgAlt,
                color:        projectName === name ? C.navy : C.inkLight,
                fontSize:     10.5,
                fontFamily:   F.mono,
                cursor:       'pointer',
                fontWeight:   projectName === name ? 700 : 400,
                transition:   'all 0.12s',
              }}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {/* Save button */}
      <button
        onClick={onSave}
        disabled={isSaving || !hasData}
        style={{
          width:         '100%',
          padding:       '10px 0',
          borderRadius:  8,
          border:        'none',
          background:    isSaving
            ? C.inkFaint
            : !hasData
            ? C.bgAlt
            : `linear-gradient(135deg, ${accent} 0%, ${accent}cc 100%)`,
          color:         !hasData ? C.inkFaint : '#fff',
          fontSize:      13,
          fontWeight:    700,
          fontFamily:    F.sans,
          cursor:        isSaving || !hasData ? 'not-allowed' : 'pointer',
          display:       'flex',
          alignItems:    'center',
          justifyContent:'center',
          gap:           7,
          boxShadow:     hasData && !isSaving ? `0 3px 12px ${accent}35` : 'none',
          transition:    'all 0.18s ease',
          letterSpacing: '0.2px',
        }}
      >
        {isSaving ? (
          <>
            <span style={{ display:'inline-block', width:13, height:13, border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
            Saving…
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2h7.5L12 4.5V12a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.4" fill="none"/>
              <rect x="4" y="8" width="6" height="4" rx="0.5" fill="currentColor" opacity="0.5"/>
              <rect x="4" y="2" width="5" height="3" rx="0.5" fill="currentColor" opacity="0.5"/>
            </svg>
            {hasData ? 'Save to Dashboard' : 'Run calculation first'}
          </>
        )}
      </button>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )
}