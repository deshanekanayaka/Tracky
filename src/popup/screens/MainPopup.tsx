import React, { useEffect, useMemo, useRef } from 'react'
import { useStore } from '../../store'
import useCurrentJob from '../../hooks/useCurrentJob'
import useLogJob from '../../hooks/useLogJob'
import Logo from '../components/Logo'
import StatCard from '../components/StatCard'
import JobCard from '../components/JobCard'

const STUB_LAST = {
  jobTitle: 'Senior Frontend Engineer',
  company: 'Stripe',
  source: 'linkedin',
  time: '14:32',
}

export default function MainPopup() {
  const { totalLogged, loggedThisWeek, sheetName, queueCount, setScreen, incrementStats } = useStore()

  // Current job via hook (no direct chrome.* here)
  const { job } = useCurrentJob()

  // Logging hook
  const { logState, handleLog } = useLogJob(job)

  // Increment stats once when a successful log completes
  const didIncRef = useRef(false)
  useEffect(() => {
    if (logState === 'done' && !didIncRef.current) {
      incrementStats()
      didIncRef.current = true
    }
  }, [logState, incrementStats])

  const sectionLabelStyle = useMemo(() => ({
    fontSize: 10,
    fontWeight: 600 as const,
    color: '#0C447C',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    marginBottom: 8,
  }), [])

  const headerBtnStyle = useMemo(() => ({
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    color: '#0C447C',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
  } as React.CSSProperties), [])

  return (
    <div style={{ width: 340, minWidth: 340, backgroundColor: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
        <Logo />
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            aria-label="Settings"
            onClick={() => setScreen('settings')}
            style={headerBtnStyle}
          >
            <i className="ti ti-settings" style={{ fontSize: 15, color: '#0C447C' }} aria-hidden="true" />
          </button>
          <button
            aria-label="Open sheet"
            onClick={() => {
              const { sheetId } = useStore.getState()
              if (sheetId) {
                window.open(`https://docs.google.com/spreadsheets/d/${sheetId}`, '_blank')
              }
            }}
            style={headerBtnStyle}
          >
            <i className="ti ti-external-link" style={{ fontSize: 15, color: '#0C447C' }} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Last logged */}
        <div>
          <div style={sectionLabelStyle}>Last logged</div>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: '10px 12px' }}>
            <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>Today, {STUB_LAST.time}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 2 }}>{STUB_LAST.jobTitle}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{STUB_LAST.company} · {STUB_LAST.source}</div>
          </div>
        </div>

        {/* This page */}
        <div>
          <div style={sectionLabelStyle}>This page</div>
          <JobCard job={job} />
        </div>

          {/* Log manually */}
          <button
              onClick={handleLog}
              disabled={logState !== 'idle'}
              style={{
                  width: '100%',
                  height: 40,
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.15s',
                  border:
                      logState === 'done' ? '1px solid #bbf7d0' :
                          logState === 'partial' ? '1px solid #fed7aa' :
                              logState === 'duplicate' ? '1px solid #fcd34d' :
                                  logState === 'queued' ? '1px solid #e5e7eb' :
                                      '1px solid #B5D4F4',
                  backgroundColor:
                      logState === 'done' ? '#f0fdf4' :
                          logState === 'partial' ? '#fff7ed' :
                              logState === 'duplicate' ? '#fffbeb' :
                                  logState === 'queued' ? '#f9fafb' :
                                      '#ffffff',
                  color:
                      logState === 'done' ? '#16a34a' :
                          logState === 'partial' ? '#c2410c' :
                              logState === 'duplicate' ? '#92400e' :
                                  logState === 'queued' ? '#6b7280' :
                                      '#185FA5',
                  cursor: logState !== 'idle' ? 'default' : 'pointer',
                  opacity: logState === 'loading' ? 0.7 : 1,
              }}
          >
              <i
                  className={`ti ${
                      logState === 'done' ? 'ti-check' :
                          logState === 'partial' ? 'ti-alert-triangle' :
                              logState === 'duplicate' ? 'ti-alert-triangle' :
                                  logState === 'queued' ? 'ti-cloud-upload' :
                                      'ti-table-down'
                  }`}
                  style={{ fontSize: 14 }}
                  aria-hidden="true"
              />
              {logState === 'done' ? 'Logged successfully' :
                  logState === 'partial' ? 'Logged with partial data — edit in sheet' :
                      logState === 'duplicate' ? 'Already in your sheet' :
                          logState === 'queued' ? 'Queued — will sync when online' :
                              logState === 'loading' ? 'Logging…' :
                                  'Log manually'}
          </button>


        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <StatCard value={totalLogged} label="Total" />
          <StatCard value={loggedThisWeek} label="This week" />
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: '1px solid #f3f4f6' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#0C447C' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#16a34a', display: 'inline-block', flexShrink: 0 }} />
          {sheetName || 'Not connected'}
        </span>
        <span style={{ fontSize: 11, color: '#0C447C' }}>
          {queueCount > 0 ? `${queueCount} queued` : '✓ synced'}
        </span>
      </div>
    </div>
  )
}