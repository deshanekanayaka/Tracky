import { useState } from 'react'
import { useStore } from '../../store'
import { saveConfig } from '../../utils/storage'
import Logo from '../components/Logo'

export default function Onboarding() {
  const hydrate = useStore((s) => s.hydrate)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hover, setHover] = useState(false)

  async function handleConnect() {
    setLoading(true)
    setError('')
    try {
      const config = {
        isConnected: true as const,
        provider: 'google' as const,
        sheetId: 'stub-id',
        sheetName: 'Job Hunt 2026',
      }
      await saveConfig(config)
      hydrate(config)
    } catch {
      setError('Connection failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ width: 340, backgroundColor: '#ffffff', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header with Tracky logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
        <Logo />
      </div>

      {/* Body */}
      <div style={{ padding: '24px 16px' }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 8 }}>Where to save your applications?</h2>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24, lineHeight: 1.6 }}>Connect once — your data stays in your Google account.</p>
        <button
          onClick={handleConnect}
          disabled={loading}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            width: '100%',
            height: 44,
            backgroundColor: hover && !loading ? '#0C447C' : '#185FA5',
            color: '#ffffff',
            border: 'none',
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: loading ? 'default' : 'pointer',
            transition: 'background-color 0.15s ease',
          }}
        >
          <i className="ti ti-brand-google" style={{ fontSize: 16 }} aria-hidden="true" />
          {loading ? 'Connecting…' : 'Connect with Google'}
        </button>
        {error && <p style={{ fontSize: 12, color: '#ef4444', textAlign: 'center', marginTop: 8 }}>{error}</p>}
        <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', marginTop: 16, lineHeight: 1.6 }}>
          We'll create a sheet automatically. No data stored on any server.
        </p>
      </div>
    </div>
  )
}
