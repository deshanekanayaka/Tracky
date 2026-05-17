import { useStore } from '../../store'
import { clearConfig } from '../../utils/storage'

export default function Settings() {
  const { sheetName, queueCount, setScreen, disconnect } = useStore()

  async function handleDisconnect() {
    await clearConfig()
    disconnect()
  }

  function retryQueue() {
    if (typeof chrome !== 'undefined') {
      chrome.runtime.sendMessage({ type: 'RETRY_QUEUE' })
    }
  }

  const rows: Array<{
    label: string
    sub: string
    action: string
    color: string
    onAction?: () => void
  }> = [
    {
      label: 'Connected sheet',
      sub: `${sheetName || 'None'} · Google Sheets`,
      action: 'Change',
      color: '#185FA5',
      onAction: handleDisconnect,
    },
    {
      label: 'Auto-detect',
      sub: 'Watches Apply button clicks',
      action: 'On',
      color: '#16a34a',
    },
    {
      label: 'Keyboard shortcut',
      sub: 'Log without opening popup',
      action: '⌘ Shift L',
      color: '#9ca3af',
    },
    {
      label: 'Offline queue',
      sub: `${queueCount} job${queueCount !== 1 ? 's' : ''} pending sync`,
      action: queueCount > 0 ? 'Retry' : '—',
      color: queueCount > 0 ? '#185FA5' : '#d1d5db',
      onAction: queueCount > 0 ? retryQueue : undefined,
    },
  ]

  return (
    <div style={{ width: 340, backgroundColor: '#ffffff' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: '#0C447C' }}>Settings</span>
        <button
          onClick={() => setScreen('main')}
          aria-label="Close settings"
          style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, color: '#9ca3af', border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}
        >
          <i className="ti ti-x" style={{ fontSize: 14 }} aria-hidden="true" />
        </button>
      </div>

      {/* Rows */}
      <div style={{ padding: '0 16px' }}>
        {rows.map((row) => (
          <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #f9fafb' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{row.label}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{row.sub}</div>
            </div>
            <button
              onClick={row.onAction}
              disabled={!row.onAction}
              style={{ fontSize: 12, fontWeight: 500, border: 'none', backgroundColor: 'transparent', color: row.color, cursor: row.onAction ? 'pointer' : 'default', marginLeft: 16, flexShrink: 0 }}
            >
              {row.action}
            </button>
          </div>
        ))}

        {/* Disconnect */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>Disconnect account</div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Clears all local data</div>
          </div>
          <button
            onClick={handleDisconnect}
            style={{ fontSize: 12, fontWeight: 500, border: 'none', backgroundColor: 'transparent', color: '#ef4444', cursor: 'pointer', marginLeft: 16, flexShrink: 0 }}
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Footer padding per spec */}
      <div style={{ padding: '10px 16px' }} />
    </div>
  )
}